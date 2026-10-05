"use server";

import { prisma } from "@/lib/prisma";
import { computeConfiguredPrice, type MetalSelection, type CalculatorDiamondChoice } from "@/lib/pricing/engine";
import { getMetalPrice, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { resolveConfiguredPrice } from "@/server/pricing/resolve-configured-price";
import { MetalType } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/auth/guards";

export type ConfiguredPriceRequest = {
  productId: string;
  materialOptionId: string; // the product's own ProductMaterialOption id the customer selected
  diamondOptionIds: string[]; // ids of the product's own ProductDiamondOption rows the customer selected
  // Only sent for a product that has no real ProductDiamondOption rows of
  // its own — the customer's pick from the calculator-pricelist diamond
  // filter (see resolveConfiguredPrice).
  calculatorDiamondSpec?: CalculatorDiamondChoice | null;
};

// Customer-facing result — deliberately excludes any cost breakdown (base
// cost, margin, per-component costs). See AGENTS.md step 20: the shopper
// sees only the selected options and the final price.
export type ConfiguredPriceResponse =
  | { ok: true; sellingPrice: number }
  | { ok: false; message: string };

// Called from the product page client component whenever the shopper
// changes their material/diamond selection — recomputes from scratch
// server-side every time via the same resolver createOrder uses at
// checkout, rather than trusting any client-sent price.
export async function getConfiguredPrice(req: ConfiguredPriceRequest): Promise<ConfiguredPriceResponse> {
  // Pick the fields explicitly: `fresh` (bypass the price caches) is for
  // checkout only and must never be settable by a browser.
  const result = await resolveConfiguredPrice({
    productId: req.productId,
    materialOptionId: req.materialOptionId,
    diamondOptionIds: req.diamondOptionIds,
    calculatorDiamondSpec: req.calculatorDiamondSpec,
  });
  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, sellingPrice: result.sellingPrice };
}

// Admin-facing: same computation, but returns the full cost breakdown for
// the product's *default* material/diamond selection, used on the admin
// product screen and the Phase-23 report. Never called from customer code.
export async function getConfiguredPriceBreakdownForAdmin(productId: string) {
  // Exported from a "use server" file, so it is reachable as an endpoint:
  // the cost/margin breakdown must never be served to a non-admin.
  await requireAdminSession();
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
  const [diamondPriceEntries, diamondBaseCostRanges] = defaultDiamonds.length
    ? await Promise.all([prisma.diamondPriceEntry.findMany(), prisma.diamondBaseCostRange.findMany()])
    : [[], []];

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
      fancyColor: d.fancyColor,
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
    diamondBaseCostRanges: diamondBaseCostRanges.map((r) => ({
      category: r.category,
      minCostPerCarat: Number(r.minCostPerCarat),
      maxCostPerCarat: Number(r.maxCostPerCarat),
      currency: r.currency,
    })),
  });
}
