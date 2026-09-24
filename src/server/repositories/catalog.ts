import { cache } from "react";
import { prisma } from "@/lib/prisma";

const cardImageInclude = {
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
};

export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export const PRODUCTS_PAGE_SIZE = 24;

export type ProductSort = "newest" | "price_asc" | "price_desc";

function sortToOrderBy(sort?: ProductSort) {
  switch (sort) {
    case "price_asc":
      return { basePrice: "asc" as const };
    case "price_desc":
      return { basePrice: "desc" as const };
    default:
      return { createdAt: "desc" as const };
  }
}

export async function getAllPublishedProducts(page = 1, sort?: ProductSort) {
  const where = { status: "PUBLISHED" as const };
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
      orderBy: sortToOrderBy(sort),
      skip: (page - 1) * PRODUCTS_PAGE_SIZE,
      take: PRODUCTS_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return { products, totalCount };
}

// Unpaginated on purpose — search matches across he/en/ru name + SKU by
// substring in-process (see search/page.tsx), which needs the full catalog,
// not one page of it. Fine while the catalog is small; a Postgres full-text
// index (tsvector) would be the next step once it grows large enough to
// matter — do not reuse getAllPublishedProducts's paginated version here.
export function getAllPublishedProductsForSearch() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    orderBy: { createdAt: "desc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, include: { image: true } });
}

export async function getProductsByCategorySlug(slug: string, page = 1, sort?: ProductSort) {
  const where = {
    status: "PUBLISHED" as const,
    categories: { some: { category: { slug } } },
  };
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
      orderBy: sortToOrderBy(sort),
      skip: (page - 1) * PRODUCTS_PAGE_SIZE,
      take: PRODUCTS_PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return { products, totalCount };
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

  if (manual.length > 0) return manual.map((m) => m.related);
  if (!categorySlug) return [];

  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: productId },
      categories: { some: { category: { slug: categorySlug } } },
    },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    take,
    orderBy: { createdAt: "desc" },
  });
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
