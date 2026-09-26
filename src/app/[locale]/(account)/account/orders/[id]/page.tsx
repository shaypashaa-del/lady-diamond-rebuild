import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.5" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.5" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

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
      <DiamondMark className="h-7 w-7 text-gold-bright" />
      <h1 className="mt-3 mb-1 text-xl font-semibold uppercase tracking-wide">
        {t("title")} {order.orderNumber}
      </h1>
      <p className="mb-8 text-sm text-ink/60">
        {order.createdAt.toLocaleDateString("he-IL")} · {t(`status_${order.status}`)}
      </p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/70">
        {t("items")}
      </h2>
      <ul className="mb-6 divide-y divide-gold-soft border-y border-gold-soft">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3 text-sm">
            <span>{item.nameSnapshot} × {item.quantity}</span>
            <span>{Number(item.lineTotal).toFixed(2)} ₪</span>
          </li>
        ))}
      </ul>

      <div className="mb-8 space-y-1 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>{t("subtotal")}</span>
          <span>{Number(order.subtotal).toFixed(2)} ₪</span>
        </div>
        {Number(order.discountTotal) > 0 && (
          <div className="flex justify-between text-ink/60">
            <span>{t("discount")}</span>
            <span>-{Number(order.discountTotal).toFixed(2)} ₪</span>
          </div>
        )}
        <div className="flex justify-between text-ink/60">
          <span>{t("shipping")}</span>
          <span>{Number(order.shippingTotal).toFixed(2)} ₪</span>
        </div>
        <div className="flex justify-between border-t border-gold-soft pt-1 font-semibold">
          <span>{t("total")}</span>
          <span>{Number(order.total).toFixed(2)} ₪</span>
        </div>
      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/70">
        {t("shippingAddress")}
      </h2>
      <p className="mb-6 text-sm text-ink/60">
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
