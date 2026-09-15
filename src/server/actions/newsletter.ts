"use server";

import { prisma } from "@/lib/prisma";

export type NewsletterResult = { error: string } | { subscribed: true };

export async function subscribeToNewsletter(
  _prevState: NewsletterResult | undefined,
  formData: FormData
): Promise<NewsletterResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "כתובת אימייל לא תקינה." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return { subscribed: true };
}
