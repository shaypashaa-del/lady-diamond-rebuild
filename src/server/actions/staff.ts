"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requireSuperAdminSession } from "@/lib/auth/guards";
import type { Role } from "@/generated/prisma/enums";

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"];

export type CreateStaffResult = { error: string } | { created: true };

export async function createStaffUser(
  _prevState: CreateStaffResult | undefined,
  formData: FormData
): Promise<CreateStaffResult> {
  await requireSuperAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "ADMIN") as Role;

  if (!name || !email || password.length < 8) {
    return { error: "נא למלא שם, אימייל וסיסמה בת 8 תווים לפחות." };
  }
  if (!ADMIN_ROLES.includes(role)) {
    return { error: "תפקיד לא תקין." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "כתובת האימייל כבר רשומה במערכת." };
  }

  await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role, emailVerified: true },
  });

  revalidatePath("/admin/staff");
  return { created: true };
}

export async function updateStaffRole(userId: string, formData: FormData) {
  const session = await requireSuperAdminSession();
  const role = String(formData.get("role")) as Role;
  if (!ADMIN_ROLES.includes(role)) return;

  // Don't let the only super admin demote themselves by mistake.
  if (userId === session.userId && role !== "SUPER_ADMIN") {
    const otherSuperAdmins = await prisma.user.count({
      where: { role: "SUPER_ADMIN", id: { not: userId } },
    });
    if (otherSuperAdmins === 0) return;
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/staff");
}

export async function deleteStaffUser(userId: string) {
  const session = await requireSuperAdminSession();
  if (userId === session.userId) return; // can't delete yourself

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/staff");
}
