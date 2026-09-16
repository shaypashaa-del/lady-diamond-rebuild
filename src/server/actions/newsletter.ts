"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation";

export type NewsletterResult = { error: string } | { subscribed: true };

export async function subscribeToNewsletter(
  _prevState: NewsletterResult | undefined,
  formData: FormData
): Promise<NewsletterResult> {
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
