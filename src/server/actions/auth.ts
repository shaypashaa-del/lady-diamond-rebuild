"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

export type AuthResult = { error: string } | void;

export async function registerCustomer(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "נא למלא שם, אימייל וסיסמה בת 8 תווים לפחות." };
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
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

  const user = await prisma.user.findUnique({ where: { email } });
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"];
  if (!user || !allowedRoles.includes(user.role) || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "אימייל או סיסמה שגויים, או שאין הרשאת ניהול." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
