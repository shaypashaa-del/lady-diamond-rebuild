"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS } from "@/lib/settings-keys";

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? (row.value as T) : fallback;
}

export async function updateSettings(formData: FormData) {
  const globalCommissionPercent = Number(formData.get("globalCommissionPercent") ?? 10);
  const attributionDays = Number(formData.get("attributionDays") ?? 30);
  const autoApproveAffiliates = formData.get("autoApproveAffiliates") === "on";
  const preventSelfReferral = formData.get("preventSelfReferral") === "on";

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: SETTINGS_KEYS.globalCommissionPercent },
      update: { value: globalCommissionPercent },
      create: { key: SETTINGS_KEYS.globalCommissionPercent, value: globalCommissionPercent },
    }),
    prisma.setting.upsert({
      where: { key: SETTINGS_KEYS.attributionDays },
      update: { value: attributionDays },
      create: { key: SETTINGS_KEYS.attributionDays, value: attributionDays },
    }),
    prisma.setting.upsert({
      where: { key: SETTINGS_KEYS.autoApproveAffiliates },
      update: { value: autoApproveAffiliates },
      create: { key: SETTINGS_KEYS.autoApproveAffiliates, value: autoApproveAffiliates },
    }),
    prisma.setting.upsert({
      where: { key: SETTINGS_KEYS.preventSelfReferral },
      update: { value: preventSelfReferral },
      create: { key: SETTINGS_KEYS.preventSelfReferral, value: preventSelfReferral },
    }),
  ]);

  revalidatePath("/admin/settings");
}
