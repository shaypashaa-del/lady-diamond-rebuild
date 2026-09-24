"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import {
  DiamondCertification,
  DiamondClarityGrade,
  DiamondColorGrade,
  DiamondShape,
  DiamondType,
  GoldColor,
  MetalPurity,
  MetalType,
  PricingMode,
} from "@/generated/prisma/enums";
import { setManualMetalPrice } from "@/server/services/market-prices";
import { VALID_PURITIES_FOR_METAL } from "@/lib/pricing/constants";

function enumOrNull<T extends string>(value: FormDataEntryValue | null, allowed: readonly T[]): T | null {
  const str = value ? String(value) : "";
  return (allowed as readonly string[]).includes(str) ? (str as T) : null;
}

// ---- Product-level pricing settings ----

export async function updateProductPricingSettings(productId: string, formData: FormData) {
  await requireAdminSession();

  const pricingMode =
    String(formData.get("pricingMode")) === PricingMode.CONFIGURABLE
      ? PricingMode.CONFIGURABLE
      : PricingMode.FLAT;
  const hasDiamond = formData.get("hasDiamond") === "on";

  const num = (key: string) => {
    const raw = formData.get(key);
    if (!raw || String(raw).trim() === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  await prisma.product.update({
    where: { id: productId },
    data: {
      pricingMode,
      hasDiamond,
      metalWeightGrams: num("metalWeightGrams"),
      manufacturingCost: num("manufacturingCost"),
      settingCost: num("settingCost"),
      otherCost: num("otherCost"),
    },
  });

  revalidatePath(`/admin/products/${productId}`);
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
}

export async function deleteMaterialOption(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productMaterialOption.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
}

// ---- Diamond options (per product) ----

export async function addDiamondOption(productId: string, formData: FormData) {
  await requireAdminSession();

  const diamondType = enumOrNull(formData.get("diamondType"), Object.values(DiamondType));
  const shape = enumOrNull(formData.get("shape"), Object.values(DiamondShape));
  const caratWeight = Number(formData.get("caratWeight"));
  if (!diamondType || !shape || !Number.isFinite(caratWeight) || caratWeight <= 0) return;

  const colorGrade = enumOrNull(formData.get("colorGrade"), Object.values(DiamondColorGrade));
  const clarityGrade = enumOrNull(formData.get("clarityGrade"), Object.values(DiamondClarityGrade));
  const certification = enumOrNull(formData.get("certification"), Object.values(DiamondCertification));
  const quantityRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? Math.round(quantityRaw) : 1;
  const isDefault = formData.get("isDefault") === "on";

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
    },
  });

  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteDiamondOption(id: string, productId: string) {
  await requireAdminSession();
  await prisma.productDiamondOption.delete({ where: { id } });
  revalidatePath(`/admin/products/${productId}`);
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
