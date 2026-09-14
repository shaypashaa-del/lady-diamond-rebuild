import Link from "next/link";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
  REFUNDED: "זוכתה",
};

const paymentLabels: Record<string, string> = {
  PENDING: "ממתין",
  PAID: "שולם",
  FAILED: "נכשל",
  REFUNDED: "זוכה",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { affiliate: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">הזמנות</h1>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">מספר הזמנה</th>
              <th className="px-4 py-3 font-medium">לקוח</th>
              <th className="px-4 py-3 font-medium">סכום</th>
              <th className="px-4 py-3 font-medium">שותף</th>
              <th className="px-4 py-3 font-medium">תשלום</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.email}</td>
                <td className="px-4 py-3">{Number(o.total).toFixed(2)} ₪</td>
                <td className="px-4 py-3">{o.affiliate?.code ?? "—"}</td>
                <td className="px-4 py-3">{paymentLabels[o.paymentStatus]}</td>
                <td className="px-4 py-3">{statusLabels[o.status]}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {o.createdAt.toLocaleDateString("he-IL")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  אין הזמנות עדיין. (ה-Checkout טרם חובר לתשלום אמיתי — Phase 7)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
