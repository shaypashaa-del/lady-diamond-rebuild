import { prisma } from "@/lib/prisma";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/server/actions/coupons";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    include: { affiliate: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">קופונים</h1>

      <div className="mb-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">קוד</th>
              <th className="px-4 py-3 font-medium">הנחה</th>
              <th className="px-4 py-3 font-medium">שימושים</th>
              <th className="px-4 py-3 font-medium">שותף</th>
              <th className="px-4 py-3 font-medium">פעיל</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium" dir="ltr">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType === "PERCENTAGE" ? `${Number(c.discountValue)}%` : `${Number(c.discountValue)} ₪`}
                </td>
                <td className="px-4 py-3">
                  {c.usageCount}
                  {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">{c.affiliate?.user.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <form action={toggleCoupon.bind(null, c.id, !c.isActive)}>
                    <button type="submit" className={c.isActive ? "text-emerald-600" : "text-neutral-400"}>
                      {c.isActive ? "פעיל" : "כבוי"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteCoupon.bind(null, c.id)}>
                    <button type="submit" className="text-xs text-rose-600 hover:underline">
                      מחיקה
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  אין קופונים עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">קופון חדש</h2>
      <form action={createCoupon} className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        <input name="code" placeholder="קוד" required dir="ltr" className="border border-neutral-300 px-3 py-2 text-sm" />
        <select name="discountType" className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="PERCENTAGE">אחוז הנחה</option>
          <option value="FIXED">סכום קבוע</option>
        </select>
        <input name="discountValue" type="number" step="0.01" placeholder="ערך" required className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="usageLimit" type="number" placeholder="מגבלת שימושים" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="expiresAt" type="date" className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
        <button type="submit" className="col-span-2 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          יצירת קופון
        </button>
      </form>
    </div>
  );
}
