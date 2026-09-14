import { prisma } from "@/lib/prisma";
import { createShippingRule, deleteShippingRule, toggleShippingRule } from "@/server/actions/shipping";

const typeLabels: Record<string, string> = {
  FREE: "משלוח חינם",
  FLAT_RATE: "תעריף אחיד",
  BY_COUNTRY: "לפי מדינה",
  BY_ORDER_VALUE: "לפי סכום הזמנה",
};

export default async function AdminShippingPage() {
  const rules = await prisma.shippingRule.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">הגדרות משלוח</h1>

      <div className="mb-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">סוג</th>
              <th className="px-4 py-3 font-medium">מחיר</th>
              <th className="px-4 py-3 font-medium">פעיל</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{typeLabels[r.type]}</td>
                <td className="px-4 py-3">{Number(r.price).toFixed(2)} ₪</td>
                <td className="px-4 py-3">
                  <form action={toggleShippingRule.bind(null, r.id, !r.isActive)}>
                    <button type="submit" className={r.isActive ? "text-emerald-600" : "text-neutral-400"}>
                      {r.isActive ? "פעיל" : "כבוי"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteShippingRule.bind(null, r.id)}>
                    <button type="submit" className="text-xs text-rose-600 hover:underline">
                      מחיקה
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  אין חוקי משלוח. ברירת המחדל: משלוח חינם לכולם.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">כלל חדש</h2>
      <form action={createShippingRule} className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-5">
        <input name="name" placeholder="שם" required className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
        <select name="type" className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="FREE">משלוח חינם</option>
          <option value="FLAT_RATE">תעריף אחיד</option>
          <option value="BY_COUNTRY">לפי מדינה</option>
          <option value="BY_ORDER_VALUE">לפי סכום הזמנה</option>
        </select>
        <input name="country" placeholder="מדינה (אם רלוונטי)" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="minOrderValue" type="number" placeholder="סכום מינימלי" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="price" type="number" step="0.01" placeholder="מחיר" className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
        <button type="submit" className="col-span-2 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          הוספת כלל
        </button>
      </form>
    </div>
  );
}
