import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount, customerCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const cards = [
    { label: "מוצרים", value: productCount },
    { label: "קטגוריות", value: categoryCount },
    { label: "הזמנות", value: orderCount },
    { label: "לקוחות", value: customerCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">לוח בקרה</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-xs text-neutral-400">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
