---
name: seo
description: SEO rules and checklists for ladydiamondjewels.com (Next.js 16, he/en/ru). Use when adding or changing any public page, product/category content, metadata, structured data, sitemap/robots, or when auditing the site's SEO. Encodes how this codebase does SEO so new work stays consistent.
---

# SEO for ladydiamondjewels.com

Fine-jewelry shop (Lady Diamond, Ramat Gan, Israel). Hebrew is the primary language and default locale; English and Russian are secondary. **Never invent facts** (prices, certifications, reviews, awards, materials, years, stock). Only write what is in the data or what the owner told you. Never expose costs or margins anywhere in public markup or structured data.

Read `node_modules/next/dist/docs/` before touching Next.js APIs: this is a newer Next.js with breaking changes (see AGENTS.md).

## Site facts (single source of truth)
- Domain and brand: `SITE_URL` / `SITE_NAME` in `src/lib/site-config.ts`. Use them; never hardcode the domain.
- Locales: `src/i18n/routing.ts`. `he` default with **no URL prefix**; `/en` and `/ru` are prefixed (`localePrefix: "as-needed"`). Build locale URLs with `pathFor(locale, path)` (metadata) or the sitemap's `localizedPath`; never string-concat prefixes by hand.
- Business details used in structured data live in `src/lib/schema.ts` (`organizationSchema`: JewelryStore, phone, address, hours Su-Th 09:00-19:00). Change them there only.
- Prices shown and put in structured data are **VAT-inclusive (18%)** shop prices from `resolveConfiguredPrice` / `getListingPrices`, never `basePrice` of a CONFIGURABLE product (that field is an unused placeholder).

## Every indexable public page must have
1. `generateMetadata` (or `metadata`) with: `title`, `description`, `alternates.canonical` (own locale path) and `alternates.languages` for all of `routing.locales`. Copy the pattern in `src/app/[locale]/(shop)/product/[slug]/page.tsx`.
2. Title ~50-60 characters, description ~140-160, unique per page and per locale, written in that locale. Lead with the product or category name, then the brand. No keyword stuffing, no all-caps.
3. Open Graph + Twitter come from the layout; override `openGraph.images` with the product's first image when one exists.
4. One `h1` per page, matching the page's real subject. Logical `h2`/`h3` below it.
5. Image `alt` text per locale from `MediaAsset.altText` (editable in admin → Media); fall back to the product name. Decorative images get `alt=""`.
6. Inclusion in `src/app/sitemap.ts` (each locale, with hreflang alternates). Products: only `status: "PUBLISHED"`. New static pages: add to `staticPaths`.
7. If the page does a direct Prisma query in a Server Component, add `export const revalidate = 300` (unless it already reads cookies/session), otherwise admin edits freeze in the build cache.

## Must NOT be indexed
Disallowed in `src/app/robots.ts` (expanded across all locale prefixes automatically): `/admin`, `/api`, `/checkout`, `/cart`, `/account`, `/affiliate/dashboard`, `/wishlist`, `/search`. `/search` and `/wishlist` also carry `noindex`. When adding a private or thin page, add it to `PRIVATE_PATHS` **and** give it `robots: { index: false }`. Archived or draft products must not appear in the sitemap and should not render publicly.

## Structured data (JSON-LD)
Render through `src/components/seo/JsonLd.tsx` (XSS-safe; there is a test). Builders are in `src/lib/schema.ts`:
- Site-wide (layout): `organizationSchema` (JewelryStore) and `websiteSchema`.
- Category pages: `breadcrumbSchema` + `itemListSchema`.
- Product pages: `breadcrumbSchema` + `productSchema` with real offer price (VAT-incl, ILS), availability from real stock (`InStock` / `OutOfStock` / `PreOrder` when backorder is allowed), and `brand`, `gtin`, `mpn` only when the admin filled them (Products → "פרטי מסחר נוספים").
- Never add `aggregateRating` or `review` unless real, stored reviews exist. Never fake them.
- After changing a builder, run `npx vitest run` and validate with Google's Rich Results Test on one live URL.

## Content and admin-managed SEO
- Product/category SEO fields (`seoTitle`, `seoDescription`) are edited in admin and win over the generated defaults; keep them in all three locales when the owner provides them.
- Short description doubles as the meta description fallback: write it as a real sentence, not a spec dump.
- Policy pages (`/policies/[slug]`) and about/contact are CMS pages edited in admin; keep them indexable and in the sitemap where applicable.
- Hebrew is RTL; do not rely on CSS-only text tricks for headings or put visible text in images.
- Local SEO focus: jewelry in Israel / Ramat Gan. The address, phone and hours in the footer, contact page and `organizationSchema` must stay identical (NAP consistency).

## Performance and crawlability (affects ranking)
- Product and listing images use `next/image` with correct `sizes`; the hero image is the only `priority` image on the home page.
- Keep pages server-rendered; client components only for interactivity. No content that exists only after a client fetch.
- Internal links are real `<a>`/`Link` hrefs. Category navigation comes from admin categories (`getNavCategories`), so new categories get linked automatically.
- The business card (`/card`) is a static page, outside the locale routes; it is a share/PWA tool, not an SEO page.

## Env and manual steps only the owner can do
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` / `NEXT_PUBLIC_BING_SITE_VERIFICATION` (public, not secrets) in Hostinger env, then Redeploy. Check whether they are set before assuming Search Console is verified (look for the meta tag in the live HTML).
- Submit `https://ladydiamondjewels.com/sitemap.xml` in Search Console and Bing Webmaster.
- Google Business Profile for the Ramat Gan studio; choose target keywords and write real copy.
- Never put API keys or secrets in `NEXT_PUBLIC_*` (there is a test, `src/lib/secrets-policy.test.ts`).

## Audit checklist (run after SEO-relevant changes)
Use `curl -sL <url>` against the live site, or the in-app browser:
1. `/robots.txt` lists the private paths for `/`, `/en`, `/ru` and the sitemap URL.
2. `/sitemap.xml` loads, contains product/category URLs in 3 locales with hreflang, and no archived products.
3. On one product, one category and the home page: `<title>`, meta description, canonical, `hreflang` (he/en/ru), one `h1`, JSON-LD parses (`JSON.parse` each `application/ld+json`).
4. `/search` and `/wishlist` return `noindex`.
5. No broken images; all images have alt (decorative: empty alt).
6. Mobile layout has no horizontal scroll (see the mobile checks used in this project).
7. `npx tsc --noEmit`, `npx eslint src`, `npx vitest run` pass.

## Known gaps (verify before relying on, fix when touching nearby code)
- No review/rating data exists, so there are no rich-result stars. Do not fake them.
- Product `seoTitle` / `seoDescription` are empty for most products, so the generated fallbacks are in use; filling them per product in admin is the cheapest SEO win.
