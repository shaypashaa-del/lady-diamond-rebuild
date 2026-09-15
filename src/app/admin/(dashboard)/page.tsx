import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDashboardAnalytics, resolveRangePreset } from "@/server/repositories/analytics";

const RANGE_OPTIONS = [
  { value: "today", label: "היום" },
  { value: "yesterday", label: "אתמול" },
  { value: "7d", label: "7 ימים אחרונים" },
  { value: "30d", label: "30 ימים אחרונים" },
  { value: "this_month", label: "החודש" },
  { value: "last_month", label: "החודש שעבר" },
] as const;

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = rangeParam ?? "30d";
  const dateRange = resolveRangePreset(range);

  const [productCount, categoryCount, orderCount, customerCount, analytics] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    getDashboardAnalytics(dateRange),
  ]);

  const totals = [
    { label: "מוצרים", value: productCount },
    { label: "קטגוריות", value: categoryCount },
    { label: "הזמנות (סה\"כ)", value: orderCount },
    { label: "לקוחות (סה\"כ)", value: customerCount },
  ];

  const periodStats = [
    { label: "הכנסות בתקופה", value: `${analytics.revenue.toFixed(2)} ₪` },
    { label: "הזמנות בתקופה", value: analytics.orderCount },
    { label: "ערך הזמנה ממוצע", value: `${analytics.averageOrderValue.toFixed(2)} ₪` },
    { label: "לקוחות חדשים", value: analytics.newCustomers },
    { label: "לקוחות חוזרים", value: analytics.returningCustomers },
    { label: "הכנסות משותפים", value: `${analytics.affiliateRevenue.toFixed(2)} ₪` },
    { label: "סה\"כ עמלות", value: `${analytics.totalCommissions.toFixed(2)} ₪` },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">לוח בקרה</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {totals.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-xs text-neutral-400">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin?range=${opt.value}`}
            className={`rounded px-3 py-1.5 text-xs font-medium ${
              range === opt.value ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {periodStats.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-xs text-neutral-400">{c.label}</p>
            <p className="mt-1 text-lg font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
            מוצרים מובילים
          </h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <tbody>
                {analytics.topProducts.map((p) => (
                  <tr key={p.name} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-neutral-500">× {p.quantity}</td>
                    <td className="px-4 py-2 text-end">{p.revenue.toFixed(2)} ₪</td>
                  </tr>
                ))}
                {analytics.topProducts.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-neutral-400">אין נתונים בתקופה זו.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
            שותפים מובילים
          </h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <tbody>
                {analytics.topAffiliates.map((a) => (
                  <tr key={a.code} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2">
                      {a.name} <span className="text-neutral-400" dir="ltr">({a.code})</span>
                    </td>
                    <td className="px-4 py-2 text-neutral-500">{a.orders} הזמנות</td>
                    <td className="px-4 py-2 text-end">{a.revenue.toFixed(2)} ₪</td>
                  </tr>
                ))}
                {analytics.topAffiliates.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-neutral-400">אין נתונים בתקופה זו.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
