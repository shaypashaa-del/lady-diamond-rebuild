"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export type RequestResetResult = { error: string } | { resetLink?: string; sent: true };

// NOTE: no email provider is wired up yet (see README "Known gaps"). In
// production this must send the link by email instead of returning it to
// the client — returning it here is a dev-only convenience so the flow is
// testable end-to-end before a mail provider is chosen.
export async function requestPasswordReset(
  _prevState: RequestResetResult | undefined,
  formData: FormData
): Promise<RequestResetResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  // Always report success even if the email doesn't exist, so this can't be
  // used to enumerate registered accounts.
  if (!user) {
    return { sent: true };
  }

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const resetLink = `/reset-password/${token}`;
  console.log(`[password reset] ${email} -> ${resetLink} (would be emailed in production)`);

  return { sent: true, resetLink: process.env.NODE_ENV === "production" ? undefined : resetLink };
}

export type ResetPasswordResult = { error: string } | void;

export async function resetPassword(
  token: string,
  _prevState: ResetPasswordResult,
  formData: FormData
): Promise<ResetPasswordResult> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "הסיסמה חייבת להכיל לפחות 8 תווים." };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "קישור האיפוס אינו תקין או שפג תוקפו. יש לבקש קישור חדש." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await createSession({
    userId: resetToken.user.id,
    role: resetToken.user.role,
    name: resetToken.user.name,
    email: resetToken.user.email,
  });

  redirect(resetToken.user.role === "AFFILIATE" ? "/affiliate/dashboard" : "/account");
}
