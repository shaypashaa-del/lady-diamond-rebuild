"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { AffiliateTierName } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/auth/guards";

export async function upsertTierRule(formData: FormData) {
  await requireAdminSession();
  const tier = String(formData.get("tier")) as AffiliateTierName;
  const minSales = Math.max(0, Number(formData.get("minSales") ?? 0));
  const commissionPercent = Math.max(0, Number(formData.get("commissionPercent") ?? 0));
  const bonusRaw = formData.get("bonus");
  const bonus = bonusRaw ? Math.max(0, Number(bonusRaw)) : null;
  const isActive = formData.get("isActive") === "on";

  await prisma.affiliateTierRule.upsert({
    where: { tier },
    update: { minSales, commissionPercent, bonus, isActive },
    create: { tier, minSales, commissionPercent, bonus, isActive },
  });

  revalidatePath("/admin/affiliate-tiers");
}
