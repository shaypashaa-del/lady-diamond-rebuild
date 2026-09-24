// Pure-metal fraction for each purity/fineness stamp. These are the
// standard, widely-published assay values for jewelry alloys — not
// estimates. Cross-check against an authoritative standards source before
// changing any of these; they directly change every configurable price on
// the site.
//   24K ≈ 99.9%, 22K ≈ 91.6%, 18K = 75%, 14K ≈ 58.5%, 9K = 37.5%
//   Sterling silver 925 = 92.5%, fine silver 999 = 99.9%
//   Platinum 950 = 95%
export const PURITY_FRACTION: Record<string, number> = {
  K24: 0.999,
  K22: 0.916,
  K18: 0.75,
  K14: 0.585,
  K9: 0.375,
  S925: 0.925,
  S999: 0.999,
  PT950: 0.95,
};

export const PURITY_LABEL: Record<string, string> = {
  K24: "24K",
  K22: "22K",
  K18: "18K",
  K14: "14K",
  K9: "9K",
  S925: "925",
  S999: "999",
  PT950: "950",
};

// Which purities are physically valid for which metal — used to keep the
// admin from offering a nonsensical combination (e.g. "22K Silver") by
// mistake, per AGENTS.md step 2: never show an option that isn't actually
// manufacturable.
export const VALID_PURITIES_FOR_METAL: Record<string, string[]> = {
  GOLD: ["K9", "K14", "K18", "K22", "K24"],
  SILVER: ["S925", "S999"],
  PLATINUM: ["PT950"],
};

// Target gross margin on the FINAL selling price (not a markup on cost).
// Final Selling Price = Base Cost / (1 - GROSS_MARGIN)
export const GROSS_MARGIN = 0.2;

// Curated diamond "quality tiers" — a small, friendly set of color/clarity
// combinations to offer per product instead of exposing all 7×8 = 56 raw
// grade combinations to a shopper who doesn't know what VVS2 means. This
// mirrors how real jewelry retailers present it (e.g. a competitor site
// surveyed for this project bundles their engagement rings as a single
// "נקי (VS)" / "קולקשן (D-F)" collection per design, rather than a free
// grade picker). These are a curation choice, not a market-data claim —
// the admin can still pick any raw color/clarity pair manually if a
// product needs something outside these three.
export const DIAMOND_QUALITY_TIERS = [
  {
    id: "classic",
    label: "קלאסי",
    description: "צבע G, ניקיון VS1 — האיזון הנפוץ ביותר בין מראה למחיר.",
    colorGrade: "G",
    clarityGrade: "VS1",
  },
  {
    id: "premium",
    label: "פרימיום",
    description: "צבע F, ניקיון VVS2 — נקי וזוהר במיוחד.",
    colorGrade: "F",
    clarityGrade: "VVS2",
  },
  {
    id: "luxury",
    label: "יוקרה",
    description: "צבע D, ניקיון VVS1 — הדירוג הגבוה ביותר שאנו מציעים.",
    colorGrade: "D",
    clarityGrade: "VVS1",
  },
] as const;

export type DiamondQualityTierId = (typeof DIAMOND_QUALITY_TIERS)[number]["id"];
