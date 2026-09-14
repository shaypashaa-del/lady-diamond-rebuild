import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/server/repositories/catalog";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { ProductDetail, type VariantView } from "@/components/product/ProductDetail";
import type { Locale } from "@/i18n/routing";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const variants: VariantView[] = product.variants.map((v) => ({
    id: v.id,
    label: localize((v.attributes as { color?: LocalizedText }).color, locale),
    price: Number(v.salePrice ?? v.price),
    inventory: v.inventory,
  }));

  const categoryName = product.categories[0]
    ? localize(product.categories[0].category.name as LocalizedText, locale)
    : "";

  return (
    <ProductDetail
      slug={product.slug}
      name={localize(product.name as LocalizedText, locale)}
      shortDescription={localize(product.shortDescription as LocalizedText | null, locale)}
      description={localize(product.description as LocalizedText | null, locale)}
      price={Number(product.basePrice)}
      salePrice={product.salePrice != null ? Number(product.salePrice) : undefined}
      sku={product.sku ?? undefined}
      categoryName={categoryName}
      variants={variants}
    />
  );
}
