import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Celebrate } from "@/components/gem/Celebrate";
import { paypalMeUrl } from "@/lib/site-config";

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
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-8 sm:py-20">
      <Celebrate />
      <h1 className="mt-2 mb-6 text-2xl font-semibold uppercase tracking-wide">{t("title")}</h1>

      <div className="glass mb-6 rounded-[24px] p-5 text-start">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">{t("orderNumber")}</span>
          <span className="font-medium" dir="ltr">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between border-t border-black/10 py-2 text-sm font-semibold">
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
          {order.paymentMethod === "paypal" && order.paymentStatus !== "PAID" && (
            <a
              href={paypalMeUrl(Number(order.total))}
              target="_blank"
              rel="noopener noreferrer"
              className="buy-main mt-4 block px-4 py-3.5 text-center text-sm font-semibold"
            >
              {t("payWithPaypal", { amount: Number(order.total).toFixed(2) })}
            </a>
          )}
        </div>
      )}

      <Link href="/category/all" className="glass-pill glass-pill-gold">
        {t("continueShopping")}
      </Link>
    </div>
  );
}
