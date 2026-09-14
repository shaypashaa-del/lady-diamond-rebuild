"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ShippingMethodType } from "@/generated/prisma/enums";

export async function createShippingRule(formData: FormData) {
  const name = String(formData.get("name"));
  const type = String(formData.get("type")) as ShippingMethodType;
  const country = String(formData.get("country") ?? "") || null;
  const minOrderValueRaw = formData.get("minOrderValue");
  const price = Number(formData.get("price") ?? 0);

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
}

export async function deleteShippingRule(id: string) {
  await prisma.shippingRule.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}

export async function toggleShippingRule(id: string, isActive: boolean) {
  await prisma.shippingRule.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/shipping");
}
