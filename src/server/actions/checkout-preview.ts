"use server";

import { prisma } from "@/lib/prisma";
import { calculateShipping } from "@/server/services/shipping";
import { getClientIp, isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";

export type CheckoutPreview = {
  discount: number;
  shipping: number;
  total: number;
  couponError?: "invalid";
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
  let couponError: "invalid" | undefined;

  // Fires live as the customer types (debounced ~300ms), so the limit needs
  // to be generous enough for normal typing/editing but still raise the bar
  // against scripting this endpoint to brute-force valid coupon codes
  // (the generic "invalid" message above prevents distinguishing *why* a
  // code failed, but not that it succeeded — this limits how many guesses
  // are cheap).
  if (couponCode) {
    const rateLimitKey = `coupon-preview:${await getClientIp()}`;
    if (isRateLimited(rateLimitKey, 40, 5 * 60 * 1000)) {
      return { discount: 0, shipping: await calculateShipping(subtotal, country || "Israel"), total: subtotal, couponError: "invalid" };
    }
    recordAttempt(rateLimitKey);
  }

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
      couponError = "invalid";
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
