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
    if (!coupon || !coupon.isActive) {
      couponError = "קוד קופון לא תקין.";
    } else if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      couponError = "תוקף הקופון פג.";
    } else if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      couponError = "הקופון מוצה.";
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
