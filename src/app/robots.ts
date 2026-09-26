import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { routing } from "@/i18n/routing";

// Private/non-indexable paths, unprefixed (the "he" default locale, which
// uses no URL prefix per routing.ts's localePrefix: "as-needed"). A plain
// "/checkout" disallow only matches paths that literally start with
// "/checkout" — it does NOT also block "/en/checkout" or "/ru/checkout", so
// every entry here is expanded across all locale prefixes below rather than
// listed once.
const PRIVATE_PATHS = ["/admin", "/api", "/checkout", "/cart", "/account", "/affiliate/dashboard", "/wishlist", "/search"];

export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE_PATHS.flatMap((path) =>
    routing.locales
      .filter((l) => l !== routing.defaultLocale)
      .map((l) => `/${l}${path}`)
      .concat(path)
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
