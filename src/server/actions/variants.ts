"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import { revalidateProductPageById } from "@/server/revalidate-product";

type Result = { saved: true } | { error: string };

const ATTRIBUTES = ["color", "size", "material", "length", "stone"] as const;

function localizedFromForm(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}_he`) ?? "").trim(),
    en: String(formData.get(`${prefix}_en`) ?? "").trim() || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "").trim() || undefined,
  };
}

// Shared, validated reading of the variant fields (add and edit).
function readVariant(formData: FormData):
  | { error: string }
  | { sku: string | null; price: number; salePrice: number | null; inventory: number; value: ReturnType<typeof localizedFromForm>; imageId: string | null } {
  const value = localizedFromForm(formData, "value");
  if (!value.he) return { error: "יש למלא את הערך בעברית." };
  const price = Number(formData.get("price"));
  if (!Number.isFinite(price) || price <= 0) return { error: "יש להזין מחיר גדול מ-0." };
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  const salePrice = saleRaw === "" ? null : Number(saleRaw);
  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price)) {
    return { error: "מחיר מבצע חייב להיות נמוך מהמחיר הרגיל (או ריק)." };
  }
  const inventory = Math.floor(Number(formData.get("inventory") || 0));
  if (!Number.isFinite(inventory) || inventory < 0) return { error: "מלאי לא תקין." };
  return {
    sku: String(formData.get("sku") ?? "").trim() || null,
    price,
    salePrice,
    inventory,
    value,
    imageId: String(formData.get("imageId") ?? "").trim() || null,
  };
}

function describe(err: unknown): string {
  const e = err as { code?: string; message?: string };
  if (e?.code === "P2002" || /unique/i.test(e?.message ?? "")) return "מק״ט (SKU) כזה כבר קיים בוריאציה אחרת.";
  console.error("[admin] variant save failed", err);
  return "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו.";
}

async function refresh(productId: string) {
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
}

export async function addVariant(productId: string, formData: FormData): Promise<Result> {
  await requireAdminSession();
  const data = readVariant(formData);
  if ("error" in data) return data;
  const attributeName = String(formData.get("attributeName") ?? "color");
  if (!(ATTRIBUTES as readonly string[]).includes(attributeName)) return { error: "סוג וריאציה לא תקין." };

  try {
    await prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku ?? undefined,
        price: data.price,
        salePrice: data.salePrice ?? undefined,
        inventory: data.inventory,
        imageId: data.imageId,
        attributes: { [attributeName]: data.value },
      },
    });
  } catch (err) {
    return { error: describe(err) };
  }
  await refresh(productId);
  return { saved: true };
}

// Editing in place keeps the variant's id, so carts and past orders that
// reference it stay valid (delete + re-create used to break them).
export async function updateVariant(id: string, productId: string, formData: FormData): Promise<Result> {
  await requireAdminSession();
  const data = readVariant(formData);
  if ("error" in data) return data;
  const existing = await prisma.productVariant.findFirst({ where: { id, productId }, select: { attributes: true } });
  if (!existing) return { error: "הוריאציה לא נמצאה." };
  const attrName = Object.keys((existing.attributes as Record<string, unknown>) ?? {})[0] ?? "color";

  try {
    await prisma.productVariant.update({
      where: { id },
      data: {
        sku: data.sku,
        price: data.price,
        salePrice: data.salePrice,
        inventory: data.inventory,
        imageId: data.imageId,
        attributes: { [attrName]: data.value },
      },
    });
  } catch (err) {
    return { error: describe(err) };
  }
  await refresh(productId);
  return { saved: true };
}

export async function deleteVariant(id: string, productId: string) {
  await requireAdminSession();
  try {
    await prisma.productVariant.delete({ where: { id } });
  } catch (err) {
    // A variant that already appears on an order cannot be deleted.
    console.error("[admin] deleteVariant failed", err);
  }
  await refresh(productId);
}
