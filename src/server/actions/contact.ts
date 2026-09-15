"use server";

import { prisma } from "@/lib/prisma";

export type ContactResult = { error: string } | { sent: true };

export async function submitContactForm(
  _prevState: ContactResult | undefined,
  formData: FormData
): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  const subject = String(formData.get("subject") ?? "").trim() || undefined;
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "נא למלא שם, אימייל והודעה." };
  }

  // NOTE: no email provider is wired up yet (see README). Messages are
  // stored so they're visible to admin at /admin/messages; wiring an actual
  // notification email is a follow-up once a provider is chosen.
  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message },
  });

  return { sent: true };
}
