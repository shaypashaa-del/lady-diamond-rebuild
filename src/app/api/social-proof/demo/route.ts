import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { t, type LocalizedText } from "@/lib/i18n-content";
import { routing, type Locale } from "@/i18n/routing";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"];

// Staff-only preview of the social-proof notices with sample numbers, to show the team
// how a busy day looks. Only answers a logged-in admin; customers never get it.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ ok: false }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const l = new URL(req.url).searchParams.get("l");
  const locale = (routing.locales as readonly string[]).includes(l ?? "") ? (l as Locale) : routing.defaultLocale;
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { name: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return NextResponse.json(
    { ok: true, products: products.map((p) => t(p.name as LocalizedText, locale)) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
