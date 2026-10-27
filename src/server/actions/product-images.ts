"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import { revalidateProductPageById } from "@/server/revalidate-product";
import { randomUUID } from "crypto";
import { sniffImageType, EXTENSION_BY_TYPE } from "@/lib/image-sniff";
import { saveMediaBlob } from "@/server/media-store";

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

// Upload photos straight from the product screen (e.g. from a phone) and attach them to
// the product in one step: stored like Media uploads, appended after the existing photos.
export async function uploadProductPhotos(
  productId: string,
  formData: FormData
): Promise<{ saved: true; count: number } | { error: string }> {
  await requireAdminSession();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "לא נבחרה תמונה." };
  if (files.length > 12) return { error: "אפשר להעלות עד 12 תמונות בבת אחת." };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, name: true } });
  if (!product) return { error: "המוצר לא נמצא." };
  const altHe = typeof product.name === "object" && product.name ? ((product.name as { he?: string }).he ?? "") : "";

  let sort = await prisma.productImage.count({ where: { productId } });
  let added = 0;
  const problems: string[] = [];
  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) {
      problems.push(`${file.name}: גדול מדי`);
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const type = sniffImageType(buffer);
    if (!type || !EXTENSION_BY_TYPE[type]) {
      problems.push(`${file.name}: סוג קובץ לא נתמך (JPG, PNG, WEBP או GIF)`);
      continue;
    }
    try {
      const id = randomUUID();
      await saveMediaBlob(id, type, buffer);
      const media = await prisma.mediaAsset.create({
        data: { url: `/api/media/${id}`, filename: file.name, altText: altHe ? { he: altHe } : undefined },
      });
      await prisma.productImage.create({ data: { productId, mediaId: media.id, sortOrder: sort++ } });
      added += 1;
    } catch (err) {
      console.error("[admin] uploadProductPhotos failed", err);
      problems.push(`${file.name}: ההעלאה נכשלה`);
    }
  }
  await refresh(productId);
  revalidatePath("/admin/media");
  if (added === 0) return { error: problems.join(" · ") || "ההעלאה נכשלה." };
  if (problems.length > 0) return { error: `הועלו ${added}. לא הועלו: ${problems.join(" · ")}` };
  return { saved: true, count: added };
}
