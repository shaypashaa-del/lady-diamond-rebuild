// Central pricing engine — the ONE place price is computed from cost
// inputs. Nothing outside this file may compute a configurable selling
// price; everything else (server actions, admin screens, the product page)
// calls into this module and just renders/stores its result.
//
// Formula (per owner's explicit instruction — a margin, not a markup):
//   Final Selling Price = Base Cost / (1 - GROSS_MARGIN)
// NOT `Base Cost * (1 + GROSS_MARGIN)` — that is a different, smaller
// number and must never be used here.
//
// This module never invents a missing input. Any required cost that isn't
// available returns a typed `MissingData` result instead of a guessed
// price — callers must treat that as "pricing not ready", never as zero.

import { GROSS_MARGIN, PURITY_FRACTION } from "./constants";

export type MetalSelection = {
  metalType: "GOLD" | "SILVER" | "PLATINUM";
  purity: "K9" | "K14" | "K18" | "K22" | "K24" | "S925" | "S999" | "PT950";
};

export type DiamondSelection = {
  diamondType: "NATURAL" | "LAB_GROWN";
  shape: string;
  caratWeight: number;
  colorGrade: string | null;
  clarityGrade: string | null;
  quantity: number;
};

export type DiamondPriceEntryLike = {
  diamondType: "NATURAL" | "LAB_GROWN";
  shape: string;
  caratMin: number;
  caratMax: number;
  colorGrade: string | null;
  clarityGrade: string | null;
  pricePerCarat: number;
};

export type PricingCostInputs = {
  metalWeightGrams: number | null;
  manufacturingCost: number | null;
  settingCost: number | null;
  otherCost: number | null;
  metalPricePerGram: number | null; // pure-metal reference price, per gram
  metal: MetalSelection;
  diamonds: DiamondSelection[];
  diamondPriceEntries: DiamondPriceEntryLike[];
};

export type PricingBreakdown = {
  ok: true;
  metalCost: number;
  diamondCost: number;
  manufacturingCost: number;
  settingCost: number;
  otherCost: number;
  baseCost: number;
  sellingPrice: number;
  grossProfit: number;
  grossMargin: number;
};

export type MissingDataResult = {
  ok: false;
  reason:
    | "MISSING_METAL_WEIGHT"
    | "MISSING_METAL_PRICE"
    | "MISSING_MANUFACTURING_COST"
    | "MISSING_DIAMOND_PRICE";
  detail: string;
};

export type PricingResult = PricingBreakdown | MissingDataResult;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function findDiamondPrice(
  spec: DiamondSelection,
  entries: DiamondPriceEntryLike[]
): number | null {
  const match = entries.find(
    (e) =>
      e.diamondType === spec.diamondType &&
      e.shape === spec.shape &&
      spec.caratWeight >= e.caratMin &&
      spec.caratWeight <= e.caratMax &&
      (e.colorGrade === null || e.colorGrade === spec.colorGrade) &&
      (e.clarityGrade === null || e.clarityGrade === spec.clarityGrade)
  );
  return match ? match.pricePerCarat : null;
}

export function computeConfiguredPrice(input: PricingCostInputs): PricingResult {
  if (input.metalWeightGrams === null || input.metalWeightGrams <= 0) {
    return {
      ok: false,
      reason: "MISSING_METAL_WEIGHT",
      detail: "This product has no real metal weight entered yet.",
    };
  }
  if (input.metalPricePerGram === null) {
    return {
      ok: false,
      reason: "MISSING_METAL_PRICE",
      detail: `No current market price is available for ${input.metal.metalType}.`,
    };
  }
  if (input.manufacturingCost === null) {
    return {
      ok: false,
      reason: "MISSING_MANUFACTURING_COST",
      detail: "This product has no manufacturing cost entered yet.",
    };
  }

  const purityFraction = PURITY_FRACTION[input.metal.purity];
  const pureMetalGrams = input.metalWeightGrams * purityFraction;
  const metalCost = pureMetalGrams * input.metalPricePerGram;

  let diamondCost = 0;
  for (const spec of input.diamonds) {
    const pricePerCarat = findDiamondPrice(spec, input.diamondPriceEntries);
    if (pricePerCarat === null) {
      return {
        ok: false,
        reason: "MISSING_DIAMOND_PRICE",
        detail: `No price entry covers a ${spec.caratWeight}ct ${spec.shape} ${spec.diamondType} diamond${
          spec.colorGrade ? ` (color ${spec.colorGrade})` : ""
        }${spec.clarityGrade ? ` (clarity ${spec.clarityGrade})` : ""}.`,
      };
    }
    diamondCost += pricePerCarat * spec.caratWeight * spec.quantity;
  }

  const manufacturingCost = input.manufacturingCost;
  const settingCost = input.settingCost ?? 0;
  const otherCost = input.otherCost ?? 0;

  const baseCost = metalCost + diamondCost + manufacturingCost + settingCost + otherCost;
  const sellingPrice = baseCost / (1 - GROSS_MARGIN);
  const grossProfit = sellingPrice - baseCost;

  return {
    ok: true,
    metalCost: round2(metalCost),
    diamondCost: round2(diamondCost),
    manufacturingCost: round2(manufacturingCost),
    settingCost: round2(settingCost),
    otherCost: round2(otherCost),
    baseCost: round2(baseCost),
    sellingPrice: round2(sellingPrice),
    grossProfit: round2(grossProfit),
    grossMargin: GROSS_MARGIN,
  };
}
