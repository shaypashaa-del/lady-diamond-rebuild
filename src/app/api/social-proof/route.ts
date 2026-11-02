import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { t, type LocalizedText } from "@/lib/i18n-content";
import { routing, type Locale } from "@/i18n/routing";
import { getRecentSales, getSocialProofSettings } from "@/server/social-proof";
import { getActivitySummary } from "@/server/activity";

// Recent real purchases (city + product, no names) and recent real "added to cart"
// moments (product only, the shopper is anonymous) for the small notices.
export async function GET(req: Request) {
  const l = new URL(req.url).searchParams.get("l");
  const locale = (routing.locales as readonly string[]).includes(l ?? "") ? (l as Locale) : routing.defaultLocale;
  const settings = await getSocialProofSettings();
  const [sales, activity] = await Promise.all([
    settings.sales ? getRecentSales() : [],
    settings.interest ? getActivitySummary() : null,
  ]);
  let interest: { product: string; at: string }[] = [];
  if (activity && activity.recentCart.length > 0) {
    const slugs = [...new Set(activity.recentCart.map((c) => c.product))];
    const products = await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } });
    const names = new Map(products.map((p) => [p.slug, t(p.name as LocalizedText, locale)]));
    interest = activity.recentCart.flatMap((c) => (names.get(c.product) ? [{ product: names.get(c.product)!, at: c.at }] : []));
  }
  return NextResponse.json({ sales, interest }, { headers: { "Cache-Control": "public, max-age=60" } });
}
