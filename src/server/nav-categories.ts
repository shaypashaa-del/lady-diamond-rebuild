import "server-only";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { ttlMemo } from "@/lib/ttl-memo";
import type { Locale } from "@/i18n/routing";

export type NavCategoryItem = { slug: string; label: string };

// The men's category is opened once, automatically, the first time the menu loads
// (the owner asked for it). A marker in Setting makes that a one-off: if the owner
// later deletes or renames the category in the admin it is not brought back.
let menEnsured = false;
async function ensureMenCategory() {
  if (menEnsured) return;
  menEnsured = true;
  try {
    const done = await prisma.setting.findUnique({ where: { key: "men_category_created" } });
    if (done) return;
    await prisma.category.upsert({
      where: { slug: "men" },
      update: {},
      create: {
        slug: "men",
        name: { he: "תכשיטים לגבר", en: "Men's jewelry", ru: "Мужские украшения" },
        sortOrder: 50,
      },
    });
    await prisma.setting.upsert({
      where: { key: "men_category_created" },
      update: { value: true },
      create: { key: "men_category_created", value: true },
    });
  } catch (err) {
    menEnsured = false;
    console.error("[nav] men category", err);
  }
}

// Top-level categories managed in the admin (name, order, new ones) drive the
// shop menu and the footer. Empty or unavailable = fall back to the built-in list.
async function loadNavCategories(locale: Locale): Promise<NavCategoryItem[]> {
  await ensureMenCategory();
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

export const getNavCategories = ttlMemo("nav-categories", loadNavCategories, 20_000);
