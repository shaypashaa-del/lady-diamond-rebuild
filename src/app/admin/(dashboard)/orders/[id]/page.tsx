import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOrderFulfillment } from "@/server/actions/order-management";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, affiliate: { include: { user: true } }, commission: true, coupon: true },
  });
  if (!order) notFound();

  const billing = order.billingAddress as {
    fullName: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    apartment?: string;
    zip?: string;
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">הזמנה {order.orderNumber}</h1>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">פריטים</h2>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-2">{item.nameSnapshot}</td>
                    <td className="py-2 text-neutral-500">× {item.quantity}</td>
                    <td className="py-2 text-end">{Number(item.lineTotal).toFixed(2)} ₪</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 space-y-1 border-t border-neutral-200 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">סכום ביניים</span>
                <span>{Number(order.subtotal).toFixed(2)} ₪</span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">הנחה{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                  <span>-{Number(order.discountTotal).toFixed(2)} ₪</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">משלוח</span>
                <span>{Number(order.shippingTotal).toFixed(2)} ₪</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>סה&quot;כ</span>
                <span>{Number(order.total).toFixed(2)} ₪</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">פרטי לקוח ומשלוח</h2>
            <p className="text-sm">{billing.fullName}</p>
            <p className="text-sm text-neutral-500" dir="ltr">{order.email}</p>
            <p className="text-sm text-neutral-500" dir="ltr">{billing.phone}</p>
            <p className="mt-2 text-sm text-neutral-500">
              {billing.street} {billing.apartment}, {billing.city}, {billing.country} {billing.zip}
            </p>
            {order.affiliate && (
              <p className="mt-3 text-sm">
                שותף מפנה: <span className="font-medium">{order.affiliate.user.name}</span> ({order.affiliate.code})
                {order.commission && (
                  <span className="text-neutral-500"> — עמלה: {Number(order.commission.amount).toFixed(2)} ₪ ({order.commission.status})</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">ניהול הזמנה</h2>
            <form action={updateOrderFulfillment.bind(null, order.id)} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">סטטוס הזמנה</label>
                <select name="status" defaultValue={order.status} className="w-full border border-neutral-300 px-3 py-2 text-sm">
                  <option value="PENDING">ממתינה</option>
                  <option value="PROCESSING">בטיפול</option>
                  <option value="SHIPPED">נשלחה</option>
                  <option value="COMPLETED">הושלמה</option>
                  <option value="CANCELLED">בוטלה</option>
                  <option value="REFUNDED">זוכתה</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">סטטוס תשלום</label>
                <select name="paymentStatus" defaultValue={order.paymentStatus} className="w-full border border-neutral-300 px-3 py-2 text-sm">
                  <option value="PENDING">ממתין</option>
                  <option value="PAID">שולם</option>
                  <option value="FAILED">נכשל</option>
                  <option value="REFUNDED">זוכה</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">מספר מעקב משלוח</label>
                <input
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  dir="ltr"
                  className="w-full border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" className="w-full rounded bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
                שמירת עדכון
              </button>
            </form>
            <p className="mt-3 text-xs text-neutral-400">
              ביטול/זיכוי הזמנה עם שותף מפנה יבטל אוטומטית עמלה שממתינה לאישור.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
