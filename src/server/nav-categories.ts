import "server-only";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

export type NavCategoryItem = { slug: string; label: string };

// Top-level categories managed in the admin (name, order, new ones) drive the
// shop menu and the footer. Empty or unavailable = fall back to the built-in list.
export async function getNavCategories(locale: Locale): Promise<NavCategoryItem[]> {
  try {
    const rows = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
      select: { slug: true, name: true },
      take: 12,
    });
    return rows
      .filter((r) => r.slug !== "all")
      .map((r) => ({ slug: r.slug, label: localize(r.name as LocalizedText, locale) }))
      .filter((r) => r.label);
  } catch (err) {
    console.error("[nav] categories unavailable", err);
    return [];
  }
}
