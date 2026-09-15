import { prisma } from "@/lib/prisma";
import { createTag, deleteTag } from "@/server/actions/tags";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { slug: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">תגיות</h1>

      <div className="mb-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">מוצרים</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{localize(tag.name as LocalizedText, "he")}</td>
                <td className="px-4 py-3">{tag._count.products}</td>
                <td className="px-4 py-3">
                  <form action={deleteTag.bind(null, tag.id)}>
                    <button type="submit" className="text-xs text-rose-600 hover:underline">
                      מחיקה
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {tags.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                  אין תגיות עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">תגית חדשה</h2>
      <form action={createTag} className="grid max-w-xl grid-cols-3 gap-3">
        <input name="name_he" placeholder="עברית" required className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="name_en" placeholder="English" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="name_ru" placeholder="Русский" className="border border-neutral-300 px-3 py-2 text-sm" />
        <button type="submit" className="col-span-3 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          יצירת תגית
        </button>
      </form>
    </div>
  );
}
