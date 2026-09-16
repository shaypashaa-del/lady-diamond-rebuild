import { prisma } from "@/lib/prisma";
import type { AffiliateTierName } from "@/generated/prisma/enums";

export const DEFAULT_COMMISSION_PERCENT = 10;

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Precedence: affiliate-specific fixed amount > affiliate-specific percentage
// override > the affiliate's tier rule (see AffiliateTierRule, configured at
// /admin/affiliate-tiers) > global default percentage (Setting
// "global_commission_percent"). Product/category-specific overrides are not
// implemented yet — extending this further is future work.
//
// Pulled out as a pure function (no DB access) so the precedence order and
// the `!= null` (not falsy) checks — which must treat an explicit 0 as "set"
// rather than falling through to the next level — are unit-testable without
// mocking Prisma.
export function resolveCommissionAmount(
  affiliate: { commissionOverride: unknown; fixedCommission: unknown },
  orderSubtotal: number,
  tierRule: { isActive: boolean; commissionPercent: unknown } | null,
  globalPercent: number
): number {
  if (affiliate.fixedCommission != null) {
    return Number(affiliate.fixedCommission);
  }

  if (affiliate.commissionOverride != null) {
    return round2(orderSubtotal * (Number(affiliate.commissionOverride) / 100));
  }

  if (tierRule?.isActive) {
    return round2(orderSubtotal * (Number(tierRule.commissionPercent) / 100));
  }

  return round2(orderSubtotal * (globalPercent / 100));
}

export async function calculateCommission(
  affiliate: { commissionOverride: unknown; fixedCommission: unknown; tier: AffiliateTierName },
  orderSubtotal: number
): Promise<number> {
  const tierRule = await prisma.affiliateTierRule.findUnique({
    where: { tier: affiliate.tier },
  });

  const setting = await prisma.setting.findUnique({ where: { key: "global_commission_percent" } });
  const globalPercent = typeof setting?.value === "number" ? setting.value : DEFAULT_COMMISSION_PERCENT;

  return resolveCommissionAmount(affiliate, orderSubtotal, tierRule, globalPercent);
}
