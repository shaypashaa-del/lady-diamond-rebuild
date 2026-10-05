import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"];

// The session cookie carries the role it was issued with and lives for weeks,
// so a demoted or deleted staff member would otherwise keep admin rights. The
// role is re-read from the database on every admin action.
async function currentRole(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role ?? null;
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    redirect("/admin/login");
  }
  const role = await currentRole(session.userId);
  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect("/admin/login");
  }
  return { ...session, role };
}

export async function requireSuperAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }
  if ((await currentRole(session.userId)) !== "SUPER_ADMIN") {
    redirect("/admin");
  }
  return session;
}

export async function requireCustomerSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAffiliateSession() {
  const session = await getSession();
  if (!session || session.role !== "AFFILIATE") {
    redirect("/affiliate/login");
  }
  return session;
}
