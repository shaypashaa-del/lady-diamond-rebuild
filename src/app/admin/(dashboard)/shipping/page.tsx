import { prisma } from "@/lib/prisma";
import { deleteShippingRule, toggleShippingRule, updateShippingRule } from "@/server/actions/shipping";
import { SavableForm } from "@/components/admin/SavableForm";
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
                  <details className="mb-2">
                    <summary className="cursor-pointer text-xs underline">עריכה</summary>
                    <SavableForm action={updateShippingRule.bind(null, r.id)} className="mt-2 w-56 space-y-1" buttonClassName="rounded bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50">
                      <input name="name" defaultValue={r.name} required aria-label="שם" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                      <input name="price" type="number" step="0.01" min="0" defaultValue={Number(r.price)} aria-label="מחיר" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                      <input name="minOrderValue" type="number" step="0.01" min="0" defaultValue={r.minOrderValue != null ? Number(r.minOrderValue) : ""} placeholder="סכום מינימום" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                      <input name="country" dir="ltr" defaultValue={r.country ?? ""} placeholder="מדינה (IL)" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                    </SavableForm>
                  </details>
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
