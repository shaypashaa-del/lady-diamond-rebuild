import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireCustomerSession } from "@/lib/auth/guards";
import { logout } from "@/server/actions/auth";
import { updateMyAddressAction } from "@/server/actions/address";
import { prisma } from "@/lib/prisma";
import { GemBackdrop } from "@/components/gem/GemBackdrop";

const inputClass = "field";

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
    <div>
      <div className="relative overflow-hidden bg-ink py-12 text-center sm:py-16">
        <div className="relative">
          <GemBackdrop stone="sapphire" />
          <span className="gold-rule mt-2 w-16" />
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.2em] text-paper sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 text-sm text-paper/60">
            {t("loggedInAs")} <span dir="ltr">{session.email}</span>
          </p>
        </div>
      </div>
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10 sm:px-8 sm:py-14">
     <section className="glass rounded-[28px] p-5 sm:p-7">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/70">
        {t("orders")}
      </h2>
      {orders.length === 0 ? (
        <p className="text-sm text-ink/40">{t("noOrders")}</p>
      ) : (
        <ul className="divide-y divide-black/10">
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

     </section>
     <section className="glass rounded-[28px] p-5 sm:p-7">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/70">
        {t("address")}
      </h2>
      <form action={updateMyAddressAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="fullName" placeholder={t("fullName")} defaultValue={address?.fullName} className={inputClass} />
        <input name="phone" placeholder={t("phone")} defaultValue={address?.phone} className={inputClass} />
        <input name="country" placeholder={t("country")} defaultValue={address?.country ?? "Israel"} className={inputClass} />
        <input name="city" placeholder={t("city")} defaultValue={address?.city} className={inputClass} />
        <input name="street" placeholder={t("street")} defaultValue={address?.street} className={inputClass} />
        <input name="apartment" placeholder={t("apartment")} defaultValue={address?.apartment ?? undefined} className={inputClass} />
        <input name="zip" placeholder={t("zip")} defaultValue={address?.zip ?? undefined} className={inputClass} />
        <button
          type="submit"
          className="buy-main py-3.5 text-sm font-semibold tracking-wide sm:col-span-2"
        >
          {t("save")}
        </button>
      </form>

      <form action={logout} className="text-center">
        <button type="submit" className="glass-pill glass-pill-gold">
          {t("logout")}
        </button>
      </form>
     </section>
    </div>
    </div>
  );
}
