"use client";

import type { CalculatorDiamondOption } from "@/lib/pricing/engine";
import { getDiamondPricelistOptions } from "@/server/actions/diamond-options";
import { decodeDiamondOptions } from "@/lib/pricing/diamond-options-codec";

// One shared request per page view, however many pickers mount or prefetch.
let optionsPromise: Promise<CalculatorDiamondOption[]> | null = null;

export function loadDiamondOptions(): Promise<CalculatorDiamondOption[]> {
  optionsPromise ??= getDiamondPricelistOptions()
    .then(decodeDiamondOptions)
    .catch((e) => {
      optionsPromise = null;
      throw e;
    });
  return optionsPromise;
}

// Starts the download in the background shortly after the page is idle, so
// that by the time a customer opens the diamond picker it is usually already
// there — without adding it to the page's HTML.
export function prefetchDiamondOptions() {
  const start = () => {
    loadDiamondOptions().catch(() => {});
  };
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(start, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(start, 1500);
  return () => window.clearTimeout(id);
}
