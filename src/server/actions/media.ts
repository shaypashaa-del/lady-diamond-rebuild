"use server";

import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

// NOTE: stores files on local disk under public/uploads. Fine for development
// and single-instance deployments, but a real production deployment (multiple
// server instances, ephemeral filesystems like most serverless platforms)
// needs real object storage (S3, Cloudinary, etc.) instead — swap this
// function's body for an upload to that provider; nothing else needs to
// change since callers only depend on the returned MediaAsset shape.
export async function uploadMedia(formData: FormData) {
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "");

  if (!(file instanceof File)) {
    return { error: "לא נבחר קובץ." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "סוג קובץ לא נתמך. יש להעלות JPG, PNG, WEBP או GIF." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "הקובץ גדול מדי (מקסימום 8MB)." };
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  await prisma.mediaAsset.create({
    data: {
      url: `/uploads/${filename}`,
      filename: file.name,
      altText: altText || undefined,
    },
  });

  revalidatePath("/admin/media");
}

export async function deleteMedia(id: string) {
  const media = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!media) return;

  await prisma.mediaAsset.delete({ where: { id } });

  if (media.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", media.url)).catch(() => {
      // file already missing — nothing to do
    });
  }

  revalidatePath("/admin/media");
}
