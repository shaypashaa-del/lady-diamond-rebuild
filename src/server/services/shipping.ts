import { prisma } from "@/lib/prisma";

export type ShippingRuleLike = {
  country: string | null;
  minOrderValue: unknown;
  price: unknown;
};

// Picks the cheapest matching rule's price for a given order — pulled out
// as a pure function (no DB access) so it's unit-testable without mocking
// Prisma; calculateShipping below just fetches rows and delegates here.
//
// `country`/`minOrderValue` are plain optional scoping fields on every rule
// row, not exclusive to the BY_COUNTRY/BY_ORDER_VALUE types — `type` only
// labels the admin's primary intent for the rule. Previously FREE/FLAT_RATE
// rules ignored country/minOrderValue entirely, so an admin who set e.g. a
// FREE rule scoped to "Israel" would unknowingly give free shipping
// worldwide. Scoping now applies uniformly to every rule whenever set.
export function pickShippingPrice(
  rules: ShippingRuleLike[],
  subtotal: number,
  country: string
): number {
  const applicable = rules.filter((rule) => {
    if (rule.country != null && rule.country !== country) return false;
    if (rule.minOrderValue != null && subtotal < Number(rule.minOrderValue)) return false;
    return true;
  });

  if (applicable.length === 0) return 0; // no shipping configured yet — default free

  const prices = applicable.map((r) => Number(r.price));
  return Math.min(...prices);
}

// Admin manages rules at /admin/shipping — see ShippingRule in schema.prisma
// for the supported types.
export async function calculateShipping(subtotal: number, country: string): Promise<number> {
  const rules = await prisma.shippingRule.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return pickShippingPrice(rules, subtotal, country);
}
