"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

function localizedFromForm(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
}

export async function addVariant(productId: string, formData: FormData) {
  await requireAdminSession();
  const attributeName = String(formData.get("attributeName") ?? "color");
  const price = Number(formData.get("price"));
  const salePriceRaw = formData.get("salePrice");
  const sku = String(formData.get("sku") ?? "") || undefined;
  const inventory = Number(formData.get("inventory") ?? 0);

  await prisma.productVariant.create({
    data: {
      productId,
      sku,
      price,
      salePrice: salePriceRaw ? Number(salePriceRaw) : undefined,
      inventory,
      attributes: { [attributeName]: localizedFromForm(formData, "value") },
    },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteVariant(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}
