import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.5" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.5" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const t = await getTranslations("OrderConfirmation");
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) notFound();

  // The order number is an unguessable bearer token for guest checkouts, but
  // once an order is tied to an account it should only be viewable by that
  // account — not by anyone who happens to have (or brute-forces) the link.
  const session = await getSession();
  if (order.userId && session?.userId !== order.userId) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-8">
      <DiamondMark className="mx-auto h-8 w-8 text-gold-bright" />
      <h1 className="mt-4 mb-6 text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>

      <div className="mb-6 border border-gold-soft p-5 text-start">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">{t("orderNumber")}</span>
          <span className="font-medium" dir="ltr">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between border-t border-gold-soft py-2 text-sm font-semibold">
          <span>{t("total")}</span>
          <span>{Number(order.total).toFixed(2)} ₪</span>
        </div>
      </div>

      {order.paymentInstructions && (
        <div className="mb-8 text-start">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
            {t("instructions")}
          </h2>
          <p className="text-sm text-ink/70">{order.paymentInstructions}</p>
        </div>
      )}

      <Link href="/category/all" className="border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-gold-bright hover:text-ink">
        {t("continueShopping")}
      </Link>
    </div>
  );
}
