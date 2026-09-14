import {
  approveAffiliate,
  rejectAffiliate,
  suspendAffiliate,
  reactivateAffiliate,
  updateAffiliateCommission,
} from "@/server/actions/affiliate";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "ממתין לאישור",
  APPROVED: "מאושר",
  REJECTED: "נדחה",
  SUSPENDED: "מושעה",
};

export default async function AdminAffiliatesPage() {
  const affiliates = await prisma.affiliate.findMany({
    include: {
      user: true,
      _count: { select: { clicks: true, orders: true, commissions: true } },
    },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">שותפים (Affiliates)</h1>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">קוד</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium">רמה</th>
              <th className="px-4 py-3 font-medium">כניסות</th>
              <th className="px-4 py-3 font-medium">הזמנות</th>
              <th className="px-4 py-3 font-medium">עמלה מותאמת (%)</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{a.user.name}</p>
                  <p className="text-xs text-neutral-400" dir="ltr">{a.user.email}</p>
                </td>
                <td className="px-4 py-3" dir="ltr">{a.code}</td>
                <td className="px-4 py-3">{statusLabels[a.status]}</td>
                <td className="px-4 py-3">{a.tier}</td>
                <td className="px-4 py-3">{a._count.clicks}</td>
                <td className="px-4 py-3">{a._count.orders}</td>
                <td className="px-4 py-3">
                  <form action={updateAffiliateCommission.bind(null, a.id)} className="flex items-center gap-1">
                    <input
                      name="commissionOverride"
                      type="number"
                      step="0.1"
                      defaultValue={a.commissionOverride != null ? Number(a.commissionOverride) : undefined}
                      className="w-16 border border-neutral-300 px-2 py-1 text-xs"
                    />
                    <select name="tier" defaultValue={a.tier} className="border border-neutral-300 px-1 py-1 text-xs">
                      <option value="BRONZE">Bronze</option>
                      <option value="SILVER">Silver</option>
                      <option value="GOLD">Gold</option>
                      <option value="DIAMOND">Diamond</option>
                    </select>
                    <button type="submit" className="text-xs text-blue-600 hover:underline">
                      שמירה
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    {a.status === "PENDING" && (
                      <>
                        <form action={approveAffiliate.bind(null, a.id)}>
                          <button type="submit" className="text-emerald-600 hover:underline">
                            אישור
                          </button>
                        </form>
                        <form action={rejectAffiliate.bind(null, a.id)}>
                          <button type="submit" className="text-rose-600 hover:underline">
                            דחייה
                          </button>
                        </form>
                      </>
                    )}
                    {a.status === "APPROVED" && (
                      <form action={suspendAffiliate.bind(null, a.id)}>
                        <button type="submit" className="text-rose-600 hover:underline">
                          השעיה
                        </button>
                      </form>
                    )}
                    {a.status === "SUSPENDED" && (
                      <form action={reactivateAffiliate.bind(null, a.id)}>
                        <button type="submit" className="text-emerald-600 hover:underline">
                          הפעלה מחדש
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                  אין בקשות שותפים עדיין.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
