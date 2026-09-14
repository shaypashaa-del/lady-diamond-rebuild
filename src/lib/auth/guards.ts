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

export async function requireCustomerSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
