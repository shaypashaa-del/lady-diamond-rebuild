"use server";

import { prisma } from "@/lib/prisma";
import { emailProvider } from "@/server/email/types";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { SITE_URL } from "@/lib/site-config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeResult = { ok: true } | { ok: false; message: string };

// Customer-facing: records the product's current displayed price as the
// baseline. A later admin price edit only notifies if the new price is
// strictly below this — never on the price staying the same or going up.
export async function subscribeToPriceDrop(productId: string, email: string): Promise<SubscribeResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, message: "כתובת אימייל לא תקינה." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { basePrice: true, salePrice: true },
  });
  if (!product) return { ok: false, message: "המוצר לא נמצא." };

  const priceAtSignup = Number(product.salePrice ?? product.basePrice);

  try {
    await prisma.priceDropSubscription.create({
      data: { productId, email: trimmed, priceAtSignup },
    });
  } catch {
    // Unique [productId, email] violation — already subscribed at a price
    // at or below the current one is still a no-op; re-subscribing after a
    // notification (row was deleted) creates a fresh row instead of erroring.
    return { ok: true };
  }

  return { ok: true };
}

// Called from the admin product-update action right after a price change is
// persisted — never from anywhere else, since it trusts `newDisplayPrice` as
// already-committed. Fires at most once per subscriber (the row is deleted
// after sending), so a re-subscribe is required for further drops.
export async function notifyPriceDropSubscribers(
  productId: string,
  newDisplayPrice: number,
  locale: string = "he"
) {
  const subscriptions = await prisma.priceDropSubscription.findMany({
    where: { productId, priceAtSignup: { gt: newDisplayPrice } },
  });
  if (subscriptions.length === 0) return;

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true, slug: true } });
  if (!product) return;

  const name = localize(product.name as LocalizedText, locale as "he" | "en" | "ru");
  const productUrl = `${SITE_URL}/product/${product.slug}`;

  for (const sub of subscriptions) {
    await emailProvider.send({
      to: sub.email,
      subject: `ירידת מחיר: ${name} — LADY DIAMOND`,
      text: `המחיר של "${name}" ירד ל-${newDisplayPrice.toFixed(2)} ₪ (היה ${Number(sub.priceAtSignup).toFixed(2)} ₪).\n\n${productUrl}`,
    });
  }

  await prisma.priceDropSubscription.deleteMany({
    where: { id: { in: subscriptions.map((s) => s.id) } },
  });
}
