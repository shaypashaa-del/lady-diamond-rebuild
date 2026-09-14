import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const t = await getTranslations("OrderConfirmation");
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-8">
      <h1 className="mb-6 text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>

      <div className="mb-6 border border-neutral-200 p-5 text-start">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">{t("orderNumber")}</span>
          <span className="font-medium" dir="ltr">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-200 py-2 text-sm font-semibold">
          <span>{t("total")}</span>
          <span>{Number(order.total).toFixed(2)} ₪</span>
        </div>
      </div>

      {order.paymentInstructions && (
        <div className="mb-8 text-start">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t("instructions")}
          </h2>
          <p className="text-sm text-neutral-600">{order.paymentInstructions}</p>
        </div>
      )}

      <Link href="/category/all" className="border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white">
        {t("continueShopping")}
      </Link>
    </div>
  );
}
