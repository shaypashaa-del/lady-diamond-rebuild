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

import { GROSS_MARGIN, PURITY_FRACTION, resolveDiamondCostCategory } from "./constants";

export type MetalSelection = {
  metalType: "GOLD" | "SILVER" | "PLATINUM";
  purity: "K9" | "K14" | "K18" | "K22" | "K24" | "S925" | "S999" | "PT950";
};

export type DiamondSelection = {
  diamondType: "NATURAL" | "LAB_GROWN" | "FANCY_COLOR";
  shape: string;
  caratWeight: number;
  colorGrade: string | null;
  clarityGrade: string | null;
  fancyColor?: string | null;
  quantity: number;
};

export type DiamondPriceEntryLike = {
  diamondType: "NATURAL" | "LAB_GROWN" | "FANCY_COLOR";
  shape: string;
  caratMin: number;
  caratMax: number;
  colorGrade: string | null;
  clarityGrade: string | null;
  pricePerCarat: number;
};

// A wholesale ~1ct reference range for one of the 10 DiamondCostCategory
// buckets — see DiamondBaseCostRange in schema.prisma. Only used as a
// fallback when no shape/carat-band DiamondPriceEntry matches (fancy
// colors, brown/champagne — categories the granular table doesn't cover).
export type DiamondBaseCostRangeLike = {
  category: string;
  minCostPerCarat: number;
  maxCostPerCarat: number;
  currency: string;
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
  diamondBaseCostRanges?: DiamondBaseCostRangeLike[];
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
    | "MISSING_DIAMOND_PRICE"
    | "MISSING_FX_RATE";
  detail: string;
};

export type PricingResult = PricingBreakdown | MissingDataResult;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type DiamondPriceLookup =
  | { ok: true; pricePerCarat: number }
  | { ok: false; reason: "MISSING_DIAMOND_PRICE" | "MISSING_FX_RATE"; detail: string };

// Exported so any customer-facing "estimate a diamond's price" surface
// (currently just the public calculator) reuses the exact same lookup the
// real product pricing engine uses, instead of a second, drifting copy of
// the logic with its own guessed numbers.
export function findDiamondPrice(
  spec: DiamondSelection,
  entries: DiamondPriceEntryLike[],
  baseCostRanges: DiamondBaseCostRangeLike[]
): DiamondPriceLookup {
  const match = entries.find(
    (e) =>
      e.diamondType === spec.diamondType &&
      e.shape === spec.shape &&
      spec.caratWeight >= e.caratMin &&
      spec.caratWeight <= e.caratMax &&
      (e.colorGrade === null || e.colorGrade === spec.colorGrade) &&
      (e.clarityGrade === null || e.clarityGrade === spec.clarityGrade)
  );
  if (match) return { ok: true, pricePerCarat: match.pricePerCarat };

  // Fall back to the category-level wholesale reference range (fancy
  // colors, brown/champagne — the granular shape/carat table doesn't cover
  // these). This never invents a rate: if the range isn't priced in ILS,
  // there's no approved FX conversion wired up, so it's reported as
  // missing rather than converted with a guessed rate.
  const category = resolveDiamondCostCategory({
    diamondType: spec.diamondType,
    colorGrade: spec.colorGrade,
    clarityGrade: spec.clarityGrade,
    fancyColor: spec.fancyColor,
  });
  const range = category ? baseCostRanges.find((r) => r.category === category) : undefined;

  if (!range) {
    return {
      ok: false,
      reason: "MISSING_DIAMOND_PRICE",
      detail: `No price entry or reference range covers a ${spec.caratWeight}ct ${spec.shape} ${spec.diamondType} diamond${
        spec.colorGrade ? ` (color ${spec.colorGrade})` : ""
      }${spec.clarityGrade ? ` (clarity ${spec.clarityGrade})` : ""}${
        spec.fancyColor ? ` (fancy ${spec.fancyColor})` : ""
      }.`,
    };
  }
  if (range.currency !== "ILS") {
    return {
      ok: false,
      reason: "MISSING_FX_RATE",
      detail: `The ${category} reference range is in ${range.currency}, and no approved exchange rate is configured to convert it to ILS.`,
    };
  }
  return { ok: true, pricePerCarat: (range.minCostPerCarat + range.maxCostPerCarat) / 2 };
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
    const lookup = findDiamondPrice(spec, input.diamondPriceEntries, input.diamondBaseCostRanges ?? []);
    if (!lookup.ok) {
      return { ok: false, reason: lookup.reason, detail: lookup.detail };
    }
    diamondCost += lookup.pricePerCarat * spec.caratWeight * spec.quantity;
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

export type DiamondOnlyEstimate = { ok: true; retailPrice: number } | { ok: false; detail: string };

// A diamond-only price estimate — for the public calculator, which has no
// metal/manufacturing inputs to combine with. Uses the exact same
// findDiamondPrice lookup and GROSS_MARGIN formula as computeConfiguredPrice,
// so an estimate here can never imply a different price than a real product
// page would compute for the same diamond. Never returns a cost breakdown —
// only the final retail figure, same customer-facing rule as everywhere else.
export function estimateDiamondRetailPrice(
  spec: DiamondSelection,
  diamondPriceEntries: DiamondPriceEntryLike[],
  diamondBaseCostRanges: DiamondBaseCostRangeLike[]
): DiamondOnlyEstimate {
  const lookup = findDiamondPrice(spec, diamondPriceEntries, diamondBaseCostRanges);
  if (!lookup.ok) return { ok: false, detail: lookup.detail };
  const cost = lookup.pricePerCarat * spec.caratWeight * spec.quantity;
  const retailPrice = cost / (1 - GROSS_MARGIN);
  return { ok: true, retailPrice: round2(retailPrice) };
}
