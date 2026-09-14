"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  key: string; // `${productId}:${variantId ?? "default"}`
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  variantLabel?: string;
  price: number;
  quantity: number;
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
