"use server";

import { prisma } from "@/lib/prisma";
import { getListingPriceInfo } from "@/server/pricing/listing-prices";

export async function getProductsBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const live = await getListingPriceInfo();
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, status: "PUBLISHED" },
    include: {
      variants: true,
      categories: { include: { category: true } },
      images: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  // Server Actions can only return plain serializable values — Prisma's
  // Decimal fields must be converted before crossing into a Client Component.
  return products.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    basePrice: live.has(p.id) ? (live.get(p.id)!.list ?? live.get(p.id)!.price) : Number(p.basePrice),
    salePrice: live.has(p.id) ? (live.get(p.id)!.list != null ? live.get(p.id)!.price : null) : p.salePrice != null ? Number(p.salePrice) : null,
    inventory: p.inventory,
    needsOptions: live.has(p.id),
    variants: p.variants.map((v) => ({ id: v.id })),
    categories: p.categories.map((c) => ({ category: { name: c.category.name } })),
    images: p.images.map((img) => ({ media: { url: img.media.url, altText: img.media.altText } })),
  }));
}
