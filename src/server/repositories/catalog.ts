import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { applyLivePrices } from "@/server/pricing/listing-prices";

const cardImageInclude = {
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
};

export async function getFeaturedProducts() {
  return applyLivePrices(await prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    take: 8,
    orderBy: { createdAt: "desc" },
  }));
}

export const PRODUCTS_PAGE_SIZE = 24;

export type ProductSort = "newest" | "price_asc" | "price_desc";

// Kept small on purpose: with real structured material/diamond data on
// almost no products yet (see AGENTS.md pricing-engine notes), a metal/
// diamond filter would mostly return empty results. Price range and stock
// status are the two facets every product actually has data for today.
export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
};

function filtersToWhere(filters?: ProductFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.minPrice != null || filters?.maxPrice != null) {
    where.basePrice = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters?.inStockOnly) {
    where.inventory = { gt: 0 };
  }
  return where;
}

// Price sorting and price filters must use the live price (what the product
// page shows), not the stale basePrice column, so those requests load the
// whole matching set, price it, then sort/filter/paginate in memory.
async function listCards(
  baseWhere: Record<string, unknown>,
  page: number,
  sort?: ProductSort,
  filters?: ProductFilters
) {
  const { minPrice, maxPrice, ...rest } = filters ?? {};
  const where = { ...baseWhere, ...filtersToWhere(rest) };
  const include = { variants: true, categories: { include: { category: true } }, ...cardImageInclude };
  const priceDriven = sort === "price_asc" || sort === "price_desc" || minPrice != null || maxPrice != null;
  if (!priceDriven) {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PRODUCTS_PAGE_SIZE,
        take: PRODUCTS_PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ]);
    return { products: await applyLivePrices(products), totalCount };
  }
  let all = await applyLivePrices(await prisma.product.findMany({ where, include, orderBy: { createdAt: "desc" } }));
  const shown = (p: (typeof all)[number]) => Number(p.salePrice ?? p.basePrice);
  if (minPrice != null) all = all.filter((p) => shown(p) >= minPrice);
  if (maxPrice != null) all = all.filter((p) => shown(p) <= maxPrice);
  if (sort === "price_asc") all.sort((a, b) => shown(a) - shown(b));
  if (sort === "price_desc") all.sort((a, b) => shown(b) - shown(a));
  return {
    products: all.slice((page - 1) * PRODUCTS_PAGE_SIZE, page * PRODUCTS_PAGE_SIZE),
    totalCount: all.length,
  };
}

export function getAllPublishedProducts(page = 1, sort?: ProductSort, filters?: ProductFilters) {
  return listCards({ status: "PUBLISHED" }, page, sort, filters);
}

// Unpaginated on purpose — search matches across he/en/ru name + SKU by
// substring in-process (see search/page.tsx), which needs the full catalog,
// not one page of it. Fine while the catalog is small; a Postgres full-text
// index (tsvector) would be the next step once it grows large enough to
// matter — do not reuse getAllPublishedProducts's paginated version here.
export async function getAllPublishedProductsForSearch() {
  return applyLivePrices(
    await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
      orderBy: { createdAt: "desc" },
    })
  );
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, include: { image: true } });
}

export function getProductsByCategorySlug(
  slug: string,
  page = 1,
  sort?: ProductSort,
  filters?: ProductFilters
) {
  return listCards(
    { status: "PUBLISHED", categories: { some: { category: { slug } } } },
    page,
    sort,
    filters
  );
}

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

// Prefers manually-curated relations (set by admin on the product form);
// falls back to same-category products when none are set.
export async function getRelatedProducts(
  productId: string,
  categorySlug: string | undefined,
  take = 4
) {
  const manual = await prisma.productRelation.findMany({
    where: { productId, related: { status: "PUBLISHED" } },
    include: {
      related: {
        include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
      },
    },
    take,
  });

  if (manual.length > 0) return applyLivePrices(manual.map((m) => m.related));
  if (!categorySlug) return [];

  return applyLivePrices(
    await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: productId },
        categories: { some: { category: { slug: categorySlug } } },
      },
      include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
      take,
      orderBy: { createdAt: "desc" },
    })
  );
}

// Wrapped in React's per-request cache() because the product page calls
// this twice (once from generateMetadata, once from the page body) — without
// this, that's two full round-trips to Supabase for every single page view.
// Adding materialOptions/diamondOptions here made each round-trip heavier,
// which is what made the pre-existing double-fetch noticeably slow enough
// to make clicking a product feel unresponsive.
export const getProductBySlug = cache((slug: string) => {
  // `findFirst`, not `findUnique`, because adding the `status` filter turns
  // this into a non-unique where clause — otherwise a DRAFT product's page
  // would still render for anyone who knows or guesses its slug, even though
  // it's excluded from every list/search/sitemap.
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      variants: true,
      categories: { include: { category: true } },
      images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      materialOptions: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      diamondOptions: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });
});
