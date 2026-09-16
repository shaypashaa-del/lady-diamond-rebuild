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

export function getAllPublishedProducts() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    orderBy: { createdAt: "desc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, include: { image: true } });
}

export function getProductsByCategorySlug(slug: string) {
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categories: { some: { category: { slug } } },
    },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    orderBy: { createdAt: "desc" },
  });
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

export function getProductBySlug(slug: string) {
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
    },
  });
}
