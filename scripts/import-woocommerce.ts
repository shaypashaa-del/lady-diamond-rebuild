/**
 * WooCommerce -> Postgres importer (Phase 8).
 *
 * Uses the official WooCommerce REST API (read-only) — no scraping, no
 * changes to the WordPress site. Run against a STAGING copy of the database
 * first; never point this at production without reviewing the dry-run report.
 *
 * Required env vars:
 *   WC_STORE_URL          e.g. https://ladydiamondjewels.com
 *   WC_CONSUMER_KEY       from WooCommerce > Settings > Advanced > REST API
 *   WC_CONSUMER_SECRET
 *
 * Usage:
 *   npx tsx scripts/import-woocommerce.ts --dry-run   # report only, no writes
 *   npx tsx scripts/import-woocommerce.ts             # actually import
 *
 * What this does NOT do (out of scope until credentials + a go-ahead exist):
 *   - Delete or modify anything on the WordPress site (read-only GET calls).
 *   - Import customer accounts (no safe way to migrate password hashes
 *     between WordPress's phpass and this app's bcrypt — customers should
 *     register fresh, or a separate "reset your password" migration email
 *     flow should be designed explicitly before attempting this).
 *   - Import historical orders (needs an explicit decision — see AUDIT.md
 *     "Needs original WordPress/WooCommerce access" section).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const STORE_URL = process.env.WC_STORE_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const DRY_RUN = process.argv.includes("--dry-run");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type WcCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string } | null;
  menu_order: number;
};

type WcProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  status: string;
  featured: boolean;
  categories: { id: number; name: string; slug: string }[];
  images: { src: string; alt: string }[];
  attributes: { name: string; options: string[] }[];
  variations: number[];
};

async function wcFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "Missing WC_STORE_URL / WC_CONSUMER_KEY / WC_CONSUMER_SECRET. See this file's header comment."
    );
  }
  const url = new URL(`${STORE_URL}/wp-json/wc/v3${path}`);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);
  url.searchParams.set("per_page", "100");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WooCommerce API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  for (;;) {
    const batch = await wcFetch<T[]>(path, { page: String(page) });
    results.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return results;
}

// Strips HTML tags from WooCommerce's rich-text description fields — we
// store plain text and let the storefront apply its own formatting.
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

async function main() {
  console.log(DRY_RUN ? "Running in --dry-run mode (no writes)." : "Running import (will write to DB).");

  const [wcCategories, wcProducts] = await Promise.all([
    fetchAllPages<WcCategory>("/products/categories"),
    fetchAllPages<WcProduct>("/products"),
  ]);

  console.log(`Fetched ${wcCategories.length} categories and ${wcProducts.length} products from WooCommerce.`);

  const report = { categoriesCreated: 0, categoriesSkipped: 0, productsCreated: 0, productsSkipped: 0 };

  const categoryIdMap = new Map<number, string>(); // WooCommerce id -> our Category.id

  for (const wc of wcCategories) {
    if (wc.slug === "uncategorized") continue;

    const existing = await prisma.category.findUnique({ where: { slug: wc.slug } });
    if (existing) {
      categoryIdMap.set(wc.id, existing.id);
      report.categoriesSkipped++;
      continue;
    }

    report.categoriesCreated++;
    if (DRY_RUN) continue;

    const created = await prisma.category.create({
      data: {
        slug: wc.slug,
        name: { he: wc.name, en: wc.name, ru: wc.name },
        description: wc.description ? { he: stripHtml(wc.description), en: stripHtml(wc.description), ru: stripHtml(wc.description) } : undefined,
        sortOrder: wc.menu_order,
      },
    });
    categoryIdMap.set(wc.id, created.id);
  }

  for (const wc of wcProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: wc.slug } });
    if (existing) {
      report.productsSkipped++;
      continue;
    }

    report.productsCreated++;
    if (DRY_RUN) continue;

    const name = { he: wc.name, en: wc.name, ru: wc.name };
    const description = wc.description ? stripHtml(wc.description) : undefined;
    const shortDescription = wc.short_description ? stripHtml(wc.short_description) : undefined;

    const created = await prisma.product.create({
      data: {
        slug: wc.slug,
        name,
        description: description ? { he: description, en: description, ru: description } : undefined,
        shortDescription: shortDescription
          ? { he: shortDescription, en: shortDescription, ru: shortDescription }
          : undefined,
        sku: wc.sku || undefined,
        basePrice: Number(wc.regular_price || 0),
        salePrice: wc.sale_price ? Number(wc.sale_price) : undefined,
        inventory: wc.stock_quantity ?? 0,
        status: wc.status === "publish" ? "PUBLISHED" : "DRAFT",
        isFeatured: wc.featured,
      },
    });

    for (const cat of wc.categories) {
      const categoryId = categoryIdMap.get(cat.id);
      if (categoryId) {
        await prisma.productCategory.create({ data: { productId: created.id, categoryId } });
      }
    }

    // Product images: WooCommerce URLs are downloaded and stored as MediaAsset
    // rows so the storefront doesn't depend on the old WordPress host staying up.
    for (const [i, img] of wc.images.entries()) {
      const media = await prisma.mediaAsset.create({
        data: { url: img.src, filename: img.src.split("/").pop() ?? "image", altText: img.alt },
      });
      await prisma.productImage.create({
        data: { productId: created.id, mediaId: media.id, sortOrder: i },
      });
    }
  }

  console.log("Import report:", report);
  if (DRY_RUN) {
    console.log("Dry run complete — no data was written. Re-run without --dry-run to apply.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
