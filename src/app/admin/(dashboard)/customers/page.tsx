import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const customers = await prisma.user.findMany({
    where,
    include: { _count: { select: { orders: true } }, orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">לקוחות</h1>

      <form className="mb-4 flex gap-3" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="חיפוש לפי שם, אימייל או טלפון"
          className="min-w-64 border border-neutral-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          חיפוש
        </button>
        {q && (
          <Link href="/admin/customers" className="px-2 py-2 text-sm text-neutral-500 underline">
            איפוס
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">אימייל</th>
              <th className="px-4 py-3 font-medium">טלפון</th>
              <th className="px-4 py-3 font-medium">הזמנות</th>
              <th className="px-4 py-3 font-medium">סה&quot;כ רכישות</th>
              <th className="px-4 py-3 font-medium">נרשם בתאריך</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
              return (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/customers/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3" dir="ltr">{c.email}</td>
                  <td className="px-4 py-3" dir="ltr">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">{c._count.orders}</td>
                  <td className="px-4 py-3">{totalSpent.toFixed(2)} ₪</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {c.createdAt.toLocaleDateString("he-IL")}
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  {q ? "לא נמצאו לקוחות תואמים." : "אין לקוחות רשומים עדיין."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
