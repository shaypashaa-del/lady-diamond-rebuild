import { prisma } from "@/lib/prisma";
import { approveCommission, rejectCommission, payoutAffiliate } from "@/server/actions/commissions";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  APPROVED: "מאושרת",
  PAID: "שולמה",
  REJECTED: "נדחתה",
};

export default async function AdminCommissionsPage() {
  const [commissions, payouts] = await Promise.all([
    prisma.commission.findMany({
      include: { affiliate: { include: { user: true } }, order: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payout.findMany({
      include: { affiliate: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Group approved-but-unpaid commissions by affiliate so admin can pay out per-affiliate.
  const approvedByAffiliate = new Map<string, { name: string; total: number }>();
  for (const c of commissions) {
    if (c.status !== "APPROVED") continue;
    const existing = approvedByAffiliate.get(c.affiliateId) ?? { name: c.affiliate.user.name, total: 0 };
    existing.total += Number(c.amount);
    approvedByAffiliate.set(c.affiliateId, existing);
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">עמלות ותשלומים</h1>

      {approvedByAffiliate.size > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
            מוכן לתשלום
          </h2>
          <div className="flex flex-wrap gap-3">
            {[...approvedByAffiliate.entries()].map(([affiliateId, info]) => (
              <form key={affiliateId} action={payoutAffiliate.bind(null, affiliateId)} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
                <span className="text-sm">
                  {info.name}: <span className="font-semibold">{info.total.toFixed(2)} ₪</span>
                </span>
                <button type="submit" className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800">
                  סמן כשולם
                </button>
              </form>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">כל העמלות</h2>
      <div className="mb-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שותף</th>
              <th className="px-4 py-3 font-medium">הזמנה</th>
              <th className="px-4 py-3 font-medium">סכום</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">{c.affiliate.user.name}</td>
                <td className="px-4 py-3">{c.order.orderNumber}</td>
                <td className="px-4 py-3">{Number(c.amount).toFixed(2)} ₪</td>
                <td className="px-4 py-3">{statusLabels[c.status]}</td>
                <td className="px-4 py-3">
                  {c.status === "PENDING" && (
                    <div className="flex gap-2 text-xs">
                      <form action={approveCommission.bind(null, c.id)}>
                        <button type="submit" className="text-emerald-600 hover:underline">
                          אישור
                        </button>
                      </form>
                      <form action={rejectCommission.bind(null, c.id)}>
                        <button type="submit" className="text-rose-600 hover:underline">
                          דחייה
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  אין עמלות עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">היסטוריית תשלומים</h2>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שותף</th>
              <th className="px-4 py-3 font-medium">סכום</th>
              <th className="px-4 py-3 font-medium">תאריך תשלום</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">{p.affiliate.user.name}</td>
                <td className="px-4 py-3">{Number(p.amount).toFixed(2)} ₪</td>
                <td className="px-4 py-3 text-neutral-500">{p.paidAt?.toLocaleDateString("he-IL") ?? "—"}</td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                  אין תשלומים עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
