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

async function saveUploadedImage(file: File): Promise<{ mediaId: string } | { error: string }> {
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
  return { mediaId: media.id };
}

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
  const saved = await saveUploadedImage(file);
  if ("error" in saved) return saved;

  await prisma.customDesignRequest.update({
    where: { id },
    data: { generatedImageId: saved.mediaId, status: "GENERATED" },
  });

  revalidatePath(`/admin/custom-design-requests/${id}`);
  revalidatePath("/admin/custom-design-requests");
  return { uploaded: true };
}

const VIEW_LABELS = ["Perspective", "Front", "Top", "Right"] as const;

export type UploadRenderImageResult = { error: string } | { uploaded: true } | undefined;

// One of the 4 standard CAD viewport captures (see VIEW_LABELS) — kept as
// its own row rather than overwriting a single "generated image" field, so
// all views a designer exports from Rhino/Matrix can sit side by side on
// the casting brief exactly like the CAD software's own layout.
export async function uploadRenderImage(
  requestId: string,
  viewLabel: string,
  _prevState: UploadRenderImageResult,
  formData: FormData
): Promise<UploadRenderImageResult> {
  await requireAdminSession();

  if (!VIEW_LABELS.includes(viewLabel as (typeof VIEW_LABELS)[number])) {
    return { error: "זווית תצוגה לא תקינה." };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "לא נבחר קובץ." };
  }
  const saved = await saveUploadedImage(file);
  if ("error" in saved) return saved;

  const sortOrder = VIEW_LABELS.indexOf(viewLabel as (typeof VIEW_LABELS)[number]);

  // One image per view per request — replace rather than accumulate if the
  // designer re-exports and re-uploads the same angle.
  const existing = await prisma.customDesignRenderImage.findFirst({
    where: { requestId, viewLabel },
  });
  if (existing) {
    await prisma.customDesignRenderImage.update({
      where: { id: existing.id },
      data: { mediaId: saved.mediaId },
    });
  } else {
    await prisma.customDesignRenderImage.create({
      data: { requestId, mediaId: saved.mediaId, viewLabel, sortOrder },
    });
  }

  revalidatePath(`/admin/custom-design-requests/${requestId}`);
  return { uploaded: true };
}

export async function deleteRenderImage(requestId: string, renderImageId: string) {
  await requireAdminSession();
  await prisma.customDesignRenderImage.delete({ where: { id: renderImageId } });
  revalidatePath(`/admin/custom-design-requests/${requestId}`);
}

export type CastingSpecFormResult = { error: string } | { saved: true } | undefined;

// One row per stone shape/size (e.g. "Marquise, 13.27x6.58mm, x1, 2.13ct")
// — arrives as a JSON string built client-side by the repeatable gem-rows
// UI, since a plain <form> can't post a variable-length list of grouped
// fields any more cleanly than that. Replaces the request's whole gem list
// on every save rather than diffing, which keeps this action simple and
// matches how the admin form always submits its full current state anyway.
export async function saveCastingSpec(
  id: string,
  _prevState: CastingSpecFormResult,
  formData: FormData
): Promise<CastingSpecFormResult> {
  await requireAdminSession();

  const modelNumber = String(formData.get("modelNumber") ?? "").trim() || null;
  const metalType = String(formData.get("metalType") ?? "").trim() || null;
  const metalWeightGramsRaw = String(formData.get("metalWeightGrams") ?? "").trim();
  const metalWeightDwtRaw = String(formData.get("metalWeightDwt") ?? "").trim();
  const metalWeightGrams = metalWeightGramsRaw ? Number(metalWeightGramsRaw) : null;
  const metalWeightDwt = metalWeightDwtRaw ? Number(metalWeightDwtRaw) : null;

  if (metalWeightGrams != null && (Number.isNaN(metalWeightGrams) || metalWeightGrams < 0)) {
    return { error: "משקל מתכת (גרם) לא תקין." };
  }
  if (metalWeightDwt != null && (Number.isNaN(metalWeightDwt) || metalWeightDwt < 0)) {
    return { error: "משקל מתכת (DWT) לא תקין." };
  }

  let gems: { shape: string; dimensionsMm: string; count: number; caratWeight: number }[] = [];
  const gemsRaw = String(formData.get("gems") ?? "[]");
  try {
    const parsed = JSON.parse(gemsRaw);
    if (Array.isArray(parsed)) {
      gems = parsed
        .map((g) => ({
          shape: String(g.shape ?? "").trim(),
          dimensionsMm: String(g.dimensionsMm ?? "").trim(),
          count: Math.max(1, Math.trunc(Number(g.count) || 1)),
          caratWeight: Number(g.caratWeight) || 0,
        }))
        .filter((g) => g.shape || g.dimensionsMm || g.caratWeight > 0);
    }
  } catch {
    return { error: "טבלת אבנים לא תקינה." };
  }

  await prisma.$transaction([
    prisma.customDesignRequest.update({
      where: { id },
      data: { modelNumber, metalType, metalWeightGrams, metalWeightDwt },
    }),
    prisma.customDesignGem.deleteMany({ where: { requestId: id } }),
    ...(gems.length > 0
      ? [
          prisma.customDesignGem.createMany({
            data: gems.map((g, i) => ({ requestId: id, sortOrder: i, ...g })),
          }),
        ]
      : []),
  ]);

  revalidatePath(`/admin/custom-design-requests/${id}`);
  return { saved: true };
}
