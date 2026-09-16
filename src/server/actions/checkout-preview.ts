"use server";

import { prisma } from "@/lib/prisma";
import { calculateShipping } from "@/server/services/shipping";

export type CheckoutPreview = {
  discount: number;
  shipping: number;
  total: number;
  couponError?: string;
};

// Lets the checkout page show the real total (shipping + coupon discount)
// before the customer submits — createOrder recomputes the same values
// server-side at submit time, this is purely a live preview.
export async function getCheckoutPreview(
  subtotal: number,
  country: string,
  couponCode?: string
): Promise<CheckoutPreview> {
  let discount = 0;
  let couponError: string | undefined;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    // A single generic message, not "invalid" vs "expired" vs "used up" —
    // this is an unauthenticated, unrate-limited endpoint (called live as
    // the customer types), so distinct reasons would let someone enumerate
    // which coupon codes exist purely by probing this preview for free,
    // without ever placing an order. createOrder (the actual checkout path)
    // keeps the specific messages since completing a real order is much
    // higher friction per guess.
    const invalid =
      !coupon ||
      !coupon.isActive ||
      (coupon.expiresAt && coupon.expiresAt < new Date()) ||
      (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit);
    if (invalid) {
      couponError = "קוד קופון לא תקין.";
    } else {
      discount =
        coupon.discountType === "PERCENTAGE"
          ? subtotal * (Number(coupon.discountValue) / 100)
          : Number(coupon.discountValue);
      discount = Math.min(discount, subtotal);
    }
  }

  const shipping = await calculateShipping(subtotal - discount, country || "Israel");
  const total = subtotal - discount + shipping;

  return { discount, shipping, total, couponError };
}
