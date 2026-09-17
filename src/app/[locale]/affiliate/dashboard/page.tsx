import { getTranslations } from "next-intl/server";
import { requireAffiliateSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { logout } from "@/server/actions/auth";
import { updateMyPaymentDetails, type AffiliatePaymentDetails } from "@/server/actions/affiliate";
import { AffiliateLinkGenerator } from "@/components/affiliate/AffiliateLinkGenerator";

export default async function AffiliateDashboardPage() {
  const session = await requireAffiliateSession();
  const t = await getTranslations("Affiliate");

  const affiliate = await prisma.affiliate.findUniqueOrThrow({
    where: { userId: session.userId },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      commissions: true,
      _count: { select: { clicks: true, orders: true } },
    },
  });

  if (affiliate.status === "PENDING") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-8">
        <h1 className="mb-3 text-lg font-semibold">{t("pendingTitle")}</h1>
        <p className="text-sm text-ink/60">{t("pendingCopy")}</p>
      </div>
    );
  }

  if (affiliate.status === "SUSPENDED" || affiliate.status === "REJECTED") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-8">
        <h1 className="mb-3 text-lg font-semibold">{t("suspendedTitle")}</h1>
        <p className="text-sm text-ink/60">{t("suspendedCopy")}</p>
      </div>
    );
  }

  const clicks = affiliate._count.clicks;
  const orderCount = affiliate._count.orders;
  const conversionRate = clicks > 0 ? ((orderCount / clicks) * 100).toFixed(1) : "0.0";
  const revenue = affiliate.orders.reduce((sum, o) => sum + Number(o.total), 0);

  const commissionByStatus = { PENDING: 0, APPROVED: 0, PAID: 0 } as Record<string, number>;
  for (const c of affiliate.commissions) {
    if (c.status in commissionByStatus) commissionByStatus[c.status] += Number(c.amount);
  }

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, name: true },
    take: 50,
  });

  const payment = affiliate.paymentDetails as AffiliatePaymentDetails | null;

  const stats = [
    { label: t("clicks"), value: clicks },
    { label: t("orders"), value: orderCount },
    { label: t("conversionRate"), value: `${conversionRate}%` },
    { label: t("revenue"), value: `${revenue.toFixed(2)} ₪` },
  ];

  const commissionStats = [
    { label: t("commissionPending"), value: commissionByStatus.PENDING },
    { label: t("commissionApproved"), value: commissionByStatus.APPROVED },
    { label: t("commissionPaid"), value: commissionByStatus.PAID },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold uppercase tracking-wide">{t("dashTitle")}</h1>
        <form action={logout}>
          <button type="submit" className="text-xs text-clay underline">
            {t("logout")}
          </button>
        </form>
      </div>

      <div className="mb-8 rounded-lg border border-gold-soft bg-paper-soft p-5">
        <p className="text-xs text-ink/60">{t("yourCode")}</p>
        <p className="mb-3 text-lg font-semibold" dir="ltr">{affiliate.code}</p>
        <p className="text-xs text-ink/60">{t("yourLink")}</p>
        <p className="break-all text-sm font-medium" dir="ltr">
          {`https://ladydiamondjewels.com/?ref=${affiliate.code}`}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gold-soft bg-paper p-4">
            <p className="text-xs text-ink/50">{s.label}</p>
            <p className="mt-1 text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        {commissionStats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gold-soft bg-paper p-4">
            <p className="text-xs text-ink/50">{s.label}</p>
            <p className="mt-1 text-lg font-semibold">{s.value.toFixed(2)} ₪</p>
          </div>
        ))}
      </div>

      <AffiliateLinkGenerator code={affiliate.code} products={products} />

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-ink/80">
        {t("paymentDetails")}
      </h2>
      <form action={updateMyPaymentDetails} className="mb-10 space-y-3 rounded-lg border border-gold-soft bg-paper p-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("paymentMethod")}</label>
          <select
            name="method"
            defaultValue={payment?.method ?? "bank_transfer"}
            className="w-full border border-gold-soft px-3 py-2 text-sm sm:w-64"
          >
            <option value="bank_transfer">{t("paymentBankTransfer")}</option>
            <option value="paypal">PayPal</option>
            <option value="bit">Bit</option>
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("accountOwner")}</label>
            <input name="accountOwner" defaultValue={payment?.accountOwner ?? ""} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("bankName")}</label>
            <input name="bankName" defaultValue={payment?.bankName ?? ""} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("branchNumber")}</label>
            <input name="branchNumber" defaultValue={payment?.branchNumber ?? ""} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("accountNumber")}</label>
            <input name="accountNumber" defaultValue={payment?.accountNumber ?? ""} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">PayPal Email</label>
            <input name="paypalEmail" dir="ltr" defaultValue={payment?.paypalEmail ?? ""} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Bit</label>
            <input name="bitPhone" dir="ltr" defaultValue={payment?.bitPhone ?? ""} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" className="rounded bg-ink px-4 py-2 text-xs font-semibold text-paper">
          {t("saveDetails")}
        </button>
      </form>

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-ink/80">
        {t("recentSales")}
      </h2>
      {affiliate.orders.length === 0 ? (
        <p className="text-sm text-ink/50">{t("noSales")}</p>
      ) : (
        <ul className="divide-y divide-gold-soft border-y border-gold-soft">
          {affiliate.orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium">{o.orderNumber}</span>
              <span className="text-ink/60">{o.status}</span>
              <span>{Number(o.total).toFixed(2)} ₪</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
