import { getAllProductExtras, isSaleActive } from "@/server/product-extras";
import { prisma } from "@/lib/prisma";
import { computeConfiguredPrice, round2 } from "@/lib/pricing/engine";
import { VAT_RATE } from "@/lib/pricing/constants";
import { getMetalPrice, refreshGoldPriceIfStale } from "@/server/services/market-prices";
import { MetalType } from "@/generated/prisma/enums";
import { getAllManualPrices, getAllManualSalePrices } from "@/server/pricing/manual-option-prices";

// The price a product's page opens on (default metal, designed diamond if it
// has one, otherwise no diamond), VAT included — computed live from the same
// metal/diamond price data the product page uses, so a card in the shop or on
// the homepage always shows the same number as the page it links to. The
// `basePrice` column on a configurable product is only a stale placeholder.
const TTL_MS = 60_000;
// Held on globalThis so the start-up warm-up (a separate bundle) and the page
// routes share one copy.
type Computed = { prices: Map<string, number>; sales: Map<string, number> };
const shared = globalThis as unknown as {
  __listingPrices2?: { cached: { at: number; value: Computed } | null; inflight: Promise<Computed> | null };
};
const state = (shared.__listingPrices2 ??= { cached: null, inflight: null });

async function compute(): Promise<Computed> {
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

  const [manualPrices, manualSales] = await Promise.all([getAllManualPrices(), getAllManualSalePrices()]);
  const out = new Map<string, number>();
  const sales = new Map<string, number>();
  for (const p of products) {
    const material = p.materialOptions.find((m) => m.isDefault) ?? p.materialOptions[0];
    if (!material) continue;
    const manual = manualPrices.get(material.id);
    if (manual !== undefined && manual > 0) {
      out.set(p.id, round2(manual));
      const sale = manualSales.get(material.id);
      if (sale !== undefined && sale > 0 && sale < manual) sales.set(p.id, round2(sale));
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
  return { prices: out, sales };
}

// Stale-while-revalidate: once prices have been computed, every request gets
// them instantly; when they are older than the TTL they are refreshed in the
// background. Only the very first request after a restart ever waits for the
// full computation (all products + metal/diamond tables + a gold price check).
async function getComputed(): Promise<Computed> {
  const stale = !state.cached || Date.now() - state.cached.at >= TTL_MS;
  if (stale) {
    state.inflight ??= compute()
      .then((value) => {
        state.cached = { at: Date.now(), value };
        return value;
      })
      .finally(() => {
        state.inflight = null;
      });
  }
  if (state.cached) {
    if (stale) state.inflight?.catch(() => undefined); // background refresh; keep serving the old prices
    return state.cached.value;
  }
  try {
    return await state.inflight!;
  } catch {
    return { prices: new Map(), sales: new Map() };
  }
}

export type ListingPrice = { price: number; list?: number };

// Price a shopper pays for each configurable product's default selection, plus the
// regular (list) price when a hand-entered sale is running (respecting the product's
// scheduled sale window, if any).
export async function getListingPriceInfo(): Promise<Map<string, ListingPrice>> {
  const [{ prices, sales }, extras] = await Promise.all([getComputed(), getAllProductExtras()]);
  const out = new Map<string, ListingPrice>();
  for (const [id, regular] of prices) {
    const sale = sales.get(id);
    out.set(id, sale !== undefined && isSaleActive(extras.get(id)) ? { price: sale, list: regular } : { price: regular });
  }
  return out;
}

// Effective price only (sale applied when active).
export async function getListingPrices(): Promise<Map<string, number>> {
  const info = await getListingPriceInfo();
  return new Map([...info].map(([id, v]) => [id, v.price]));
}

type Priced = { id: string; basePrice: unknown; salePrice: unknown };

// Swap a configurable product's placeholder price for its live price (and its
// hand-entered sale, if running).
export async function applyLivePrices<T extends Priced>(products: T[]): Promise<T[]> {
  const [info, extras] = await Promise.all([getListingPriceInfo(), getAllProductExtras()]);
  return products.map((p) => {
    const live = info.get(p.id);
    const ex = extras.get(p.id);
    const base = live == null ? p : { ...p, basePrice: live.list ?? live.price, salePrice: live.list != null ? live.price : null };
    const scheduled = base.salePrice != null && !isSaleActive(ex) ? { ...base, salePrice: null } : base;
    // A product that needs a choice before it can be bought (material picker,
    // sizes) must send the shopper to its page, never add straight to the cart.
    const needsOptions = live != null || (ex?.sizes?.length ?? 0) > 0;
    return { ...scheduled, ...(ex?.badge ? { extrasBadge: ex.badge } : {}), ...(needsOptions ? { needsOptions: true } : {}) };
  });
}
