import { getAllProductExtras, isSaleActive } from "@/server/product-extras";
import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/pricing/engine";
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

// Manual-only pricing: a product's page price is the hand-entered price of its default
// material option. A product with no hand-entered price has no price (it is shown as
// "price on request" and cannot be bought until a price is entered).
async function compute(): Promise<Computed> {
  const [products, manualPrices, manualSales] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", pricingMode: "CONFIGURABLE" },
      select: {
        id: true,
        materialOptions: { where: { active: true }, orderBy: { sortOrder: "asc" }, select: { id: true, isDefault: true } },
      },
    }),
    getAllManualPrices(),
    getAllManualSalePrices(),
  ]);
  const out = new Map<string, number>();
  const sales = new Map<string, number>();
  for (const p of products) {
    const material = p.materialOptions.find((m) => m.isDefault) ?? p.materialOptions[0];
    if (!material) continue;
    const manual = manualPrices.get(material.id);
    if (manual === undefined || !(manual > 0)) continue;
    out.set(p.id, round2(manual));
    const sale = manualSales.get(material.id);
    if (sale !== undefined && sale > 0 && sale < manual) sales.set(p.id, round2(sale));
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

type Priced = { id: string; basePrice: unknown; salePrice: unknown; pricingMode?: string };

// Swap a configurable product's placeholder price for its live price (and its
// hand-entered sale, if running).
export async function applyLivePrices<T extends Priced>(products: T[]): Promise<T[]> {
  const [info, extras] = await Promise.all([getListingPriceInfo(), getAllProductExtras()]);
  return products.map((p) => {
    const live = info.get(p.id);
    const ex = extras.get(p.id);
    // A configurable product with no hand-entered price has no price at all.
    const noPrice = live == null && p.pricingMode === "CONFIGURABLE";
    const base = noPrice
      ? { ...p, basePrice: 0, salePrice: null }
      : live == null
        ? p
        : { ...p, basePrice: live.list ?? live.price, salePrice: live.list != null ? live.price : null };
    const scheduled = base.salePrice != null && !isSaleActive(ex) ? { ...base, salePrice: null } : base;
    // A product that needs a choice before it can be bought (material picker,
    // sizes) must send the shopper to its page, never add straight to the cart.
    const needsOptions = live != null || (ex?.sizes?.length ?? 0) > 0;
    return { ...scheduled, ...(ex?.badge ? { extrasBadge: ex.badge } : {}), ...(needsOptions || noPrice ? { needsOptions: true } : {}), ...(noPrice ? { priceOnRequest: true } : {}) };
  });
}
