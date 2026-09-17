import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import {
  getAllPublishedProducts,
  getCategoryBySlug,
  getProductsByCategorySlug,
  PRODUCTS_PAGE_SIZE,
} from "@/server/repositories/catalog";
import { Link } from "@/i18n/navigation";
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
    title = category.seoTitle
      ? localize(category.seoTitle as LocalizedText, locale as Locale)
      : localize(category.name as LocalizedText, locale as Locale);
    description = category.seoDescription
      ? localize(category.seoDescription as LocalizedText, locale as Locale)
      : category.description
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageRaw } = await searchParams;
  // Guard against a negative/NaN/non-numeric ?page= value breaking the
  // Prisma `skip` calculation — clamp to a sane positive integer.
  const parsedPage = Number.parseInt(pageRaw ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const locale = (await getLocale()) as Locale;
  const tNav = await getTranslations("Nav");
  const tCat = await getTranslations("Category");

  let title: string;
  let products;
  let totalCount: number;
  let imageUrl: string | undefined;

  if (slug === "all") {
    title = tNav("shop");
    ({ products, totalCount } = await getAllPublishedProducts(page));
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    title = localize(category.name as LocalizedText, locale);
    ({ products, totalCount } = await getProductsByCategorySlug(slug, page));
    imageUrl = category.image?.url;
  }

  const cards = products.map((p) => toCardProduct(p, locale));
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: title, url: `${SITE_URL}${pathFor(locale, `/category/${slug}`)}` },
        ])}
      />
      {imageUrl && (
        <div className="relative mb-8 aspect-[3/1] w-full overflow-hidden placeholder-gradient">
          <Image src={imageUrl} alt={title} fill sizes="100vw" className="object-cover" />
        </div>
      )}
      <h1 className="mb-2 text-center text-2xl font-semibold uppercase tracking-[0.2em]">{title}</h1>
      <p className="mb-10 text-center text-sm text-ink/50">
        {totalCount} {totalCount === 1 ? tCat("item") : tCat("items")}
      </p>
      {cards.length === 0 ? (
        <p className="text-center text-ink/60">{tCat("noProducts")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {cards.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={p === 1 ? `/category/${slug}` : `/category/${slug}?page=${p}`}
                  className={`flex h-9 w-9 items-center justify-center border text-sm ${
                    p === page
                      ? "border-gold-bright bg-ink text-paper"
                      : "border-gold-soft text-ink/80 hover:border-gold"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
