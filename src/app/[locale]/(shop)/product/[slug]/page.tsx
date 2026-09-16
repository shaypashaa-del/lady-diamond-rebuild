import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductBySlug, getRelatedProducts } from "@/server/repositories/catalog";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { toCardProduct } from "@/lib/catalog-view";
import { ProductDetail, type VariantView } from "@/components/product/ProductDetail";
import { ProductSection } from "@/components/home/ProductSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { productSchema, breadcrumbSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";
import { routing, type Locale } from "@/i18n/routing";

function pathFor(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const name = localize(product.name as LocalizedText, locale as Locale);
  const description = localize(product.shortDescription as LocalizedText | null, locale as Locale);
  const seoTitle = product.seoTitle ? localize(product.seoTitle as LocalizedText, locale as Locale) : name;
  const seoDescription = product.seoDescription
    ? localize(product.seoDescription as LocalizedText, locale as Locale)
    : description;
  const path = pathFor(locale, `/product/${slug}`);

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, pathFor(l, `/product/${slug}`)])
      ),
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: path,
      type: "website",
    },
  };
}

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

  const name = localize(product.name as LocalizedText, locale);
  const description = localize(product.shortDescription as LocalizedText | null, locale);
  const price = Number(product.salePrice ?? product.basePrice);
  const productUrl = `${SITE_URL}${pathFor(locale, `/product/${slug}`)}`;

  const relatedRaw = await getRelatedProducts(product.id, product.categories[0]?.category.slug);
  const related = relatedRaw.map((p) => toCardProduct(p, locale));
  const tHome = await getTranslations("Home");

  const totalInventory =
    product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + v.inventory, 0)
      : product.inventory;
  const firstImage = product.images[0]?.media.url;

  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name,
            description,
            sku: product.sku,
            price,
            url: productUrl,
            availability: totalInventory > 0 ? "InStock" : "OutOfStock",
            image: firstImage ? `${SITE_URL}${firstImage}` : undefined,
          }),
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: categoryName || "Shop", url: `${SITE_URL}${pathFor(locale, "/category/all")}` },
            { name, url: productUrl },
          ]),
        ]}
      />
      <ProductDetail
        slug={product.slug}
        name={name}
        shortDescription={description}
        description={localize(product.description as LocalizedText | null, locale)}
        price={Number(product.basePrice)}
        salePrice={product.salePrice != null ? Number(product.salePrice) : undefined}
        inventory={product.inventory}
        sku={product.sku ?? undefined}
        weightGrams={product.weightGrams}
        categoryName={categoryName}
        variants={variants}
        images={product.images.map((img) => ({ url: img.media.url, alt: img.media.altText ?? undefined }))}
      />
      {related.length > 0 && (
        <ProductSection title={tHome("relatedProducts")} products={related} />
      )}
    </>
  );
}
