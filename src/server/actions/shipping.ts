"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ShippingMethodType } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/auth/guards";

export type ShippingRuleFormResult = { error: string } | { created: true } | undefined;

export async function createShippingRule(
  _prevState: ShippingRuleFormResult,
  formData: FormData
): Promise<ShippingRuleFormResult> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type")) as ShippingMethodType;
  const country = String(formData.get("country") ?? "") || null;
  const minOrderValueRaw = formData.get("minOrderValue");
  const price = Math.max(0, Number(formData.get("price") ?? 0));

  if (!name) return { error: "יש להזין שם לכלל המשלוח." };

  await prisma.shippingRule.create({
    data: {
      name,
      type,
      country,
      minOrderValue: minOrderValueRaw ? Math.max(0, Number(minOrderValueRaw)) : null,
      price,
    },
  });
  revalidatePath("/admin/shipping");
  return { created: true };
}

export async function deleteShippingRule(id: string) {
  await requireAdminSession();
  await prisma.shippingRule.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}

export async function toggleShippingRule(id: string, isActive: boolean) {
  await requireAdminSession();
  await prisma.shippingRule.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/shipping");
}

export async function updateShippingRule(
  id: string,
  formData: FormData
): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "יש להזין שם." };
  const price = Number(formData.get("price") ?? 0);
  if (!Number.isFinite(price) || price < 0) return { error: "מחיר לא תקין." };
  const minRaw = String(formData.get("minOrderValue") ?? "").trim();
  const min = minRaw === "" ? null : Number(minRaw);
  if (min !== null && (!Number.isFinite(min) || min < 0)) return { error: "סכום מינימום לא תקין." };
  const country = String(formData.get("country") ?? "").trim().toUpperCase() || null;
  try {
    await prisma.shippingRule.update({ where: { id }, data: { name, price, minOrderValue: min, country } });
  } catch (err) {
    console.error("[admin] updateShippingRule failed", err);
    return { error: "השמירה נכשלה." };
  }
  revalidatePath("/admin/shipping");
  return { saved: true };
}
