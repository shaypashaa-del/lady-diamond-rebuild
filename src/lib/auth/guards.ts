import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./session";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"];

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireSuperAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
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
