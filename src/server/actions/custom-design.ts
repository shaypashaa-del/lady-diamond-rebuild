"use server";

import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { isValidEmail, truncate } from "@/lib/validation";
import { getClientIp, isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";
import { sniffImageType, EXTENSION_BY_TYPE } from "@/lib/image-sniff";
import type { JewelryType } from "@/generated/prisma/enums";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export type UploadCustomDesignAssetResult = { error: string } | { mediaId: string; url: string };

// Public — unlike uploadMedia in media.ts, this one is reachable by any
// site visitor (the whole point is a customer submitting their own
// inspiration photo or a canvas sketch before they have an account), so it
// can't use requireAdminSession(). Same magic-byte sniffing and size cap as
// the admin uploader, plus a rate limit, since it's otherwise an open
// upload endpoint.
export async function uploadCustomDesignAsset(formData: FormData): Promise<UploadCustomDesignAssetResult> {
  const rateLimitKey = `custom-design-upload:${await getClientIp()}`;
  if (isRateLimited(rateLimitKey, 20, 15 * 60 * 1000)) {
    return { error: "יותר מדי העלאות. נסו שוב בעוד כמה דקות." };
  }
  recordAttempt(rateLimitKey);

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

  return { mediaId: media.id, url: media.url };
}

export type SubmitCustomDesignResult = { error: string } | { submitted: true };

export async function submitCustomDesignRequest(
  _prevState: SubmitCustomDesignResult | undefined,
  formData: FormData
): Promise<SubmitCustomDesignResult> {
  const rateLimitKey = `custom-design-submit:${await getClientIp()}`;
  if (isRateLimited(rateLimitKey, 5, 15 * 60 * 1000)) {
    return { error: "נשלחו יותר מדי בקשות. יש לנסות שוב מאוחר יותר." };
  }
  recordAttempt(rateLimitKey);

  const jewelryType = String(formData.get("jewelryType") ?? "") as JewelryType;
  const description = truncate(String(formData.get("description") ?? "").trim(), 3000);
  const customerName = truncate(String(formData.get("customerName") ?? "").trim(), 200);
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const customerPhone = truncate(String(formData.get("customerPhone") ?? "").trim(), 50) || undefined;
  const inspirationImageId = String(formData.get("inspirationImageId") ?? "") || undefined;
  const sketchImageId = String(formData.get("sketchImageId") ?? "") || undefined;

  const validTypes: JewelryType[] = ["RING", "NECKLACE", "BRACELET", "EARRINGS", "OTHER"];
  if (!validTypes.includes(jewelryType)) {
    return { error: "יש לבחור סוג תכשיט." };
  }
  if (!customerName || !customerEmail) {
    return { error: "נא למלא שם ואימייל." };
  }
  if (!isValidEmail(customerEmail)) {
    return { error: "כתובת אימייל לא תקינה." };
  }
  if (!description && !inspirationImageId && !sketchImageId) {
    return { error: "נא לתאר את התכשיט, להעלות תמונת השראה או לצייר שרטוט." };
  }

  const session = await getSession();

  await prisma.customDesignRequest.create({
    data: {
      userId: session?.userId,
      jewelryType,
      description: description || "",
      customerName,
      customerEmail,
      customerPhone,
      inspirationImageId,
      sketchImageId,
    },
  });

  return { submitted: true };
}
