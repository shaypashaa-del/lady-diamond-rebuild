import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { OrderStatus } from "@/generated/prisma/enums";

const EXCLUDED_REVENUE_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED"];

export type DateRange = { from: Date; to: Date };

export function resolveRangePreset(preset: string | undefined): DateRange {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  switch (preset) {
    case "yesterday": {
      const from = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const to = new Date(startOfToday.getTime() - 1);
      return { from, to };
    }
    case "7d":
      return { from: new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000), to: endOfToday };
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: endOfToday };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from, to };
    }
    case "today":
      return { from: startOfToday, to: endOfToday };
    case "30d":
    default:
      return { from: new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000), to: endOfToday };
  }
}

export async function getDashboardAnalytics(range: DateRange) {
  const whereInRange = { createdAt: { gte: range.from, lte: range.to } };
  // Cancelled/refunded orders never became real revenue — exclude them from
  // revenue, AOV, and top-products/affiliates, matching normal analytics
  // conventions (order count elsewhere still reflects all attempted orders).
  const whereRevenue = { ...whereInRange, status: { notIn: EXCLUDED_REVENUE_STATUSES } };

  const [orders, newCustomers, commissions, allTimeCustomerOrderCounts] = await Promise.all([
    prisma.order.findMany({
      where: whereRevenue,
      include: {
        items: { include: { product: true } },
        affiliate: { include: { user: true } },
      },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", ...whereInRange } }),
    prisma.commission.findMany({ where: { ...whereInRange, status: { not: "REJECTED" } } }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { not: null } },
      _count: { userId: true },
    }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  // Top products by quantity sold within the range.
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const name = localize(item.product.name as LocalizedText, "he");
      const existing = productSales.get(item.productId) ?? { name, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.lineTotal);
      productSales.set(item.productId, existing);
    }
  }
  const topProducts = [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Top affiliates by revenue generated within the range.
  const affiliateSales = new Map<string, { name: string; code: string; revenue: number; orders: number }>();
  for (const order of orders) {
    if (!order.affiliate) continue;
    const existing = affiliateSales.get(order.affiliate.id) ?? {
      name: order.affiliate.user.name,
      code: order.affiliate.code,
      revenue: 0,
      orders: 0,
    };
    existing.revenue += Number(order.total);
    existing.orders += 1;
    affiliateSales.set(order.affiliate.id, existing);
  }
  const topAffiliates = [...affiliateSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const totalCommissions = commissions.reduce((sum, c) => sum + Number(c.amount), 0);
  const affiliateRevenue = orders
    .filter((o) => o.affiliateId)
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Returning = placed an order in-range AND has more than one order all-time.
  const repeatCustomerIds = new Set(
    allTimeCustomerOrderCounts.filter((g) => g._count.userId > 1).map((g) => g.userId)
  );
  const returningCustomers = new Set(
    orders.filter((o) => o.userId && repeatCustomerIds.has(o.userId)).map((o) => o.userId)
  ).size;

  return {
    revenue,
    orderCount,
    averageOrderValue,
    newCustomers,
    returningCustomers,
    totalCommissions,
    affiliateRevenue,
    topProducts,
    topAffiliates,
  };
}
