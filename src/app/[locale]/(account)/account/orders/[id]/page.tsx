import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
  REFUNDED: "זוכתה",
};

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCustomerSession();
  const t = await getTranslations("OrderDetail");

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  // Only the order's own owner may view it.
  if (!order || order.userId !== session.userId) notFound();

  const address = order.shippingAddress as {
    fullName: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    apartment?: string;
    zip?: string;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <h1 className="mb-1 text-xl font-semibold uppercase tracking-wide">
        {t("title")} {order.orderNumber}
      </h1>
      <p className="mb-8 text-sm text-neutral-500">
        {order.createdAt.toLocaleDateString("he-IL")} · {statusLabels[order.status]}
      </p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
        {t("items")}
      </h2>
      <ul className="mb-6 divide-y divide-neutral-200 border-y border-neutral-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3 text-sm">
            <span>{item.nameSnapshot} × {item.quantity}</span>
            <span>{Number(item.lineTotal).toFixed(2)} ₪</span>
          </li>
        ))}
      </ul>

      <div className="mb-8 space-y-1 text-sm">
        <div className="flex justify-between text-neutral-500">
          <span>{t("subtotal")}</span>
          <span>{Number(order.subtotal).toFixed(2)} ₪</span>
        </div>
        {Number(order.discountTotal) > 0 && (
          <div className="flex justify-between text-neutral-500">
            <span>{t("discount")}</span>
            <span>-{Number(order.discountTotal).toFixed(2)} ₪</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-500">
          <span>{t("shipping")}</span>
          <span>{Number(order.shippingTotal).toFixed(2)} ₪</span>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-1 font-semibold">
          <span>{t("total")}</span>
          <span>{Number(order.total).toFixed(2)} ₪</span>
        </div>
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-700">
        {t("shippingAddress")}
      </h2>
      <p className="mb-6 text-sm text-neutral-600">
        {address.fullName}
        <br />
        {address.street} {address.apartment}, {address.city}, {address.country} {address.zip}
      </p>

      {order.trackingNumber && (
        <p className="mb-6 text-sm">
          <span className="font-semibold">{t("tracking")}:</span> {order.trackingNumber}
        </p>
      )}
    </div>
  );
}
