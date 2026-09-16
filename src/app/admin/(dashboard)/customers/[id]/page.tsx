import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addCustomerNote } from "@/server/actions/customer-notes";

const statusLabels: Record<string, string> = {
  PENDING: "ממתינה",
  PROCESSING: "בטיפול",
  SHIPPED: "נשלחה",
  COMPLETED: "הושלמה",
  CANCELLED: "בוטלה",
  REFUNDED: "זוכתה",
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      addresses: true,
      notes: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">{customer.name}</h1>
      <p className="mb-6 text-sm text-neutral-500" dir="ltr">
        {customer.email} · {customer.phone ?? "—"}
      </p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-400">מספר הזמנות</p>
          <p className="mt-1 text-xl font-semibold">{customer.orders.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-400">סה&quot;כ רכישות</p>
          <p className="mt-1 text-xl font-semibold">{totalSpent.toFixed(2)} ₪</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-400">נרשם בתאריך</p>
          <p className="mt-1 text-xl font-semibold">{customer.createdAt.toLocaleDateString("he-IL")}</p>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
        היסטוריית הזמנות
      </h2>
      {customer.orders.length === 0 ? (
        <p className="mb-8 text-sm text-neutral-400">אין הזמנות עדיין.</p>
      ) : (
        <div className="mb-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <tbody>
              {customer.orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-2 text-neutral-500">{statusLabels[o.status]}</td>
                  <td className="px-4 py-2">{Number(o.total).toFixed(2)} ₪</td>
                  <td className="px-4 py-2 text-neutral-500">{o.createdAt.toLocaleDateString("he-IL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {customer.addresses.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">כתובות</h2>
          <ul className="mb-8 space-y-1 text-sm text-neutral-600">
            {customer.addresses.map((a) => (
              <li key={a.id}>
                {a.street} {a.apartment}, {a.city}, {a.country}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">הערות פנימיות</h2>
      <ul className="mb-4 space-y-3">
        {customer.notes.map((note) => (
          <li key={note.id} className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm">
            <p>{note.body}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {note.author?.name ?? "מערכת"} · {note.createdAt.toLocaleString("he-IL")}
            </p>
          </li>
        ))}
        {customer.notes.length === 0 && <p className="text-sm text-neutral-400">אין הערות עדיין.</p>}
      </ul>
      <form action={addCustomerNote.bind(null, customer.id)} className="flex gap-2">
        <input name="body" placeholder="הוספת הערה..." className="flex-1 border border-neutral-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          הוספה
        </button>
      </form>
    </div>
  );
}
