"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS, DEFAULT_PAYOUT_HOLD_DAYS } from "@/lib/settings-keys";
import { requireAdminSession } from "@/lib/auth/guards";

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? (row.value as T) : fallback;
}

export type SettingsFormResult = { error: string } | { saved: true } | undefined;

export async function updateSettings(
  _prevState: SettingsFormResult,
  formData: FormData
): Promise<SettingsFormResult> {
  await requireAdminSession();
  const globalCommissionPercent = Number(formData.get("globalCommissionPercent") ?? 10);
  const attributionDays = Number(formData.get("attributionDays") ?? 30);
  const payoutHoldDaysRaw = Number(formData.get("payoutHoldDays") ?? DEFAULT_PAYOUT_HOLD_DAYS);
  const payoutHoldDays = Number.isFinite(payoutHoldDaysRaw) ? Math.min(365, Math.max(0, Math.round(payoutHoldDaysRaw))) : DEFAULT_PAYOUT_HOLD_DAYS;
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
      where: { key: SETTINGS_KEYS.payoutHoldDays },
      update: { value: payoutHoldDays },
      create: { key: SETTINGS_KEYS.payoutHoldDays, value: payoutHoldDays },
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
  return { saved: true };
}

// Social proof switches (live visitors, viewers on a product, recent real purchases).
export async function updateSocialProofSettings(formData: FormData): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();
  const value = {
    visitors: formData.get("visitors") === "on",
    viewers: formData.get("viewers") === "on",
    sales: formData.get("sales") === "on",
    interest: formData.get("interest") === "on",
  };
  try {
    await prisma.setting.upsert({
      where: { key: SETTINGS_KEYS.socialProof },
      update: { value },
      create: { key: SETTINGS_KEYS.socialProof, value },
    });
  } catch (err) {
    console.error("[admin] updateSocialProofSettings failed", err);
    return { error: "השמירה נכשלה." };
  }
  revalidatePath("/admin/settings");
  return { saved: true };
}
