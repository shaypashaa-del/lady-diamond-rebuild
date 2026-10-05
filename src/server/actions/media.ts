"use server";

import { randomUUID } from "crypto";
import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/guards";
import { sniffImageType, EXTENSION_BY_TYPE } from "@/lib/image-sniff";
import { saveMediaBlob, deleteMediaBlob } from "@/server/media-store";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

function optionalLocalizedFromForm(formData: FormData, prefix: string) {
  const value = {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
  return value.he || value.en || value.ru ? value : undefined;
}

// Photos are stored in the database and served from /api/media/<id> (see
// src/server/media-store.ts): the server's disk is not durable across deploys.
export async function uploadMedia(formData: FormData) {
  await requireAdminSession();
  const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  const altText = optionalLocalizedFromForm(formData, "altText");

  if (files.length === 0) {
    return { error: "לא נבחר קובץ." };
  }
  if (files.length > 20) {
    return { error: "אפשר להעלות עד 20 תמונות בבת אחת." };
  }

  let uploaded = 0;
  const problems: string[] = [];
  for (const file of files) {
    if (file.size > MAX_SIZE_BYTES) {
      problems.push(`${file.name}: גדול מדי (מקסימום 8MB)`);
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const sniffedType = sniffImageType(buffer);
    const ext = sniffedType && EXTENSION_BY_TYPE[sniffedType];
    if (!ext) {
      problems.push(`${file.name}: סוג קובץ לא נתמך (JPG, PNG, WEBP או GIF בלבד)`);
      continue;
    }
    const id = randomUUID();
    try {
      await saveMediaBlob(id, sniffedType, buffer);
      await prisma.mediaAsset.create({
        data: { url: `/api/media/${id}`, filename: file.name, altText },
      });
      uploaded += 1;
    } catch (err) {
      console.error("[admin] uploadMedia failed", err);
      problems.push(`${file.name}: ההעלאה נכשלה`);
    }
  }

  revalidatePath("/admin/media");
  if (uploaded === 0) return { error: problems.join(" · ") };
  return problems.length > 0
    ? { error: `הועלו ${uploaded} תמונות. לא הועלו: ${problems.join(" · ")}` }
    : { uploaded: true as const };
}

// Edit the alt text (shown to search engines and screen readers) of a photo.
export async function updateMediaAlt(
  id: string,
  formData: FormData
): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();
  const altText = optionalLocalizedFromForm(formData, "altText");
  try {
    await prisma.mediaAsset.update({ where: { id }, data: { altText: altText ?? Prisma.JsonNull } });
  } catch (err) {
    console.error("[admin] updateMediaAlt failed", err);
    return { error: "השמירה נכשלה." };
  }
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
  return { saved: true };
}

export type DeleteMediaResult = { error: string } | undefined;

export async function deleteMedia(id: string): Promise<DeleteMediaResult> {
  await requireAdminSession();
  const media = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!media) return;

  // ProductImage.mediaId is a required FK with no onDelete set (Prisma
  // defaults to RESTRICT), so deleting a media asset still attached to a
  // product photo would otherwise throw an unhandled foreign-key violation
  // and crash the page for a non-technical admin. Check usage first and
  // give a clear, actionable message instead.
  const usageCount = await prisma.productImage.count({ where: { mediaId: id } });
  if (usageCount > 0) {
    return {
      error: `אי אפשר למחוק — התמונה משויכת ל-${usageCount} מוצר/ים. יש להסיר אותה מהמוצרים קודם.`,
    };
  }

  await prisma.mediaAsset.delete({ where: { id } });

  if (media.url.startsWith("/api/media/")) {
    await deleteMediaBlob(media.url.slice("/api/media/".length)).catch(() => {
      // already gone — nothing to do
    });
  } else if (media.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", media.url)).catch(() => {
      // file already missing — nothing to do
    });
  }

  revalidatePath("/admin/media");
}
