"use server";

import { prisma } from "@/lib/prisma";
import { computeConfiguredPrice, type DiamondSelection, type MetalSelection } from "@/lib/pricing/engine";
import { getMetalPrice, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { MetalType } from "@/generated/prisma/enums";

export type ConfiguredPriceRequest = {
  productId: string;
  metal: MetalSelection;
  diamondOptionIds: string[]; // ids of the product's own ProductDiamondOption rows the customer selected
};

// Customer-facing result — deliberately excludes any cost breakdown (base
// cost, margin, per-component costs). See AGENTS.md step 20: the shopper
// sees only the selected options and the final price.
export type ConfiguredPriceResponse =
  | { ok: true; sellingPrice: number }
  | { ok: false; message: string };

const MISSING_DATA_MESSAGE_HE: Record<string, string> = {
  MISSING_METAL_WEIGHT: "התמחור עבור המוצר הזה עדיין בבדיקה.",
  MISSING_METAL_PRICE: "מחיר השוק הנוכחי אינו זמין כרגע — נסו שוב בעוד מספר דקות.",
  MISSING_MANUFACTURING_COST: "התמחור עבור המוצר הזה עדיין בבדיקה.",
  MISSING_DIAMOND_PRICE: "התמחור עבור הבחירה הזו עדיין בבדיקה.",
};

// Called from the product page client component whenever the shopper
// changes their material/diamond selection — recomputes from scratch
// server-side every time rather than trusting any client-sent price.
export async function getConfiguredPrice(req: ConfiguredPriceRequest): Promise<ConfiguredPriceResponse> {
  const product = await prisma.product.findUnique({
    where: { id: req.productId },
    include: { diamondOptions: true },
  });
  if (!product) return { ok: false, message: "המוצר לא נמצא." };

  if (req.metal.metalType === MetalType.GOLD) {
    await refreshGoldPriceIfStale();
  }
  const metalPrice = await getMetalPrice(req.metal.metalType);

  const diamondPriceEntries = req.diamondOptionIds.length
    ? await prisma.diamondPriceEntry.findMany()
    : [];

  const selectedDiamonds: DiamondSelection[] = product.diamondOptions
    .filter((d) => req.diamondOptionIds.includes(d.id))
    .map((d) => ({
      diamondType: d.diamondType,
      shape: d.shape,
      caratWeight: Number(d.caratWeight),
      colorGrade: d.colorGrade,
      clarityGrade: d.clarityGrade,
      quantity: d.quantity,
    }));

  const result = computeConfiguredPrice({
    metalWeightGrams: product.metalWeightGrams ? Number(product.metalWeightGrams) : null,
    manufacturingCost: product.manufacturingCost ? Number(product.manufacturingCost) : null,
    settingCost: product.settingCost ? Number(product.settingCost) : null,
    otherCost: product.otherCost ? Number(product.otherCost) : null,
    metalPricePerGram: metalPrice ? Number(metalPrice.pricePerGram) : null,
    metal: req.metal,
    diamonds: selectedDiamonds,
    diamondPriceEntries: diamondPriceEntries.map((e) => ({
      diamondType: e.diamondType,
      shape: e.shape,
      caratMin: Number(e.caratMin),
      caratMax: Number(e.caratMax),
      colorGrade: e.colorGrade,
      clarityGrade: e.clarityGrade,
      pricePerCarat: Number(e.pricePerCarat),
    })),
  });

  if (!result.ok) {
    return { ok: false, message: MISSING_DATA_MESSAGE_HE[result.reason] ?? "התמחור עדיין בבדיקה." };
  }
  return { ok: true, sellingPrice: result.sellingPrice };
}

// Admin-facing: same computation, but returns the full cost breakdown for
// the product's *default* material/diamond selection, used on the admin
// product screen and the Phase-23 report. Never called from customer code.
export async function getConfiguredPriceBreakdownForAdmin(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { materialOptions: true, diamondOptions: true },
  });
  if (!product) return null;

  const defaultMaterial = product.materialOptions.find((m) => m.isDefault) ?? product.materialOptions[0];
  if (!defaultMaterial) return { ok: false as const, reason: "MISSING_MATERIAL_OPTION" as const };

  const metal: MetalSelection = { metalType: defaultMaterial.metalType, purity: defaultMaterial.purity };
  if (metal.metalType === MetalType.GOLD) {
    await refreshGoldPriceIfStale();
  }
  const metalPrice = await getMetalPrice(metal.metalType);

  const defaultDiamonds = product.diamondOptions.filter((d) => d.isDefault);
  const diamondPriceEntries = defaultDiamonds.length ? await prisma.diamondPriceEntry.findMany() : [];

  return computeConfiguredPrice({
    metalWeightGrams: product.metalWeightGrams ? Number(product.metalWeightGrams) : null,
    manufacturingCost: product.manufacturingCost ? Number(product.manufacturingCost) : null,
    settingCost: product.settingCost ? Number(product.settingCost) : null,
    otherCost: product.otherCost ? Number(product.otherCost) : null,
    metalPricePerGram: metalPrice ? Number(metalPrice.pricePerGram) : null,
    metal,
    diamonds: defaultDiamonds.map((d) => ({
      diamondType: d.diamondType,
      shape: d.shape,
      caratWeight: Number(d.caratWeight),
      colorGrade: d.colorGrade,
      clarityGrade: d.clarityGrade,
      quantity: d.quantity,
    })),
    diamondPriceEntries: diamondPriceEntries.map((e) => ({
      diamondType: e.diamondType,
      shape: e.shape,
      caratMin: Number(e.caratMin),
      caratMax: Number(e.caratMax),
      colorGrade: e.colorGrade,
      clarityGrade: e.clarityGrade,
      pricePerCarat: Number(e.pricePerCarat),
    })),
  });
}
