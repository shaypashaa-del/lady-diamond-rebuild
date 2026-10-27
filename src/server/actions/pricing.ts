"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import {
  DiamondCertification,
  DiamondClarityGrade,
  DiamondColorGrade,
  DiamondCostCategory,
  DiamondCutGrade,
  DiamondFluorescence,
  DiamondGrowthMethod,
  DiamondShape,
  DiamondType,
  FancyColor,
  FancyIntensity,
  GoldColor,
  MetalPurity,
  MetalType,
  PricingMode,
} from "@/generated/prisma/enums";
import { setManualMetalPrice } from "@/server/services/market-prices";
import { DIAMOND_QUALITY_TIERS, VALID_PURITIES_FOR_METAL } from "@/lib/pricing/constants";
import { revalidateProductPage } from "@/server/revalidate-product";
import { getAllManualPrices, setManualOptionPrice } from "@/server/pricing/manual-option-prices";
import { resolveConfiguredPrice } from "@/server/pricing/resolve-configured-price";

async function revalidateProductPageById(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product) revalidateProductPage(product.slug);
}

function enumOrNull<T extends string>(value: FormDataEntryValue | null, allowed: readonly T[]): T | null {
  const str = value ? String(value) : "";
  return (allowed as readonly string[]).includes(str) ? (str as T) : null;
}

// ---- Product-level pricing settings ----

export async function updateProductPricingSettings(
  productId: string,
  formData: FormData
): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();

  // Pricing is entered by hand now: the product page only sends "has diamond".
  // The pricing mode and the old cost inputs are left untouched unless a (legacy)
  // form sends them.
  const hasDiamond = formData.get("hasDiamond") === "on";
  const data: {
    hasDiamond: boolean;
    pricingMode?: PricingMode;
    metalWeightGrams?: number | null;
    manufacturingCost?: number | null;
    settingCost?: number | null;
    otherCost?: number | null;
  } = { hasDiamond };

  if (formData.has("pricingMode") || formData.has("manufacturingCost")) {
    const pricingMode =
      String(formData.get("pricingMode")) === PricingMode.CONFIGURABLE ? PricingMode.CONFIGURABLE : PricingMode.FLAT;
    const num = (key: string) => {
      const raw = formData.get(key);
      if (!raw || String(raw).trim() === "") return null;
      const n = Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };
    data.pricingMode = pricingMode;
    data.metalWeightGrams = num("metalWeightGrams");
    data.manufacturingCost = num("manufacturingCost");
    data.settingCost = num("settingCost");
    data.otherCost = num("otherCost");
  }

  try {
    await prisma.product.update({ where: { id: productId }, data });
  } catch (err) {
    console.error("[admin] updateProductPricingSettings failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  await revalidateProductPageById(productId);
  return { saved: true };
}

// ---- One-time move to hand-entered prices ----
// Stores, for every material option that has no hand-entered price yet, the price the
// shop shows today (VAT included) as its manual price. Prices on the site do not change;
// from then on they only change when edited by hand. Safe to run again: options that
// already have a manual price are never touched. Works in batches so each call is short.
export type FreezeResult = { processed: number; total: number; frozen: number; skipped: number; failed: string[] };

export async function freezeAutoPricesToManual(offset: number): Promise<FreezeResult | { error: string }> {
  await requireAdminSession();
  const BATCH = 8;
  const products = await prisma.product.findMany({
    where: { pricingMode: PricingMode.CONFIGURABLE },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      materialOptions: { where: { active: true }, select: { id: true } },
      diamondOptions: { where: { active: true }, orderBy: { sortOrder: "asc" }, select: { id: true, isDefault: true } },
    },
  });
  const slice = products.slice(offset, offset + BATCH);
  const manual = await getAllManualPrices(true);
  let frozen = 0;
  let skipped = 0;
  const failed: string[] = [];

  for (const p of slice) {
    const designed = p.diamondOptions.find((d) => d.isDefault) ?? p.diamondOptions[0];
    for (const o of p.materialOptions) {
      if (manual.has(o.id)) {
        skipped += 1;
        continue;
      }
      const r = await resolveConfiguredPrice({
        productId: p.id,
        materialOptionId: o.id,
        diamondOptionIds: designed ? [designed.id] : [],
        calculatorDiamondSpec: null,
      });
      if (!r.ok || !(r.sellingPrice > 0)) {
        const label = typeof p.name === "object" && p.name ? ((p.name as { he?: string }).he ?? p.id) : p.id;
        failed.push(`${label}: ${r.ok ? "מחיר 0" : r.message}`);
        continue;
      }
      await setManualOptionPrice(o.id, p.id, r.sellingPrice);
      frozen += 1;
    }
  }

  revalidatePath("/admin/products");
  if (offset + BATCH >= products.length) revalidatePath("/", "layout");
  return { processed: Math.min(offset + BATCH, products.length), total: products.length, frozen, skipped, failed };
}

// ---- Material options (per product) ----

export async function addMaterialOption(productId: string, formData: FormData) {
  await requireAdminSession();

  const metalType = enumOrNull(formData.get("metalType"), Object.values(MetalType));
  const purity = enumOrNull(formData.get("purity"), Object.values(MetalPurity));
  const goldColor = enumOrNull(formData.get("goldColor"), Object.values(GoldColor));
  if (!metalType || !purity) return;

  // Guard against a physically invalid combination (e.g. 22K Silver) even
  // if the client-side <select> filtering is bypassed.
  if (!VALID_PURITIES_FOR_METAL[metalType]?.includes(purity)) return;

  const isDefault = formData.get("isDefault") === "on";
  if (isDefault) {
    await prisma.productMaterialOption.updateMany({
      where: { productId },
      data: { isDefault: false },
    });
  }

  await prisma.productMaterialOption.create({
    data: {
      productId,
      metalType,
      purity,
      goldColor: metalType === MetalType.GOLD ? goldColor : null,
      isDefault,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
}

export async function deleteMaterialOption(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productMaterialOption.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
}

// ---- Diamond options (per product) ----

export async function addDiamondOption(productId: string, formData: FormData) {
  await requireAdminSession();

  const diamondType = enumOrNull(formData.get("diamondType"), Object.values(DiamondType));
  const shape = enumOrNull(formData.get("shape"), Object.values(DiamondShape));
  const caratWeight = Number(formData.get("caratWeight"));
  if (!diamondType || !shape || !Number.isFinite(caratWeight) || caratWeight <= 0) return;

  // A quality-tier preset (see DIAMOND_QUALITY_TIERS) fills color/clarity
  // and the friendly label automatically. Picking "custom" (or leaving it
  // unset) falls back to whatever raw color/clarity the admin selected by
  // hand, with no tier label — the technical grades still get shown.
  const tierId = String(formData.get("qualityTier") ?? "");
  const tier = DIAMOND_QUALITY_TIERS.find((t) => t.id === tierId);

  const colorGrade = tier
    ? (tier.colorGrade as DiamondColorGrade)
    : enumOrNull(formData.get("colorGrade"), Object.values(DiamondColorGrade));
  const clarityGrade = tier
    ? (tier.clarityGrade as DiamondClarityGrade)
    : enumOrNull(formData.get("clarityGrade"), Object.values(DiamondClarityGrade));
  const qualityTierLabel = tier?.label ?? null;

  const certification = enumOrNull(formData.get("certification"), Object.values(DiamondCertification));
  const quantityRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.round(quantityRaw) : 1;
  const isDefault = formData.get("isDefault") === "on";

  // Additive attributes from the owner's fuller diamond spec — each only
  // meaningful for a specific diamondType, so only stored when it applies
  // (a lab-grown option never gets a fancy color; a natural white diamond
  // never gets a growth method) even if the form somehow submitted one.
  const cutGrade = enumOrNull(formData.get("cutGrade"), Object.values(DiamondCutGrade));
  const fluorescence = enumOrNull(formData.get("fluorescence"), Object.values(DiamondFluorescence));
  const growthMethod =
    diamondType === DiamondType.LAB_GROWN
      ? enumOrNull(formData.get("growthMethod"), Object.values(DiamondGrowthMethod))
      : null;
  const fancyColor =
    diamondType === DiamondType.FANCY_COLOR
      ? enumOrNull(formData.get("fancyColor"), Object.values(FancyColor))
      : null;
  const fancyIntensity =
    diamondType === DiamondType.FANCY_COLOR
      ? enumOrNull(formData.get("fancyIntensity"), Object.values(FancyIntensity))
      : null;

  if (isDefault) {
    await prisma.productDiamondOption.updateMany({
      where: { productId },
      data: { isDefault: false },
    });
  }

  await prisma.productDiamondOption.create({
    data: {
      productId,
      diamondType,
      shape,
      caratWeight,
      colorGrade,
      clarityGrade,
      certification,
      quantity,
      isDefault,
      qualityTierLabel,
      cutGrade,
      fluorescence,
      growthMethod,
      fancyColor,
      fancyIntensity,
    },
  });

  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
}

export async function deleteDiamondOption(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productDiamondOption.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
}

// ---- Diamond price table (global, manual — see AGENTS.md step 7/17) ----

export async function addDiamondPriceEntry(formData: FormData) {
  await requireAdminSession();

  const diamondType = enumOrNull(formData.get("diamondType"), Object.values(DiamondType));
  const shape = enumOrNull(formData.get("shape"), Object.values(DiamondShape));
  const caratMin = Number(formData.get("caratMin"));
  const caratMax = Number(formData.get("caratMax"));
  const pricePerCarat = Number(formData.get("pricePerCarat"));
  const source = String(formData.get("source") ?? "").trim();

  if (
    !diamondType ||
    !shape ||
    !Number.isFinite(caratMin) ||
    !Number.isFinite(caratMax) ||
    caratMin < 0 ||
    caratMax <= caratMin ||
    !Number.isFinite(pricePerCarat) ||
    pricePerCarat <= 0 ||
    !source
  ) {
    return;
  }

  const colorGrade = enumOrNull(formData.get("colorGrade"), Object.values(DiamondColorGrade));
  const clarityGrade = enumOrNull(formData.get("clarityGrade"), Object.values(DiamondClarityGrade));
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;

  await prisma.diamondPriceEntry.create({
    data: {
      diamondType,
      shape,
      caratMin,
      caratMax,
      colorGrade,
      clarityGrade,
      pricePerCarat,
      source,
      sourceUrl,
    },
  });

  revalidatePath("/admin/pricing/diamonds");
}

export async function deleteDiamondPriceEntry(id: string) {
  await requireAdminSession();
  await prisma.diamondPriceEntry.delete({ where: { id } });
  revalidatePath("/admin/pricing/diamonds");
}

// ---- Diamond base-cost reference ranges (the 10-category wholesale table
// from the owner's spec) — one editable row per category, no code change
// needed to update a number. Explicitly "approximate reference ranges, not
// live supplier prices" per the owner's own instruction — never treat this
// as more precise than that. ----

export async function setDiamondBaseCostRange(formData: FormData) {
  await requireAdminSession();

  const category = enumOrNull(formData.get("category"), Object.values(DiamondCostCategory));
  const minCostPerCarat = Number(formData.get("minCostPerCarat"));
  const maxCostPerCarat = Number(formData.get("maxCostPerCarat"));
  const currency = String(formData.get("currency") ?? "").trim() || "USD";
  const source = String(formData.get("source") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;

  if (
    !category ||
    !Number.isFinite(minCostPerCarat) ||
    !Number.isFinite(maxCostPerCarat) ||
    minCostPerCarat < 0 ||
    maxCostPerCarat < minCostPerCarat ||
    !source
  ) {
    return;
  }

  await prisma.diamondBaseCostRange.upsert({
    where: { category },
    update: { minCostPerCarat, maxCostPerCarat, currency, source, note },
    create: { category, minCostPerCarat, maxCostPerCarat, currency, source, note },
  });

  revalidatePath("/admin/pricing/diamond-base-costs");
}

export async function deleteDiamondBaseCostRange(category: string) {
  await requireAdminSession();
  await prisma.diamondBaseCostRange.delete({ where: { category: category as DiamondCostCategory } });
  revalidatePath("/admin/pricing/diamond-base-costs");
}

// ---- Metal reference prices ----

export async function setManualMetalPriceAction(formData: FormData) {
  await requireAdminSession();

  const metalType = enumOrNull(formData.get("metalType"), Object.values(MetalType));
  const pricePerGram = Number(formData.get("pricePerGram"));
  const source = String(formData.get("source") ?? "").trim();
  if (!metalType || !Number.isFinite(pricePerGram) || pricePerGram <= 0 || !source) {
    return;
  }
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || undefined;

  await setManualMetalPrice({ metalType, pricePerGram, source, sourceUrl });
  revalidatePath("/admin/pricing/metals");
}

// ---- Hand-entered price for one material option ----

export async function setMaterialOptionManualPrice(
  optionId: string,
  productId: string,
  formData: FormData
): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();
  const raw = String(formData.get("price") ?? "").trim();
  const saleRaw = String(formData.get("salePrice") ?? "").trim();
  let price: number | null = null;
  if (raw !== "") {
    price = Number(raw);
    if (!Number.isFinite(price) || price <= 0) {
      return { error: "יש להזין מחיר מחירון גדול מ-0, או להשאיר ריק כדי לחזור לחישוב אוטומטי." };
    }
  }
  let salePrice: number | null = null;
  if (saleRaw !== "") {
    salePrice = Number(saleRaw);
    if (!Number.isFinite(salePrice) || salePrice <= 0) return { error: "מחיר המבצע חייב להיות גדול מ-0, או ריק." };
    if (price === null) return { error: "כדי להגדיר מחיר מבצע יש להזין קודם מחיר מחירון." };
    if (salePrice >= price) return { error: "מחיר המבצע חייב להיות נמוך ממחיר המחירון." };
  }
  const option = await prisma.productMaterialOption.findFirst({ where: { id: optionId, productId }, select: { id: true } });
  if (!option) return { error: "האפשרות לא נמצאה." };

  try {
    await setManualOptionPrice(optionId, productId, price, salePrice);
  } catch (err) {
    console.error("[admin] setMaterialOptionManualPrice failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  await revalidateProductPageById(productId);
  return { saved: true };
}

// ---- Photo shown when a material option is selected ----

export async function setMaterialOptionImage(
  optionId: string,
  productId: string,
  formData: FormData
): Promise<{ saved: true } | { error: string }> {
  await requireAdminSession();
  const url = String(formData.get("imageUrl") ?? "").trim();
  const option = await prisma.productMaterialOption.findFirst({ where: { id: optionId, productId }, select: { id: true } });
  if (!option) return { error: "האפשרות לא נמצאה." };
  if (url) {
    // Only a photo already attached to this product can be chosen.
    const attached = await prisma.productImage.findFirst({
      where: { productId, media: { url } },
      select: { id: true },
    });
    if (!attached) return { error: "אפשר לבחור רק תמונה ששויכה למוצר." };
  }
  try {
    await prisma.productMaterialOption.update({ where: { id: optionId }, data: { imageUrl: url || null } });
  } catch (err) {
    console.error("[admin] setMaterialOptionImage failed", err);
    return { error: "השמירה נכשלה. נסו שוב." };
  }
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductPageById(productId);
  return { saved: true };
}
