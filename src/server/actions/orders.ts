"use server";

import { round2 } from "@/lib/pricing/engine";
import { describeOptions } from "@/lib/line-options";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { VAT_RATE } from "@/lib/pricing/constants";
import { getAllProductExtras, isSaleActive } from "@/server/product-extras";
import { getSession } from "@/lib/auth/session";
import { calculateShipping } from "@/server/services/shipping";
import { calculateCommission } from "@/server/services/commission";
import { getAttributionWindowDays } from "@/server/actions/affiliate";
import { paymentProviders, type PaymentMethodId } from "@/server/payments/types";
import { upsertAddress } from "@/lib/address-service";
import { emailProvider } from "@/server/email/types";
import { isValidEmail } from "@/lib/validation";
import { resolveConfiguredPrice } from "@/server/pricing/resolve-configured-price";
import type { CalculatorDiamondChoice } from "@/lib/pricing/engine";

export type CheckoutLine = {
  productId: string; // product slug, resolved to a real id below
  variantId?: string;
  name: string;
  variantLabel?: string;
  options?: { size?: string; engraving?: string; giftWrap?: boolean };
  price: number;
  quantity: number;
  // Only present for a CONFIGURABLE product — see resolveConfiguredPrice.
  materialOptionId?: string;
  diamondOptionIds?: string[];
  // Only present for a product priced via the calculator-pricelist diamond
  // fallback (no real ProductDiamondOption rows of its own) — see
  // resolveConfiguredPrice.
  calculatorDiamondSpec?: CalculatorDiamondChoice;
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
  paymentMeta?: Record<string, string>;
  couponCode?: string;
  orderNotes?: string;
  lines: CheckoutLine[];
};

export type CheckoutResult =
  | { error: string }
  | { orderNumber: string; total: number; instructions: string };

function generateOrderNumber() {
  // The order number doubles as a bearer token for the guest order-confirmation
  // page (no login is required to view it), so it must not be guessable — a
  // pure timestamp encoding let anyone enumerate nearby orders. The random
  // suffix adds ~40 bits of entropy on top of the human-readable date prefix.
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = randomBytes(5).toString("hex").toUpperCase();
  return `LD-${datePart}-${randomPart}`;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (input.lines.length === 0) {
    return { error: "העגלה ריקה." };
  }

  // The client marks these fields `required` in HTML, but that's trivially
  // bypassable (devtools, or a direct call to this action) — without a
  // server-side check an order could be created with no way to actually
  // contact or ship to the customer.
  const { billingAddress } = input;
  if (
    !input.email?.trim() ||
    !isValidEmail(input.email.trim()) ||
    !billingAddress?.fullName?.trim() ||
    !billingAddress?.phone?.trim() ||
    !billingAddress?.country?.trim() ||
    !billingAddress?.city?.trim() ||
    !billingAddress?.street?.trim()
  ) {
    return { error: "נא למלא את כל פרטי החיוב הנדרשים (שם, אימייל, טלפון, מדינה, עיר וכתובת)." };
  }

  // Resolve slugs -> real product ids (client cart lines key products by slug).
  const products = await prisma.product.findMany({
    where: { slug: { in: input.lines.map((l) => l.productId) } },
    include: { variants: true },
  });
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  // Resolve each line's real price and name SERVER-SIDE from the current
  // product/variant record — never trust `line.price` from the client. It's
  // only used for display in the cart before checkout; a tampered value
  // there (devtools/localStorage edit) must never affect what's charged.
  type ResolvedLine = {
    productDbId: string;
    variantId?: string;
    name: string;
    variantLabel?: string;
    price: number;
    quantity: number;
    backorder?: boolean;
  };
  const resolvedLines: ResolvedLine[] = [];

  const extrasByProduct = await getAllProductExtras(true);

  for (const line of input.lines) {
    const product = productBySlug.get(line.productId);
    if (!product) {
      return { error: `מוצר לא נמצא: ${line.productId}` };
    }

    // Order rules set per product in the admin (minimum / maximum quantity,
    // pre-order allowed when out of stock). Enforced here, never only in the UI.
    const extras = extrasByProduct.get(product.id) ?? {};
    const backorder = extras.allowBackorder === true;
    if (extras.minQty && line.quantity < extras.minQty) {
      return { error: `כמות מינימום להזמנה של "${line.name}": ${extras.minQty}.` };
    }
    if (extras.maxQty && line.quantity > extras.maxQty) {
      return { error: `כמות מקסימום להזמנה של "${line.name}": ${extras.maxQty}.` };
    }

    // Personalisation (size / engraving / gift wrap): validated against what
    // the admin enabled for this product, and the fees added here, so the
    // client can neither skip a required size nor under-pay the add-ons.
    const opt = line.options ?? {};
    const sizes = extras.sizes ?? [];
    if (sizes.length > 0 && (!opt.size || !sizes.includes(opt.size))) {
      return { error: `נא לבחור מידה תקפה עבור "${line.name}".` };
    }
    const engravingText = extras.engraving ? (opt.engraving ?? "").trim() : "";
    if (engravingText.length > (extras.engravingMaxLen ?? 30)) {
      return { error: `טקסט החריטה של "${line.name}" ארוך מדי.` };
    }
    const wrap = !!(extras.giftWrap && opt.giftWrap);
    const optionFee = (engravingText ? extras.engravingFee ?? 0 : 0) + (wrap ? extras.giftWrapFee ?? 0 : 0);
    const optionLabel = describeOptions({
      size: sizes.length ? opt.size : undefined,
      engraving: engravingText || undefined,
      giftWrap: wrap || undefined,
    });
    const joinLabel = (l?: string) => [l, optionLabel].filter(Boolean).join(" · ") || undefined;

    // A CONFIGURABLE product (material/diamond picker) has its price
    // computed by the pricing engine from the selected options, never from
    // product.basePrice/salePrice — those are stale placeholders for such a
    // product. Recompute here server-side from the material/diamond ids the
    // cart carried, exactly as the product page's live price did, so what
    // the customer is charged can never be tampered with (or accidentally
    // desynced) via a client-supplied price.
    if (product.pricingMode === "CONFIGURABLE") {
      if (!backorder && line.quantity > product.inventory) {
        return { error: `אין מספיק מלאי עבור "${line.name}" (במלאי: ${product.inventory}).` };
      }
      if (!line.materialOptionId) {
        return { error: `נא לבחור אפשרות חומר עבור "${line.name}" לפני ההזמנה.` };
      }
      const resolved = await resolveConfiguredPrice({
        productId: product.id,
        materialOptionId: line.materialOptionId,
        diamondOptionIds: line.diamondOptionIds ?? [],
        calculatorDiamondSpec: line.calculatorDiamondSpec ?? null,
        fresh: true,
      });
      if (!resolved.ok) {
        return { error: `לא ניתן לחשב מחיר עבור "${line.name}": ${resolved.message}` };
      }
      resolvedLines.push({
        productDbId: product.id,
        backorder,
        variantId: undefined,
        name: line.name,
        variantLabel: joinLabel(line.variantLabel),
        price: round2(resolved.sellingPrice + optionFee),
        quantity: line.quantity,
      });
      continue;
    }

    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : null;
    if (line.variantId && !variant) {
      return { error: `הווריאציה שנבחרה עבור "${line.name}" אינה קיימת עוד.` };
    }
    const availableInventory = variant ? variant.inventory : product.inventory;
    if (!backorder && line.quantity > availableInventory) {
      return { error: `אין מספיק מלאי עבור "${line.name}" (במלאי: ${availableInventory}).` };
    }

    const price = variant
      ? Number(variant.salePrice ?? variant.price)
      : Number((isSaleActive(extrasByProduct.get(product.id)) ? product.salePrice : null) ?? product.basePrice);

    resolvedLines.push({
      productDbId: product.id,
      backorder,
      variantId: variant?.id,
      name: line.name,
      variantLabel: joinLabel(line.variantLabel),
      price: round2(price + optionFee),
      quantity: line.quantity,
    });
  }

  const subtotal = resolvedLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

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
  const paymentInit = await provider.init(total, orderNumber, input.paymentMeta);

  const session = await getSession();
  const store = await cookies();
  const refCode = store.get("ld_ref")?.value;
  const visitorId = store.get("ld_visitor")?.value;
  const affiliate = refCode
    ? await prisma.affiliate.findUnique({ where: { code: refCode } })
    : null;
  let validAffiliate = affiliate && affiliate.status === "APPROVED" ? affiliate : null;

  // The ref cookie's own maxAge was fixed to whatever attribution window was
  // configured at click time — if the admin later SHORTENS the window, an
  // existing long-lived cookie would otherwise keep attributing sales past
  // the new policy. Re-check the actual click's age against the CURRENT
  // setting rather than trusting "cookie still present" as sufficient.
  if (validAffiliate && visitorId) {
    const recentClick = await prisma.affiliateClick.findFirst({
      where: { affiliateId: validAffiliate.id, sessionId: visitorId },
      orderBy: { createdAt: "desc" },
    });
    if (recentClick) {
      const windowDays = await getAttributionWindowDays();
      const ageMs = Date.now() - recentClick.createdAt.getTime();
      if (ageMs > windowDays * 24 * 60 * 60 * 1000) {
        validAffiliate = null;
      }
    }
  }

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
  // Checked by user id AND by email so an affiliate can't trivially bypass
  // this by checking out as a guest (no session) with their own email while
  // still using their own ?ref= link or personal coupon.
  if (validAffiliate) {
    const affiliateUser = await prisma.user.findUnique({
      where: { id: validAffiliate.userId },
      select: { email: true },
    });
    const isSelfReferral =
      session?.userId === validAffiliate.userId ||
      affiliateUser?.email.toLowerCase() === input.email.trim().toLowerCase();

    if (isSelfReferral) {
      const preventSelfReferral = await prisma.setting.findUnique({
        where: { key: "affiliate_prevent_self_referral" },
      });
      if (preventSelfReferral?.value !== false) {
        validAffiliate = null;
      }
    }
  }

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Decrement inventory with a `gte` guard so concurrent checkouts for the
      // same low-stock item can't both succeed — if another order already
      // consumed the remaining stock, the guarded update matches zero rows
      // and we abort the whole transaction instead of overselling.
      for (const line of resolvedLines) {
        if (line.variantId) {
          const result = await tx.productVariant.updateMany({
            where: { id: line.variantId, inventory: { gte: line.quantity } },
            data: { inventory: { decrement: line.quantity } },
          });
          if (result.count === 0) {
            throw new Error(`אין מספיק מלאי עבור "${line.name}".`);
          }
        } else {
          const result = await tx.product.updateMany({
            where: { id: line.productDbId, inventory: { gte: line.quantity } },
            data: { inventory: { decrement: line.quantity } },
          });
          if (result.count === 0) {
            // A pre-order product (admin: "allow order without stock") may
            // sell past zero: take whatever stock is left, never go negative.
            if (line.backorder) {
              await tx.product.updateMany({ where: { id: line.productDbId }, data: { inventory: 0 } });
            } else {
              throw new Error(`אין מספיק מלאי עבור "${line.name}".`);
            }
          }
        }
      }

      if (coupon) {
        const couponResult = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            OR: [{ usageLimit: null }, { usageCount: { lt: coupon.usageLimit ?? 0 } }],
          },
          data: { usageCount: { increment: 1 } },
        });
        if (couponResult.count === 0) {
          throw new Error("הקופון מוצה.");
        }
      }

      return tx.order.create({
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
          // Prices (and shipping) are VAT-inclusive: record the VAT contained in the total.
          taxTotal: Math.round((total - total / (1 + VAT_RATE)) * 100) / 100,
          total,
          couponId: coupon?.id,
          affiliateId: validAffiliate?.id,
          billingAddress: input.billingAddress,
          shippingAddress: input.billingAddress,
          items: {
            create: resolvedLines.map((line) => ({
              productId: line.productDbId,
              variantId: line.variantId,
              nameSnapshot: line.variantLabel ? `${line.name} — ${line.variantLabel}` : line.name,
              unitPrice: line.price,
              quantity: line.quantity,
              lineTotal: line.price * line.quantity,
            })),
          },
        },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "אירעה שגיאה ביצירת ההזמנה." };
  }

  if (session?.userId) {
    await upsertAddress(session.userId, input.billingAddress);
  }

  if (validAffiliate) {
    // Commission is earned on the sale net of VAT (prices include 18% VAT).
    const netOfVat = (subtotal - discount) / (1 + VAT_RATE);
    const commissionAmount = Math.min(await calculateCommission(validAffiliate, netOfVat), netOfVat);
    await prisma.commission.create({
      data: {
        affiliateId: validAffiliate.id,
        orderId: order.id,
        amount: commissionAmount,
        status: "PENDING",
      },
    });
  }

  await emailProvider.send({
    to: input.email,
    subject: `אישור הזמנה ${orderNumber} — LADY DIAMOND`,
    text: `תודה על ההזמנה! מספר הזמנה: ${orderNumber}. סה"כ: ${total.toFixed(2)} ₪.\n\n${paymentInit.instructions}`,
  });

  return { orderNumber, total, instructions: paymentInit.instructions };
}
