import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { AdminPager } from "@/components/admin/AdminPager";

const PAGE_SIZE = 50;

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
  REFUNDED: "זוכתה",
};

const paymentLabels: Record<string, string> = {
  PENDING: "ממתין",
  PAID: "שולם",
  FAILED: "נכשל",
  REFUNDED: "זוכה",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }>;
}) {
  const { q, status, payment, page: pageRaw } = await searchParams;
  const parsedPage = Number.parseInt(pageRaw ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const where: Prisma.OrderWhereInput = {};
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status as OrderStatus;
  if (payment) where.paymentStatus = payment as PaymentStatus;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { affiliate: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">הזמנות</h1>

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי מספר הזמנה או אימייל"
          className="min-w-64 border border-neutral-300 px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={status ?? ""} className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="">כל הסטטוסים</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={payment ?? ""} className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="">כל סטטוסי התשלום</option>
          {Object.entries(paymentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          סינון
        </button>
        {(q || status || payment) && (
          <Link href="/admin/orders" className="px-2 py-2 text-sm text-neutral-500 underline">
            איפוס
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">מספר הזמנה</th>
              <th className="px-4 py-3 font-medium">לקוח</th>
              <th className="px-4 py-3 font-medium">סכום</th>
              <th className="px-4 py-3 font-medium">שותף</th>
              <th className="px-4 py-3 font-medium">תשלום</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium">תאריך</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="block hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.email}</td>
                <td className="px-4 py-3">{Number(o.total).toFixed(2)} ₪</td>
                <td className="px-4 py-3">{o.affiliate?.code ?? "—"}</td>
                <td className="px-4 py-3">{paymentLabels[o.paymentStatus]}</td>
                <td className="px-4 py-3">{statusLabels[o.status]}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {o.createdAt.toLocaleDateString("he-IL")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  {q || status || payment ? "לא נמצאו הזמנות תואמות." : "אין הזמנות עדיין."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPager page={page} totalPages={totalPages} basePath="/admin/orders" searchParams={{ q, status, payment }} />
    </div>
  );
}
