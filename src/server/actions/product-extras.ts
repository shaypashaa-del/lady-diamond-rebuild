"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/guards";
import { revalidateProductPageById } from "@/server/revalidate-product";
import { saveProductExtras, type ProductExtras } from "@/server/product-extras";

function loc(formData: FormData, prefix: string) {
  const he = String(formData.get(`${prefix}_he`) ?? "").trim();
  const en = String(formData.get(`${prefix}_en`) ?? "").trim();
  const ru = String(formData.get(`${prefix}_ru`) ?? "").trim();
  return he || en || ru ? { he, en: en || undefined, ru: ru || undefined } : undefined;
}

export async function updateProductExtras(
  productId: string,
  formData: FormData
): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();

  const text = (k: string) => String(formData.get(k) ?? "").trim() || undefined;
  // Blank = not set; anything else must be a non-negative number.
  const num = (k: string, integer = false): number | undefined | "invalid" => {
    const raw = String(formData.get(k) ?? "").trim();
    if (raw === "") return undefined;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return "invalid";
    return integer ? Math.round(n) : n;
  };

  const fields = {
    minQty: num("minQty", true),
    maxQty: num("maxQty", true),
    leadTimeDays: num("leadTimeDays", true),
    lowStockThreshold: num("lowStockThreshold", true),
    engravingFee: num("engravingFee"),
    engravingMaxLen: num("engravingMaxLen", true),
    giftWrapFee: num("giftWrapFee"),
    shippingWeightGrams: num("shippingWeightGrams"),
    lengthMm: num("lengthMm"),
    widthMm: num("widthMm"),
    heightMm: num("heightMm"),
    costPrice: num("costPrice"),
  };
  for (const [k, v] of Object.entries(fields)) {
    if (v === "invalid") return { error: `ערך לא תקין בשדה ${k}. יש להזין מספר חיובי או להשאיר ריק.` };
  }
  const f = fields as Record<string, number | undefined>;
  if (f.minQty !== undefined && f.minQty < 1) return { error: "כמות מינימום חייבת להיות 1 או יותר." };
  if (f.maxQty !== undefined && f.maxQty < 1) return { error: "כמות מקסימום חייבת להיות 1 או יותר." };
  if (f.minQty !== undefined && f.maxQty !== undefined && f.minQty > f.maxQty) {
    return { error: "כמות המינימום גדולה מהמקסימום." };
  }
  const badgeRaw = String(formData.get("badge") ?? "");
  const badge = (["NEW", "BESTSELLER", "LIMITED"] as const).find((b) => b === badgeRaw);
  const dateOf = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
  };
  const saleStart = dateOf("saleStart");
  const saleEnd = dateOf("saleEnd");
  if (saleStart && saleEnd && saleStart > saleEnd) return { error: "תאריך סיום המבצע לפני תאריך ההתחלה." };
  const sizes = String(formData.get("sizes") ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sizes.length > 40 || sizes.some((s) => s.length > 20)) return { error: "רשימת המידות ארוכה או לא תקינה." };
  const gtin = text("gtin");
  if (gtin && !/^\d{8,14}$/.test(gtin)) return { error: "ברקוד (GTIN) חייב להיות 8 עד 14 ספרות." };

  const data: ProductExtras = {
    badge,
    brand: text("brand"),
    gtin,
    mpn: text("mpn"),
    warranty: loc(formData, "warranty"),
    care: loc(formData, "care"),
    certificate: loc(formData, "certificate"),
    minQty: f.minQty,
    maxQty: f.maxQty,
    allowBackorder: formData.get("allowBackorder") === "on" || undefined,
    leadTimeDays: f.leadTimeDays,
    lowStockThreshold: f.lowStockThreshold,
    shippingWeightGrams: f.shippingWeightGrams,
    lengthMm: f.lengthMm,
    widthMm: f.widthMm,
    heightMm: f.heightMm,
    costPrice: f.costPrice,
    sizes: sizes.length ? Array.from(new Set(sizes)) : undefined,
    engraving: formData.get("engraving") === "on" || undefined,
    engravingFee: f.engravingFee,
    engravingMaxLen: f.engravingMaxLen,
    giftWrap: formData.get("giftWrap") === "on" || undefined,
    giftWrapFee: f.giftWrapFee,
    saleStart,
    saleEnd,
    supplier: text("supplier"),
    internalNotes: text("internalNotes"),
  };
  // Drop empty keys so the stored document stays small and clean.
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as ProductExtras;

  try {
    await saveProductExtras(productId, clean);
  } catch (err) {
    console.error("[admin] updateProductExtras failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }

  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
  return { saved: true };
}
