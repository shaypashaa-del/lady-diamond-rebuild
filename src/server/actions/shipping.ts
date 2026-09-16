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
  const price = Number(formData.get("price") ?? 0);

  if (!name) return { error: "יש להזין שם לכלל המשלוח." };

  await prisma.shippingRule.create({
    data: {
      name,
      type,
      country,
      minOrderValue: minOrderValueRaw ? Number(minOrderValueRaw) : null,
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
