import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireCustomerSession } from "@/lib/auth/guards";
import { logout } from "@/server/actions/auth";
import { updateMyAddressAction } from "@/server/actions/address";
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

const inputClass = "border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
  REFUNDED: "זוכתה",
};

export default async function AccountPage() {
  const session = await requireCustomerSession();
  const t = await getTranslations("Account");

  const [orders, address] = await Promise.all([
    prisma.order.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" } }),
    prisma.address.findFirst({ where: { userId: session.userId, isDefault: true } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
      <DiamondMark className="h-7 w-7 text-gold-bright" />
      <h1 className="mt-3 mb-2 text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      <span className="gold-rule mb-6 w-12" />
      <p className="mb-8 text-sm text-ink/60">
        {t("loggedInAs")} <span dir="ltr">{session.email}</span>
      </p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/70">
        {t("orders")}
      </h2>
      {orders.length === 0 ? (
        <p className="mb-8 text-sm text-ink/40">{t("noOrders")}</p>
      ) : (
        <ul className="mb-8 divide-y divide-gold-soft border-y border-gold-soft">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-3 text-sm">
              <Link href={`/account/orders/${o.id}`} className="link-underline block font-medium">
                {o.orderNumber}
              </Link>
              <span className="text-ink/60">{statusLabels[o.status] ?? o.status}</span>
              <span>{Number(o.total).toFixed(2)} ₪</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/70">
        {t("address")}
      </h2>
      <form action={updateMyAddressAction} className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="fullName" placeholder={t("fullName")} defaultValue={address?.fullName} className={inputClass} />
        <input name="phone" placeholder={t("phone")} defaultValue={address?.phone} className={inputClass} />
        <input name="country" placeholder={t("country")} defaultValue={address?.country ?? "Israel"} className={inputClass} />
        <input name="city" placeholder={t("city")} defaultValue={address?.city} className={inputClass} />
        <input name="street" placeholder={t("street")} defaultValue={address?.street} className={inputClass} />
        <input name="apartment" placeholder={t("apartment")} defaultValue={address?.apartment ?? undefined} className={inputClass} />
        <input name="zip" placeholder={t("zip")} defaultValue={address?.zip ?? undefined} className={inputClass} />
        <button
          type="submit"
          className="border border-gold-bright py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink sm:col-span-2"
        >
          {t("save")}
        </button>
      </form>

      <form action={logout}>
        <button
          type="submit"
          className="border border-gold-bright px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink"
        >
          {t("logout")}
        </button>
      </form>
    </div>
  );
}
