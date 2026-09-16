"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail, truncate } from "@/lib/validation";

export type ContactResult = { error: string } | { sent: true };

export async function submitContactForm(
  _prevState: ContactResult | undefined,
  formData: FormData
): Promise<ContactResult> {
  const name = truncate(String(formData.get("name") ?? "").trim(), 200);
  const email = String(formData.get("email") ?? "").trim();
  const phone = truncate(String(formData.get("phone") ?? "").trim(), 50) || undefined;
  const subject = truncate(String(formData.get("subject") ?? "").trim(), 300) || undefined;
  const message = truncate(String(formData.get("message") ?? "").trim(), 5000);

  if (!name || !email || !message) {
    return { error: "נא למלא שם, אימייל והודעה." };
  }
  if (!isValidEmail(email)) {
    return { error: "כתובת אימייל לא תקינה." };
  }

  // NOTE: no email provider is wired up yet (see README). Messages are
  // stored so they're visible to admin at /admin/messages; wiring an actual
  // notification email is a follow-up once a provider is chosen.
  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message },
  });

  return { sent: true };
}
