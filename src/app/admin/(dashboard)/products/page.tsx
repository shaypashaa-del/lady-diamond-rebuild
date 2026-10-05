import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct, duplicateProduct, quickUpdateProductPrice } from "@/server/actions/products";
import { SavableForm } from "@/components/admin/SavableForm";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { AdminPager } from "@/components/admin/AdminPager";
import { getListingPrices } from "@/server/pricing/listing-prices";
import { formatIls } from "@/lib/format-price";

const PAGE_SIZE = 50;

const statusLabels: Record<string, string> = {
  DRAFT: "טיוטה",
  PUBLISHED: "פורסם",
  ARCHIVED: "בארכיון",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const parsedPage = Number.parseInt(pageRaw ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      include: { categories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  // Configurable products are priced from metal/diamond/costs; show the price
  // the shop really charges (VAT included), not the unused placeholder.
  const livePrices = await getListingPrices();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">מוצרים</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + מוצר חדש
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">קטגוריה</th>
              <th className="px-4 py-3 font-medium">מחיר</th>
              <th className="px-4 py-3 font-medium">מלאי</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium">מומלץ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="block font-medium hover:underline">
                    {localize(p.name as LocalizedText, "he")}
                  </Link>
                  <p className="text-xs text-neutral-400">{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {p.categories[0] ? localize(p.categories[0].category.name as LocalizedText, "he") : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.pricingMode === "CONFIGURABLE" ? (
                    <div>
                      <div>{livePrices.has(p.id) ? `${formatIls(livePrices.get(p.id)!)} ₪` : "—"}</div>
                      <Link href={`/admin/products/${p.id}`} className="text-xs text-neutral-500 underline">
                        אוטומטי, עריכת תמחור
                      </Link>
                    </div>
                  ) : (
                    <SavableForm
                      action={quickUpdateProductPrice.bind(null, p.id)}
                      className="flex flex-col gap-1"
                      submitLabel="שמירה"
                      buttonClassName="w-fit rounded bg-neutral-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    >
                      <div className="flex items-center gap-1">
                        <input
                          name="basePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={Number(p.basePrice)}
                          aria-label="מחיר"
                          className="w-24 rounded border border-neutral-300 px-2 py-1 text-sm"
                        />
                        <span className="text-xs text-neutral-500">₪</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          name="salePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={p.salePrice != null ? Number(p.salePrice) : ""}
                          placeholder="מבצע"
                          aria-label="מחיר מבצע"
                          className="w-24 rounded border border-neutral-300 px-2 py-1 text-xs"
                        />
                        <span className="text-xs text-neutral-500">₪ מבצע</span>
                      </div>
                    </SavableForm>
                  )}
                </td>
                <td className="px-4 py-3">{p.inventory}</td>
                <td className="px-4 py-3">{statusLabels[p.status]}</td>
                <td className="px-4 py-3">{p.isFeatured ? "כן" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs">
                    <Link href={`/admin/products/${p.id}`} className="block text-blue-600 hover:underline">
                      עריכה
                    </Link>
                    <form action={duplicateProduct.bind(null, p.id)}>
                      <button type="submit" className="text-neutral-500 hover:underline">
                        שכפול
                      </button>
                    </form>
                    <form action={deleteProduct.bind(null, p.id)}>
                      <button type="submit" className="text-rose-600 hover:underline">
                        מחיקה
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  אין מוצרים עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPager page={page} totalPages={totalPages} basePath="/admin/products" />
    </div>
  );
}
