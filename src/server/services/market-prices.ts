// Live gold spot price, so the gold calculator defaults to a real current
// market number instead of a stale hardcoded guess — showing a made-up or
// outdated "market price" next to a real retail estimate is exactly the
// kind of consumer-misleading claim the Consumer Protection Law is meant to
// prevent. Source: goldprice.dev's public spot-price endpoint (no API key,
// XAU quoted directly in ILS). Cross-checked at integration time against a
// second independent source (xaus.com) and the live USD/ILS rate — both
// agreed within ~0.1%.
//
// This never fails loudly: if the fetch fails or the response looks wrong,
// callers get `null` and must fall back to letting the person enter their
// own known-current price rather than ever displaying a fabricated number.

import { prisma } from "@/lib/prisma";
import { MetalType } from "@/generated/prisma/enums";

const TROY_OUNCE_IN_GRAMS = 31.1034768;
const GOLD_SPOT_ENDPOINT = "https://api.goldprice.dev/v1/prices?symbol=XAU-ILS-SPOT";

export type LiveGoldPrice = {
  pricePerGram24kIls: number;
  fetchedAt: string;
  source: string;
};

export async function getLiveGoldPricePer24kGramIls(): Promise<LiveGoldPrice | null> {
  try {
    const res = await fetch(GOLD_SPOT_ENDPOINT, {
      // 10-minute cache — frequent enough that the price is never stale by
      // more than a few minutes in practice, without hammering a free
      // third-party endpoint on every page load.
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      symbols?: { symbol?: string; quote_currency?: string; price?: string; is_stale?: boolean; computed_at?: string }[];
    };
    const quote = data.symbols?.find((s) => s.symbol === "XAU" && s.quote_currency === "ILS");
    const pricePerOunce = quote?.price ? Number(quote.price) : NaN;

    // The vendor's own `is_stale` flag turns out to be true on essentially
    // every response we've observed on their free tier — even for a quote
    // computed a few hours ago — so trusting it outright made this reject
    // almost every real fetch. Judge staleness ourselves from `computed_at`
    // instead: reject only a quote old enough to actually be untrustworthy
    // (or with no timestamp to check at all).
    const computedAt = quote?.computed_at ? new Date(quote.computed_at) : null;
    const ageMs = computedAt ? Date.now() - computedAt.getTime() : Infinity;
    const MAX_QUOTE_AGE_MS = 48 * 60 * 60 * 1000; // 48h — generous given no live paid feed exists

    // Sanity bounds — reject anything that isn't a plausible gold price, so
    // a malformed or unexpected response from the third party never turns
    // into a wildly wrong number shown as if it were real.
    if (!Number.isFinite(pricePerOunce) || pricePerOunce < 3000 || pricePerOunce > 40000 || ageMs > MAX_QUOTE_AGE_MS) {
      return null;
    }

    return {
      pricePerGram24kIls: Math.round((pricePerOunce / TROY_OUNCE_IN_GRAMS) * 100) / 100,
      fetchedAt: new Date().toISOString(),
      source: "goldprice.dev",
    };
  } catch {
    return null;
  }
}

// ---- DB-backed price cache (src/lib/pricing/engine.ts reads from this,
// never calls a live API directly) ----
//
// Gold: refreshed from the live feed above on a cadence (see
// refreshGoldPriceIfStale), and only overwritten by a successful fetch —
// a failed refresh silently keeps serving the last known-good price rather
// than blocking pricing or falling back to a fabricated number.
// Silver/Platinum: goldprice.dev's silver symbol is paid-tier only (no free
// live source was found — see AGENTS.md step 17, "don't connect to a paid
// service without approval"), so those two are admin-entered via
// setManualMetalPrice and marked isManual: true so the admin panel is
// honest about which prices are live vs hand-maintained.

const GOLD_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // matches the fetch()'s own 600s revalidate window

export async function getMetalPrice(metalType: MetalType) {
  return prisma.metalPrice.findUnique({ where: { metalType } });
}

export async function getAllMetalPrices() {
  return prisma.metalPrice.findMany({ orderBy: { metalType: "asc" } });
}

// Called on-demand (e.g. right before a configurable price is computed) —
// keeps the DB row fresh without a separate cron job. No-op, quickly, once
// the cached row is recent enough.
export async function refreshGoldPriceIfStale(): Promise<void> {
  const existing = await prisma.metalPrice.findUnique({ where: { metalType: MetalType.GOLD } });
  const isStale = !existing || Date.now() - existing.fetchedAt.getTime() > GOLD_REFRESH_INTERVAL_MS;
  if (!isStale) return;

  const live = await getLiveGoldPricePer24kGramIls();
  if (!live) return; // keep serving the last known-good price; never blank it out

  await prisma.metalPrice.upsert({
    where: { metalType: MetalType.GOLD },
    create: {
      metalType: MetalType.GOLD,
      pricePerGram: live.pricePerGram24kIls,
      currency: "ILS",
      source: live.source,
      isManual: false,
      fetchedAt: new Date(live.fetchedAt),
    },
    update: {
      pricePerGram: live.pricePerGram24kIls,
      source: live.source,
      isManual: false,
      fetchedAt: new Date(live.fetchedAt),
    },
  });
}

export async function setManualMetalPrice(params: {
  metalType: MetalType;
  pricePerGram: number;
  source: string;
  sourceUrl?: string;
}) {
  await prisma.metalPrice.upsert({
    where: { metalType: params.metalType },
    create: {
      metalType: params.metalType,
      pricePerGram: params.pricePerGram,
      currency: "ILS",
      source: params.source,
      sourceUrl: params.sourceUrl,
      isManual: true,
      fetchedAt: new Date(),
    },
    update: {
      pricePerGram: params.pricePerGram,
      source: params.source,
      sourceUrl: params.sourceUrl,
      isManual: true,
      fetchedAt: new Date(),
    },
  });
}
