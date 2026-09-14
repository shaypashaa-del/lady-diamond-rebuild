import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-config";

// Builds one <url> per page per locale, with hreflang alternates covering
// he (unprefixed default)/en/ru — see routing.ts's localePrefix: "as-needed".
function localizedPath(path: string, locale: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

function alternates(path: string) {
  return Object.fromEntries(routing.locales.map((l) => [l, localizedPath(path, l)]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPaths = ["/", "/category/all", "/about-us", "/contact-us", "/affiliate"];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(path, locale),
        alternates: { languages: alternates(path) },
        changeFrequency: "weekly",
        priority: path === "/" ? 1 : 0.6,
      });
    }
  }

  for (const category of categories) {
    const path = `/category/${category.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(path, locale),
        alternates: { languages: alternates(path) },
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  for (const product of products) {
    const path = `/product/${product.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(path, locale),
        alternates: { languages: alternates(path) },
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
