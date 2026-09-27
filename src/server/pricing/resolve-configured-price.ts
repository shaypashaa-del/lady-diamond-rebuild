import { prisma } from "@/lib/prisma";
import { computeConfiguredPrice, type DiamondSelection } from "@/lib/pricing/engine";
import { getMetalPrice, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { MetalType } from "@/generated/prisma/enums";

// The single, authoritative place a CONFIGURABLE product's selling price is
// computed — called from the client-facing getConfiguredPrice action (for
// the live price shown while shopping) AND from createOrder at checkout
// (so what a customer is actually charged is always recomputed here too,
// never trusted from the client/cart). Takes a materialOptionId rather than
// a raw metal type/purity so it can validate the selection actually belongs
// to this product, instead of pricing an arbitrary metal/purity combo the
// product was never configured to sell.
export type ResolveConfiguredPriceResult =
  | { ok: true; sellingPrice: number; materialOptionId: string; diamondOptionIds: string[] }
  | { ok: false; reason: string; message: string };

const MISSING_DATA_MESSAGE_HE: Record<string, string> = {
  MISSING_PRODUCT: "המוצר לא נמצא.",
  INVALID_MATERIAL: "אפשרות החומר שנבחרה אינה תקינה עבור המוצר הזה.",
  MISSING_METAL_WEIGHT: "התמחור עבור המוצר הזה עדיין בבדיקה.",
  MISSING_METAL_PRICE: "מחיר השוק הנוכחי אינו זמין כרגע — נסו שוב בעוד מספר דקות.",
  MISSING_MANUFACTURING_COST: "התמחור עבור המוצר הזה עדיין בבדיקה.",
  MISSING_DIAMOND_PRICE: "התמחור עבור הבחירה הזו עדיין בבדיקה.",
  MISSING_FX_RATE: "התמחור עבור הבחירה הזו עדיין בבדיקה.",
};

export async function resolveConfiguredPrice(params: {
  productId: string;
  materialOptionId: string;
  diamondOptionIds: string[];
}): Promise<ResolveConfiguredPriceResult> {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { materialOptions: true, diamondOptions: true },
  });
  if (!product) {
    return { ok: false, reason: "MISSING_PRODUCT", message: MISSING_DATA_MESSAGE_HE.MISSING_PRODUCT };
  }

  const material = product.materialOptions.find((m) => m.id === params.materialOptionId && m.active);
  if (!material) {
    return { ok: false, reason: "INVALID_MATERIAL", message: MISSING_DATA_MESSAGE_HE.INVALID_MATERIAL };
  }

  // Silently drop any id that doesn't actually belong to this product,
  // rather than erroring — a stale/tampered id should just not price in,
  // never crash checkout.
  const validDiamondIds = new Set(product.diamondOptions.map((d) => d.id));
  const diamondOptionIds = params.diamondOptionIds.filter((id) => validDiamondIds.has(id));

  if (material.metalType === MetalType.GOLD) {
    await refreshGoldPriceIfStale();
  }
  const metalPrice = await getMetalPrice(material.metalType);

  const [diamondPriceEntries, diamondBaseCostRanges] = diamondOptionIds.length
    ? await Promise.all([prisma.diamondPriceEntry.findMany(), prisma.diamondBaseCostRange.findMany()])
    : [[], []];

  const selectedDiamonds: DiamondSelection[] = product.diamondOptions
    .filter((d) => diamondOptionIds.includes(d.id))
    .map((d) => ({
      diamondType: d.diamondType,
      shape: d.shape,
      caratWeight: Number(d.caratWeight),
      colorGrade: d.colorGrade,
      clarityGrade: d.clarityGrade,
      fancyColor: d.fancyColor,
      quantity: d.quantity,
    }));

  const result = computeConfiguredPrice({
    metalWeightGrams: product.metalWeightGrams ? Number(product.metalWeightGrams) : null,
    manufacturingCost: product.manufacturingCost ? Number(product.manufacturingCost) : null,
    settingCost: product.settingCost ? Number(product.settingCost) : null,
    otherCost: product.otherCost ? Number(product.otherCost) : null,
    metalPricePerGram: metalPrice ? Number(metalPrice.pricePerGram) : null,
    metal: { metalType: material.metalType, purity: material.purity },
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
    diamondBaseCostRanges: diamondBaseCostRanges.map((r) => ({
      category: r.category,
      minCostPerCarat: Number(r.minCostPerCarat),
      maxCostPerCarat: Number(r.maxCostPerCarat),
      currency: r.currency,
    })),
  });

  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason,
      message: MISSING_DATA_MESSAGE_HE[result.reason] ?? "התמחור עדיין בבדיקה.",
    };
  }
  return { ok: true, sellingPrice: result.sellingPrice, materialOptionId: material.id, diamondOptionIds };
}
