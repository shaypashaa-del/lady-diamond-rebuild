"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

export async function addProductImage(productId: string, formData: FormData) {
  await requireAdminSession();
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) return;

  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, mediaId, sortOrder: count },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function removeProductImage(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productImage.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}
