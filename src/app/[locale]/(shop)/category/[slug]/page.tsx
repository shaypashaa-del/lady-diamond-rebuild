import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import {
  getAllPublishedProducts,
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "@/server/repositories/catalog";
import { toCardProduct } from "@/lib/catalog-view";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
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
  const path = pathFor(locale, `/category/${slug}`);

  let title: string;
  let description: string | undefined;

  if (slug === "all") {
    const tNav = await getTranslations({ locale, namespace: "Nav" });
    title = tNav("shop");
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) return {};
    title = localize(category.name as LocalizedText, locale as Locale);
    description = category.description
      ? localize(category.description as LocalizedText, locale as Locale)
      : undefined;
  }

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(routing.locales.map((l) => [l, pathFor(l, `/category/${slug}`)])),
    },
    openGraph: { title, description, url: path, type: "website" },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as Locale;
  const tNav = await getTranslations("Nav");
  const tCat = await getTranslations("Category");

  let title: string;
  let products;
  let imageUrl: string | undefined;

  if (slug === "all") {
    title = tNav("shop");
    products = await getAllPublishedProducts();
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    title = localize(category.name as LocalizedText, locale);
    products = await getProductsByCategorySlug(slug);
    imageUrl = category.image?.url;
  }

  const cards = products.map((p) => toCardProduct(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: title, url: `${SITE_URL}${pathFor(locale, `/category/${slug}`)}` },
        ])}
      />
      {imageUrl && (
        <div className="relative mb-8 aspect-[3/1] w-full overflow-hidden bg-neutral-100">
          <Image src={imageUrl} alt={title} fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <h1 className="mb-2 text-center text-2xl font-semibold uppercase tracking-[0.2em]">{title}</h1>
      <p className="mb-10 text-center text-sm text-neutral-400">
        {cards.length} {cards.length === 1 ? tCat("item") : tCat("items")}
      </p>
      {cards.length === 0 ? (
        <p className="text-center text-neutral-500">{tCat("noProducts")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {cards.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
