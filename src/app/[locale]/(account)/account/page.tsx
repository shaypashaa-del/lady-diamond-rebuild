import { getTranslations } from "next-intl/server";
import { requireCustomerSession } from "@/lib/auth/guards";
import { logout } from "@/server/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await requireCustomerSession();
  const t = await getTranslations("Account");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <h1 className="mb-2 text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      <p className="mb-8 text-sm text-neutral-500">
        {t("loggedInAs")} <span dir="ltr">{session.email}</span>
      </p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
        {t("orders")}
      </h2>
      {orders.length === 0 ? (
        <p className="mb-8 text-sm text-neutral-400">{t("noOrders")}</p>
      ) : (
        <ul className="mb-8 divide-y divide-neutral-200 border-y border-neutral-200">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium">{o.orderNumber}</span>
              <span className="text-neutral-500">{o.status}</span>
              <span>{Number(o.total).toFixed(2)} ₪</span>
            </li>
          ))}
        </ul>
      )}

      <form action={logout}>
        <button
          type="submit"
          className="border border-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
        >
          {t("logout")}
        </button>
      </form>
    </div>
  );
}
