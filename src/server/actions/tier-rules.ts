"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { AffiliateTierName } from "@/generated/prisma/enums";

export async function upsertTierRule(formData: FormData) {
  const tier = String(formData.get("tier")) as AffiliateTierName;
  const minSales = Number(formData.get("minSales") ?? 0);
  const commissionPercent = Number(formData.get("commissionPercent") ?? 0);
  const bonusRaw = formData.get("bonus");
  const isActive = formData.get("isActive") === "on";

  await prisma.affiliateTierRule.upsert({
    where: { tier },
    update: { minSales, commissionPercent, bonus: bonusRaw ? Number(bonusRaw) : null, isActive },
    create: { tier, minSales, commissionPercent, bonus: bonusRaw ? Number(bonusRaw) : null, isActive },
  });

  revalidatePath("/admin/affiliate-tiers");
}
