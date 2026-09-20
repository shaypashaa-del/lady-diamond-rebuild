"use server";

import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

// A fixed extension per real, sniffed image type — never derived from the
// client-supplied filename, which could otherwise be used to smuggle an
// arbitrary extension (e.g. ".html" or ".svg" with an inline script) onto
// disk under /public/uploads, served directly by Next's static handler.
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// `file.type` is just the client-reported MIME type from the multipart
// request and is trivially spoofable — sniff the real format from the
// file's magic bytes instead of trusting it.
function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

// NOTE: stores files on local disk under public/uploads. Fine for development
// and single-instance deployments, but a real production deployment (multiple
// server instances, ephemeral filesystems like most serverless platforms)
// needs real object storage (S3, Cloudinary, etc.) instead — swap this
// function's body for an upload to that provider; nothing else needs to
// change since callers only depend on the returned MediaAsset shape.
export async function uploadMedia(formData: FormData) {
  await requireAdminSession();
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "");

  if (!(file instanceof File)) {
    return { error: "לא נבחר קובץ." };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: "הקובץ גדול מדי (מקסימום 8MB)." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffedType = sniffImageType(buffer);
  const ext = sniffedType && EXTENSION_BY_TYPE[sniffedType];
  if (!ext) {
    return { error: "סוג קובץ לא נתמך. יש להעלות JPG, PNG, WEBP או GIF." };
  }

  const filename = `${randomUUID()}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  await prisma.mediaAsset.create({
    data: {
      url: `/uploads/${filename}`,
      filename: file.name,
      altText: altText || undefined,
    },
  });

  revalidatePath("/admin/media");
  return { uploaded: true as const };
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

  if (media.url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", media.url)).catch(() => {
      // file already missing — nothing to do
    });
  }

  revalidatePath("/admin/media");
}
