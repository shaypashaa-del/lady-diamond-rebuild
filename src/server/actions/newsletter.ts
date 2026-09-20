"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation";
import { getClientIp, isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";

export type NewsletterResult = { error: string } | { subscribed: true };

export async function subscribeToNewsletter(
  _prevState: NewsletterResult | undefined,
  formData: FormData
): Promise<NewsletterResult> {
  const rateLimitKey = `newsletter:${await getClientIp()}`;
  if (isRateLimited(rateLimitKey, 5, 15 * 60 * 1000)) {
    return { error: "יותר מדי בקשות. יש לנסות שוב מאוחר יותר." };
  }
  recordAttempt(rateLimitKey);

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) {
    return { error: "כתובת אימייל לא תקינה." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return { subscribed: true };
}
