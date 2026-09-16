import { prisma } from "@/lib/prisma";
import { deleteShippingRule, toggleShippingRule } from "@/server/actions/shipping";
import { CreateShippingRuleForm } from "@/components/admin/CreateShippingRuleForm";

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

      <CreateShippingRuleForm />
    </div>
  );
}
