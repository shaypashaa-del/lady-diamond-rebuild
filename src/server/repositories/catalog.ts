import { prisma } from "@/lib/prisma";

export function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: { variants: true, categories: { include: { category: true } } },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

export function getAllPublishedProducts() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: { variants: true, categories: { include: { category: true } } },
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
    include: { variants: true, categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
      categories: { include: { category: true } },
      images: { include: { media: true } },
    },
  });
}
