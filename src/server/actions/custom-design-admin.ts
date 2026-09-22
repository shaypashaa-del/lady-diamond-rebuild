"use server";

import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import { sniffImageType, EXTENSION_BY_TYPE } from "@/lib/image-sniff";
import type { CustomDesignStatus } from "@/generated/prisma/enums";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export type CustomDesignAdminFormResult = { error: string } | { saved: true } | undefined;

// One combined form on the detail page: status, admin notes, and an
// optional replacement "generated design" image (the slot a real AI
// pipeline will eventually fill automatically — for now staff attach it by
// hand, e.g. a render they made in another tool, or later the AI output).
export async function updateCustomDesignRequest(
  id: string,
  _prevState: CustomDesignAdminFormResult,
  formData: FormData
): Promise<CustomDesignAdminFormResult> {
  await requireAdminSession();

  const status = String(formData.get("status") ?? "") as CustomDesignStatus;
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;
  const validStatuses: CustomDesignStatus[] = [
    "NEW",
    "IN_REVIEW",
    "GENERATED",
    "SENT_TO_FACTORY",
    "COMPLETED",
    "REJECTED",
  ];
  if (!validStatuses.includes(status)) {
    return { error: "סטטוס לא תקין." };
  }

  await prisma.customDesignRequest.update({
    where: { id },
    data: { status, adminNotes },
  });

  revalidatePath(`/admin/custom-design-requests/${id}`);
  revalidatePath("/admin/custom-design-requests");
  return { saved: true };
}

export type UploadGeneratedImageResult = { error: string } | { uploaded: true } | undefined;

// Combined upload + attach in one step, so staff don't have to go via the
// separate media-library flow and then find a way to reference the id —
// pick a file here and it's immediately the request's generated design.
export async function uploadGeneratedImage(
  id: string,
  _prevState: UploadGeneratedImageResult,
  formData: FormData
): Promise<UploadGeneratedImageResult> {
  await requireAdminSession();

  const file = formData.get("file");
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

  const media = await prisma.mediaAsset.create({
    data: { url: `/uploads/${filename}`, filename: file.name || filename },
  });

  await prisma.customDesignRequest.update({
    where: { id },
    data: { generatedImageId: media.id, status: "GENERATED" },
  });

  revalidatePath(`/admin/custom-design-requests/${id}`);
  revalidatePath("/admin/custom-design-requests");
  return { uploaded: true };
}
