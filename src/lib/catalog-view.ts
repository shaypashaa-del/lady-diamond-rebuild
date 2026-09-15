import type { Locale } from "@/i18n/routing";
import { t, type LocalizedText } from "@/lib/i18n-content";
import type { SampleProduct } from "@/lib/products-data";

// Minimal shape we need from a Prisma product query result (with variants + categories included).
type ProductWithRelations = {
  slug: string;
  name: unknown;
  shortDescription?: unknown;
  basePrice: { toString(): string } | number;
  salePrice: ({ toString(): string } | number) | null;
  inventory: number;
  variants: { id: string }[];
  categories: { category: { name: unknown } }[];
};

export function toCardProduct(product: ProductWithRelations, locale: Locale): SampleProduct {
  const price = Number(product.basePrice);
  const salePrice = product.salePrice != null ? Number(product.salePrice) : undefined;
  const categoryName = product.categories[0]
    ? t(product.categories[0].category.name as LocalizedText, locale)
    : "";

  let badge: SampleProduct["badge"] | undefined;
  if (product.inventory <= 0) badge = "Sold";
  else if (salePrice) badge = "Sale";

  return {
    slug: product.slug,
    name: t(product.name as LocalizedText, locale),
    category: categoryName,
    price: salePrice ?? price,
    salePrice: salePrice ? price : undefined,
    hasVariants: product.variants.length > 0,
    badge,
    blurb: product.shortDescription ? t(product.shortDescription as LocalizedText, locale) : "",
  };
}
