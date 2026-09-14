import { prisma } from "@/lib/prisma";

const DEFAULT_COMMISSION_PERCENT = 10;

// Precedence: affiliate-specific fixed amount > affiliate-specific percentage
// override > global default percentage (Setting "global_commission_percent").
// Product/category-specific overrides are not implemented yet — the schema
// only carries per-affiliate rates today (Affiliate.commissionOverride /
// fixedCommission); extending this to product/category rules is future work.
export async function calculateCommission(
  affiliate: { commissionOverride: unknown; fixedCommission: unknown },
  orderSubtotal: number
): Promise<number> {
  if (affiliate.fixedCommission != null) {
    return Number(affiliate.fixedCommission);
  }

  if (affiliate.commissionOverride != null) {
    return round2(orderSubtotal * (Number(affiliate.commissionOverride) / 100));
  }

  const setting = await prisma.setting.findUnique({ where: { key: "global_commission_percent" } });
  const percent = typeof setting?.value === "number" ? setting.value : DEFAULT_COMMISSION_PERCENT;
  return round2(orderSubtotal * (percent / 100));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
