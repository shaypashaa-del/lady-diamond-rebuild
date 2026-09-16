"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPasswordSafe } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";
import { isValidEmail, truncate } from "@/lib/validation";

export type AuthResult = { error: string } | void;

export async function registerCustomer(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const name = truncate(String(formData.get("name") ?? "").trim(), 200);
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = truncate(String(formData.get("phone") ?? "").trim(), 50) || null;
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "נא למלא שם, אימייל וסיסמה בת 8 תווים לפחות." };
  }
  if (!isValidEmail(email)) {
    return { error: "כתובת אימייל לא תקינה." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "כתובת האימייל כבר רשומה במערכת." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
    },
  });

  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect("/account");
}

export async function loginCustomer(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const rateLimitKey = `login:${email}`;
  if (isRateLimited(rateLimitKey)) {
    return { error: "יותר מדי ניסיונות התחברות. יש לנסות שוב בעוד כמה דקות." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await verifyPasswordSafe(password, user?.passwordHash);
  if (!user || !passwordOk) {
    recordAttempt(rateLimitKey);
    return { error: "אימייל או סיסמה שגויים." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect("/account");
}

export async function loginAdmin(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const rateLimitKey = `login:${email}`;
  if (isRateLimited(rateLimitKey)) {
    return { error: "יותר מדי ניסיונות התחברות. יש לנסות שוב בעוד כמה דקות." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"];
  const roleOk = !!user && allowedRoles.includes(user.role);
  // Always run the bcrypt compare (against a dummy hash when there's no
  // user), even though role is also checked, so response timing doesn't
  // separately leak "this email exists" for admin login.
  const passwordOk = await verifyPasswordSafe(password, user?.passwordHash);
  if (!user || !roleOk || !passwordOk) {
    recordAttempt(rateLimitKey);
    return { error: "אימייל או סיסמה שגויים, או שאין הרשאת ניהול." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
