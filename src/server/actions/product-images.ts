"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import { revalidateProductPageById } from "@/server/revalidate-product";

async function refresh(productId: string) {
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
}

export async function addProductImage(productId: string, formData: FormData) {
  await requireAdminSession();
  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) return;

  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: { productId, mediaId, sortOrder: count },
  });

  await refresh(productId);
}

export async function removeProductImage(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productImage.delete({ where: { id } });
  await refresh(productId);
}

// The first image (lowest sortOrder) is the product's main photo on cards and
// the page. Rewrites the whole order 0..n-1 so ties and gaps cannot occur.
async function reorder(productId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((imageId, index) =>
      prisma.productImage.update({ where: { id: imageId }, data: { sortOrder: index } })
    )
  );
  await refresh(productId);
}

async function currentOrder(productId: string) {
  const rows = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function moveProductImage(id: string, productId: string, direction: "earlier" | "later") {
  await requireAdminSession();
  const ids = await currentOrder(productId);
  const i = ids.indexOf(id);
  if (i === -1) return;
  const j = direction === "earlier" ? i - 1 : i + 1;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await reorder(productId, ids);
}

export async function setPrimaryProductImage(id: string, productId: string) {
  await requireAdminSession();
  const ids = await currentOrder(productId);
  if (!ids.includes(id)) return;
  await reorder(productId, [id, ...ids.filter((x) => x !== id)]);
}
