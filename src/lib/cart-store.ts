"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalculatorDiamondChoice } from "@/lib/pricing/engine";

export type CartLine = {
  key: string; // `${productId}:${variantId ?? "default"}`
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  // Only set for a CONFIGURABLE product (material/diamond picker) — the
  // exact selection `price` above was computed from. Checkout recomputes
  // the price from these ids server-side (see resolveConfiguredPrice) and
  // never trusts `price` directly, same as it already does for variants.
  materialOptionId?: string;
  diamondOptionIds?: string[];
  // Only set for a product priced via the calculator-pricelist diamond
  // fallback (see resolveConfiguredPrice / CalculatorDiamondSelector) —
  // checkout recomputes the price from this spec server-side too, same as
  // it does for materialOptionId/diamondOptionIds.
  calculatorDiamondSpec?: CalculatorDiamondChoice;
  // Personalisation chosen on the product page. `price` already includes the
  // fees; checkout re-validates and re-prices them server-side.
  options?: { size?: string; engraving?: string; giftWrap?: boolean };
};

type CartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.key === line.key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === line.key ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        }),
      removeLine: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
      totalItems: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      totalPrice: () => get().lines.reduce((sum, l) => sum + l.quantity * l.price, 0),
    }),
    { name: "lady-diamond-cart" }
  )
);
