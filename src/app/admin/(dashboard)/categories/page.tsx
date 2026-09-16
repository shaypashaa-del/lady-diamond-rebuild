import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "@/server/actions/categories";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { ConfirmDeleteForm } from "@/components/admin/ConfirmDeleteForm";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">קטגוריות</h1>
        <Link
          href="/admin/categories/new"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + קטגוריה חדשה
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">כתובת URL</th>
              <th className="px-4 py-3 font-medium">מוצרים</th>
              <th className="px-4 py-3 font-medium">סדר</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/categories/${c.id}`} className="font-medium hover:underline">
                    {localize(c.name as LocalizedText, "he")}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500" dir="ltr">
                  /category/{c.slug}
                </td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3">{c.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs">
                    <Link href={`/admin/categories/${c.id}`} className="text-blue-600 hover:underline">
                      עריכה
                    </Link>
                    <ConfirmDeleteForm
                      action={deleteCategory.bind(null, c.id)}
                      confirmMessage={
                        c._count.products > 0
                          ? `הקטגוריה "${localize(c.name as LocalizedText, "he")}" משויכת ל-${c._count.products} מוצר/ים. מחיקתה תסיר את השיוך מהמוצרים (הם לא יימחקו). להמשיך?`
                          : `למחוק את הקטגוריה "${localize(c.name as LocalizedText, "he")}"?`
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  אין קטגוריות עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
