import { prisma } from "@/lib/prisma";
import { toggleCoupon, deleteCoupon } from "@/server/actions/coupons";
import { CreateCouponForm } from "@/components/admin/CreateCouponForm";

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

      <CreateCouponForm affiliates={affiliates} />
    </div>
  );
}
