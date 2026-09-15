"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addProductImage(productId: string, formData: FormData) {
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) return;

  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, mediaId, sortOrder: count },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function removeProductImage(id: string, productId: string) {
  await prisma.productImage.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}
