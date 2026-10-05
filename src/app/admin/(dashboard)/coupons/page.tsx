import { prisma } from "@/lib/prisma";
import { toggleCoupon, updateCoupon } from "@/server/actions/coupons";
import { SavableForm } from "@/components/admin/SavableForm";
import { CreateCouponForm } from "@/components/admin/CreateCouponForm";
import { DeleteCouponButton } from "@/components/admin/DeleteCouponButton";

export default async function AdminCouponsPage() {
  const [coupons, affiliates] = await Promise.all([
    prisma.coupon.findMany({
      include: { affiliate: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.affiliate.findMany({ where: { status: "APPROVED" }, include: { user: true } }),
  ]);

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
                  <details className="mb-2">
                    <summary className="cursor-pointer text-xs underline">עריכה</summary>
                    <SavableForm action={updateCoupon.bind(null, c.id)} className="mt-2 w-56 space-y-1" buttonClassName="rounded bg-neutral-900 px-3 py-1.5 text-xs text-white disabled:opacity-50">
                      <select name="discountType" defaultValue={c.discountType} className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs">
                        <option value="PERCENTAGE">אחוז</option>
                        <option value="FIXED">סכום קבוע (₪)</option>
                      </select>
                      <input name="discountValue" type="number" step="0.01" min="0" defaultValue={Number(c.discountValue)} aria-label="ערך הנחה" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                      <input name="usageLimit" type="number" min="1" defaultValue={c.usageLimit ?? ""} placeholder="מגבלת שימושים" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                      <input name="expiresAt" type="date" defaultValue={c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : ""} aria-label="תפוגה" className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs" />
                    </SavableForm>
                  </details>
                  <DeleteCouponButton id={c.id} />
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

      <CreateCouponForm affiliates={affiliates} />
    </div>
  );
}
