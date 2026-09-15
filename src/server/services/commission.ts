import { prisma } from "@/lib/prisma";
import type { AffiliateTierName } from "@/generated/prisma/enums";

const DEFAULT_COMMISSION_PERCENT = 10;

// Precedence: affiliate-specific fixed amount > affiliate-specific percentage
// override > the affiliate's tier rule (see AffiliateTierRule, configured at
// /admin/affiliate-tiers) > global default percentage (Setting
// "global_commission_percent"). Product/category-specific overrides are not
// implemented yet — extending this further is future work.
export async function calculateCommission(
  affiliate: { commissionOverride: unknown; fixedCommission: unknown; tier: AffiliateTierName },
  orderSubtotal: number
): Promise<number> {
  if (affiliate.fixedCommission != null) {
    return Number(affiliate.fixedCommission);
  }

  if (affiliate.commissionOverride != null) {
    return round2(orderSubtotal * (Number(affiliate.commissionOverride) / 100));
  }

  const tierRule = await prisma.affiliateTierRule.findUnique({
    where: { tier: affiliate.tier },
  });
  if (tierRule?.isActive) {
    return round2(orderSubtotal * (Number(tierRule.commissionPercent) / 100));
  }

  const setting = await prisma.setting.findUnique({ where: { key: "global_commission_percent" } });
  const percent = typeof setting?.value === "number" ? setting.value : DEFAULT_COMMISSION_PERCENT;
  return round2(orderSubtotal * (percent / 100));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
