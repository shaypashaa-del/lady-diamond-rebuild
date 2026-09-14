import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct, duplicateProduct } from "@/server/actions/products";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";

const statusLabels: Record<string, string> = {
  DRAFT: "טיוטה",
  PUBLISHED: "פורסם",
  ARCHIVED: "בארכיון",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

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
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                    {localize(p.name as LocalizedText, "he")}
                  </Link>
                  <p className="text-xs text-neutral-400">{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {p.categories[0] ? localize(p.categories[0].category.name as LocalizedText, "he") : "—"}
                </td>
                <td className="px-4 py-3">{Number(p.basePrice).toFixed(2)} ₪</td>
                <td className="px-4 py-3">{p.inventory}</td>
                <td className="px-4 py-3">{statusLabels[p.status]}</td>
                <td className="px-4 py-3">{p.isFeatured ? "כן" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs">
                    <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline">
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
    </div>
  );
}
