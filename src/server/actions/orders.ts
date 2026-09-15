"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { calculateShipping } from "@/server/services/shipping";
import { calculateCommission } from "@/server/services/commission";
import { paymentProviders, type PaymentMethodId } from "@/server/payments/types";

export type CheckoutLine = {
  productId: string; // product slug, resolved to a real id below
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
};

export type CheckoutInput = {
  email: string;
  billingAddress: {
    fullName: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    apartment?: string;
    zip?: string;
  };
  paymentMethod: PaymentMethodId;
  couponCode?: string;
  orderNotes?: string;
  lines: CheckoutLine[];
};

export type CheckoutResult =
  | { error: string }
  | { orderNumber: string; total: number; instructions: string };

function generateOrderNumber() {
  return `LD-${Date.now().toString(36).toUpperCase()}`;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (input.lines.length === 0) {
    return { error: "העגלה ריקה." };
  }

  // Resolve slugs -> real product ids (client cart lines key products by slug).
  const products = await prisma.product.findMany({
    where: { slug: { in: input.lines.map((l) => l.productId) } },
  });
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  for (const line of input.lines) {
    if (!productBySlug.has(line.productId)) {
      return { error: `מוצר לא נמצא: ${line.productId}` };
    }
  }

  const subtotal = input.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  let discount = 0;
  let coupon = null;
  if (input.couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      return { error: "קוד קופון לא תקין." };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { error: "תוקף הקופון פג." };
    }
    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      return { error: "הקופון מוצה." };
    }
    discount =
      coupon.discountType === "PERCENTAGE"
        ? subtotal * (Number(coupon.discountValue) / 100)
        : Number(coupon.discountValue);
    discount = Math.min(discount, subtotal);
  }

  const shipping = await calculateShipping(subtotal - discount, input.billingAddress.country);
  const total = subtotal - discount + shipping;

  const provider = paymentProviders[input.paymentMethod];
  const orderNumber = generateOrderNumber();
  const paymentInit = await provider.init(total, orderNumber);

  const session = await getSession();
  const store = await cookies();
  const refCode = store.get("ld_ref")?.value;
  const affiliate = refCode
    ? await prisma.affiliate.findUnique({ where: { code: refCode } })
    : null;
  let validAffiliate = affiliate && affiliate.status === "APPROVED" ? affiliate : null;

  // A personal coupon also attributes the sale to its affiliate, even
  // without a ?ref= link — matches spec: "המערכת משייכת את ההזמנה ל-Affiliate".
  if (!validAffiliate && coupon?.affiliateId) {
    const couponAffiliate = await prisma.affiliate.findUnique({ where: { id: coupon.affiliateId } });
    if (couponAffiliate?.status === "APPROVED") {
      validAffiliate = couponAffiliate;
    }
  }

  // Fraud prevention: don't attribute (and don't pay commission on) an
  // affiliate referring their own purchase, when the admin setting is on.
  if (validAffiliate && session?.userId === validAffiliate.userId) {
    const preventSelfReferral = await prisma.setting.findUnique({
      where: { key: "affiliate_prevent_self_referral" },
    });
    if (preventSelfReferral?.value !== false) {
      validAffiliate = null;
    }
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.userId,
      email: input.email,
      status: "PENDING",
      paymentStatus: paymentInit.immediatelyPaid ? "PAID" : "PENDING",
      paymentMethod: input.paymentMethod,
      paymentInstructions: paymentInit.instructions,
      subtotal,
      discountTotal: discount,
      shippingTotal: shipping,
      total,
      couponId: coupon?.id,
      affiliateId: validAffiliate?.id,
      billingAddress: input.billingAddress,
      shippingAddress: input.billingAddress,
      items: {
        create: input.lines.map((line) => {
          const product = productBySlug.get(line.productId)!;
          return {
            productId: product.id,
            variantId: line.variantId,
            nameSnapshot: line.name,
            unitPrice: line.price,
            quantity: line.quantity,
            lineTotal: line.price * line.quantity,
          };
        }),
      },
    },
  });

  if (coupon) {
    await prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
  }

  if (validAffiliate) {
    const commissionAmount = await calculateCommission(validAffiliate, subtotal - discount);
    await prisma.commission.create({
      data: {
        affiliateId: validAffiliate.id,
        orderId: order.id,
        amount: commissionAmount,
        status: "PENDING",
      },
    });
  }

  return { orderNumber, total, instructions: paymentInit.instructions };
}
