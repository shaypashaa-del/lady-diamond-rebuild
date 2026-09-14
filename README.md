# Lady Diamond Jewels — rebuild

An independent rebuild of ladydiamondjewels.com: Next.js (App Router) +
TypeScript + Prisma/Postgres. See [AUDIT.md](./AUDIT.md) for the original
site's structure this was built from, and the commit history for a
phase-by-phase log of what was built and verified.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- PostgreSQL via Prisma 7 (`prisma/schema.prisma`)
- next-intl for i18n — Hebrew (default, RTL), English, Russian
- Zustand for the client-side cart
- Auth: bcrypt + signed httpOnly session cookies (jose), no third-party auth provider

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npx prisma dev -n lady-diamond -d   # starts a local Postgres (skip if you have your own)
npx prisma db push
npx tsx prisma/seed.ts        # categories, products, bootstrap admin user
npx tsx prisma/seed-pages.ts  # legal/policy pages
npm run dev
```

Open http://localhost:3000 for the storefront, http://localhost:3000/admin
for the admin dashboard (credentials printed by the seed script — **change
them before any real deployment**).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `SESSION_SECRET` | yes | Signs session cookies — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | no | Used in metadata/sitemap/structured data; defaults to `https://ladydiamondjewels.com` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | no | Override the bootstrap Super Admin created by `prisma/seed.ts` |
| `WC_STORE_URL` / `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` | only for migration | WooCommerce REST API credentials for `scripts/import-woocommerce.ts` |

## Project structure

```
src/app/[locale]/       storefront routes (he default, /en, /ru)
src/app/admin/          admin dashboard — separate root layout, always Hebrew,
                        auth-guarded via the (dashboard) route group
src/components/         UI components, grouped by area (layout/home/product/admin/affiliate)
src/server/actions/     Next.js Server Actions (mutations) — the only way pages write data
src/server/repositories/  read queries for the catalog
src/server/services/    shipping/commission calculation logic
src/server/payments/    payment-provider abstraction (bank transfer / COD today)
src/lib/                cross-cutting helpers: auth, i18n content, cart store, schema.org builders
prisma/                 schema, seed scripts
scripts/                one-off tooling (WooCommerce importer)
```

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck
- `npx tsx prisma/seed.ts` — seed catalog + bootstrap admin
- `npx tsx prisma/seed-pages.ts` — seed legal/policy pages
- `npx tsx scripts/import-woocommerce.ts --dry-run` — WooCommerce import report (see script header)

## What's implemented (phases 1–10 of the original build plan)

- ✅ Catalog (products, variants, categories) backed by Postgres, admin CRUD
- ✅ Cart, checkout, order creation, coupons, shipping-rule calculation
- ✅ Payment abstraction with Bank Transfer / Cash on Delivery (matches the
  live site's actual current setup — no gateway is wired in; see below)
- ✅ Customer accounts (register/login/order history) and admin auth,
  role-gated (`/admin` requires Super Admin / Admin / Store Manager)
- ✅ Affiliate program: application, admin approval, referral tracking via
  `?ref=CODE`, coupon linkage, commission calculation, affiliate dashboard
- ✅ i18n: Hebrew default (RTL) + English + Russian, including RTL-correct
  layout (logical CSS properties, mirrored off-canvas nav)
- ✅ SEO: per-page metadata, canonical/hreflang, Open Graph, JSON-LD
  (Organization/WebSite/Product/BreadcrumbList), sitemap.xml, robots.txt
- ✅ Legal/policy pages (draft content, editable in admin)
- ✅ Cookie consent banner

## Known gaps / what still needs a decision or access

- **No real payment gateway.** Only manual Bank Transfer / Cash on Delivery
  exist, same as the live site today. `src/server/payments/types.ts` is an
  interface specifically so a real gateway (Israeli or international) can be
  added without touching checkout/order code — but choosing and integrating
  one is a real decision, not something to guess at.
- **WooCommerce migration is unrun.** `scripts/import-woocommerce.ts` is
  real, working code, but needs `WC_STORE_URL`/`WC_CONSUMER_KEY`/
  `WC_CONSUMER_SECRET` from the live site to actually execute. It also does
  NOT migrate customer passwords or historical orders — those need an
  explicit decision (see the script's header comment) before building.
- **No real product photography/brand assets.** All product images are
  placeholder blocks; visual design (colors, fonts, imagery) is a clean
  original interpretation, not a pixel-match, because the live site's own
  hero/banner images never rendered during the audit (still theme-demo
  content) — see AUDIT.md's "Needs original WordPress access" section.
- **Password reset flow** (`/reset-password`, `/affiliate-reset-password`)
  is linked from the login pages but not implemented yet.
- **Legal page content is a first draft**, explicitly not legal advice —
  needs lawyer review before launch.
- **No analytics/marketing scripts are wired in** (the cookie consent
  banner exists and gates future ones, but nothing currently listens to it).
- **Admin has no image upload / media library UI yet** — the `MediaAsset`
  model exists and the importer already populates it, but there's no
  admin screen to upload/manage images directly.

## Deployment

Not yet deployed anywhere. Suggested path: a Development environment (this
repo, as-is) → Staging (real Postgres, run the WooCommerce import in
`--dry-run` first, review the report) → Production, only after a full
manual QA pass and explicit go-ahead — per project instructions, no DNS or
domain changes without prior approval.
