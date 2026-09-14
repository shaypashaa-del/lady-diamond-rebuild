import { prisma } from "@/lib/prisma";

// Picks the best-matching active shipping rule for a given order, cheapest
// wins on a tie. Admin manages rules at /admin/content (shipping settings) —
// see ShippingRule in schema.prisma for the supported types.
export async function calculateShipping(subtotal: number, country: string): Promise<number> {
  const rules = await prisma.shippingRule.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const applicable = rules.filter((rule) => {
    if (rule.type === "FREE") return true;
    if (rule.type === "FLAT_RATE") return true;
    if (rule.type === "BY_COUNTRY") return rule.country === country;
    if (rule.type === "BY_ORDER_VALUE") {
      return rule.minOrderValue == null || subtotal >= Number(rule.minOrderValue);
    }
    return false;
  });

  if (applicable.length === 0) return 0; // no shipping configured yet — default free

  const prices = applicable.map((r) => Number(r.price));
  return Math.min(...prices);
}
