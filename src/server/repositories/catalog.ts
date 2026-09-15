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
  return prisma.category.findUnique({ where: { slug } });
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

export function getRelatedProducts(categorySlug: string | undefined, excludeProductId: string, take = 4) {
  if (!categorySlug) return Promise.resolve([]);
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: excludeProductId },
      categories: { some: { category: { slug: categorySlug } } },
    },
    include: { variants: true, categories: { include: { category: true } }, ...cardImageInclude },
    take,
    orderBy: { createdAt: "desc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      categories: { include: { category: true } },
      images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}
