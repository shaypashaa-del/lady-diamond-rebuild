import { getAllProductExtras, isSaleActive } from "@/server/product-extras";
import { prisma } from "@/lib/prisma";
import { computeConfiguredPrice, round2 } from "@/lib/pricing/engine";
import { VAT_RATE } from "@/lib/pricing/constants";
import { getMetalPrice, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { MetalType } from "@/generated/prisma/enums";
import { getAllManualPrices } from "@/server/pricing/manual-option-prices";

// The price a product's page opens on (default metal, designed diamond if it
// has one, otherwise no diamond), VAT included — computed live from the same
// metal/diamond price data the product page uses, so a card in the shop or on
// the homepage always shows the same number as the page it links to. The
// `basePrice` column on a configurable product is only a stale placeholder.
const TTL_MS = 60_000;
let cached: { at: number; value: Map<string, number> } | null = null;
let inflight: Promise<Map<string, number>> | null = null;

async function compute(): Promise<Map<string, number>> {
  await refreshGoldPriceIfStale();
  const [products, gold, silver, platinum, diamondPriceEntries, diamondBaseCostRanges] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", pricingMode: "CONFIGURABLE" },
      select: {
        id: true,
        metalWeightGrams: true,
        manufacturingCost: true,
        settingCost: true,
        otherCost: true,
        materialOptions: { where: { active: true }, orderBy: { sortOrder: "asc" } },
        diamondOptions: true,
      },
    }),
    getMetalPrice(MetalType.GOLD),
    getMetalPrice(MetalType.SILVER),
    getMetalPrice(MetalType.PLATINUM),
    prisma.diamondPriceEntry.findMany(),
    prisma.diamondBaseCostRange.findMany(),
  ]);
  const metalPrices = { GOLD: gold, SILVER: silver, PLATINUM: platinum } as const;
  const entries = diamondPriceEntries.map((e) => ({
    diamondType: e.diamondType,
    shape: e.shape,
    caratMin: Number(e.caratMin),
    caratMax: Number(e.caratMax),
    colorGrade: e.colorGrade,
    clarityGrade: e.clarityGrade,
    pricePerCarat: Number(e.pricePerCarat),
  }));
  const ranges = diamondBaseCostRanges.map((r) => ({
    category: r.category,
    minCostPerCarat: Number(r.minCostPerCarat),
    maxCostPerCarat: Number(r.maxCostPerCarat),
    currency: r.currency,
  }));

  const manualPrices = await getAllManualPrices();
  const out = new Map<string, number>();
  for (const p of products) {
    const material = p.materialOptions.find((m) => m.isDefault) ?? p.materialOptions[0];
    if (!material) continue;
    const manual = manualPrices.get(material.id);
    if (manual !== undefined && manual > 0) {
      out.set(p.id, round2(manual));
      continue;
    }
    const mp = metalPrices[material.metalType as keyof typeof metalPrices];
    const d = p.diamondOptions.find((x) => x.isDefault) ?? p.diamondOptions[0];
    const r = computeConfiguredPrice({
      metalWeightGrams: p.metalWeightGrams ? Number(p.metalWeightGrams) : null,
      manufacturingCost: p.manufacturingCost ? Number(p.manufacturingCost) : null,
      settingCost: p.settingCost ? Number(p.settingCost) : null,
      otherCost: p.otherCost ? Number(p.otherCost) : null,
      metalPricePerGram: mp ? Number(mp.pricePerGram) : null,
      metal: { metalType: material.metalType, purity: material.purity },
      diamonds: d
        ? [
            {
              diamondType: d.diamondType,
              shape: d.shape,
              caratWeight: Number(d.caratWeight),
              colorGrade: d.colorGrade,
              clarityGrade: d.clarityGrade,
              fancyColor: d.fancyColor,
              quantity: d.quantity,
            },
          ]
        : [],
      diamondPriceEntries: entries,
      diamondBaseCostRanges: ranges,
    });
    if (r.ok) out.set(p.id, round2(r.sellingPrice * (1 + VAT_RATE)));
  }
  return out;
}

export async function getListingPrices(): Promise<Map<string, number>> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  inflight ??= compute()
    .then((value) => {
      cached = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      inflight = null;
    });
  try {
    return await inflight;
  } catch {
    return cached?.value ?? new Map();
  }
}

type Priced = { id: string; basePrice: unknown; salePrice: unknown };

// Swap a configurable product's placeholder price for its live price and drop
// the placeholder sale price.
export async function applyLivePrices<T extends Priced>(products: T[]): Promise<T[]> {
  const [prices, extras] = await Promise.all([getListingPrices(), getAllProductExtras()]);
  return products.map((p) => {
    const live = prices.get(p.id);
    const ex = extras.get(p.id);
    const base = live == null ? p : { ...p, basePrice: live, salePrice: null };
    const scheduled = base.salePrice != null && !isSaleActive(ex) ? { ...base, salePrice: null } : base;
    // A product that needs a choice before it can be bought (material picker,
    // sizes) must send the shopper to its page, never add straight to the cart.
    const needsOptions = live != null || (ex?.sizes?.length ?? 0) > 0;
    return { ...scheduled, ...(ex?.badge ? { extrasBadge: ex.badge } : {}), ...(needsOptions ? { needsOptions: true } : {}) };
  });
}
