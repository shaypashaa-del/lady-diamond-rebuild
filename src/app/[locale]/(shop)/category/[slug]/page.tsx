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
  type ProductSort,
} from "@/server/repositories/catalog";
import { SortSelect } from "@/components/category/SortSelect";
import { FilterBar } from "@/components/category/FilterBar";
import { Link } from "@/i18n/navigation";
import { toCardProduct } from "@/lib/catalog-view";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";
import { routing, type Locale } from "@/i18n/routing";

function pathFor(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${path}`;
}

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.25" />
  </svg>
);

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

const VALID_SORTS: ProductSort[] = ["newest", "price_asc", "price_desc"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }>;
}) {
  const { slug } = await params;
  const { page: pageRaw, sort: sortRaw, minPrice: minPriceRaw, maxPrice: maxPriceRaw, inStock } = await searchParams;
  // Guard against a negative/NaN/non-numeric ?page= value breaking the
  // Prisma `skip` calculation — clamp to a sane positive integer.
  const parsedPage = Number.parseInt(pageRaw ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const sort: ProductSort = VALID_SORTS.includes(sortRaw as ProductSort) ? (sortRaw as ProductSort) : "newest";

  const minPrice = minPriceRaw ? Number.parseFloat(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw ? Number.parseFloat(maxPriceRaw) : undefined;
  const filters = {
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    inStockOnly: inStock === "1",
  };

  const locale = (await getLocale()) as Locale;
  const tNav = await getTranslations("Nav");
  const tCat = await getTranslations("Category");

  let title: string;
  let products;
  let totalCount: number;
  let imageUrl: string | undefined;

  if (slug === "all") {
    title = tNav("shop");
    ({ products, totalCount } = await getAllPublishedProducts(page, sort, filters));
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    title = localize(category.name as LocalizedText, locale);
    ({ products, totalCount } = await getProductsByCategorySlug(slug, page, sort, filters));
    imageUrl = category.image?.url;
  }

  const cards = products.map((p) => toCardProduct(p, locale));
  const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PAGE_SIZE));

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: SITE_URL },
            { name: title, url: `${SITE_URL}${pathFor(locale, `/category/${slug}`)}` },
          ]),
          ...(cards.length > 0
            ? [
                itemListSchema(
                  cards.map((c) => ({
                    name: c.name,
                    url: `${SITE_URL}${pathFor(locale, `/product/${c.slug}`)}`,
                  }))
                ),
              ]
            : []),
        ]}
      />

      {/* A dark jewel-box band, matching the rest of the site's hero
          treatment, rather than a bare title on plain white. */}
      <div className="relative overflow-hidden bg-ink py-14 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,170,93,0.16)_0%,transparent_65%)]"
        />
        <DiamondMark className="pointer-events-none absolute -top-14 -end-14 h-56 w-56 text-paper/[0.05]" />
        <DiamondMark className="pointer-events-none absolute -bottom-12 -start-12 h-44 w-44 text-paper/[0.04]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-bright">{tCat("kicker")}</p>
          <span className="gold-rule mt-4 w-16" />
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.2em] text-paper sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm text-paper/60">
            {totalCount} {totalCount === 1 ? tCat("item") : tCat("items")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        {imageUrl && (
          <div className="relative mb-10 aspect-[3/1] w-full overflow-hidden border border-gold-bright">
            <Image src={imageUrl} alt={title} fill sizes="100vw" className="object-cover" />
          </div>
        )}
        <div className="mb-6">
          <FilterBar minPrice={filters.minPrice} maxPrice={filters.maxPrice} inStockOnly={filters.inStockOnly} />
        </div>
        <div className="mb-10 flex justify-end">
          <SortSelect value={sort} slug={slug} />
        </div>
        {cards.length === 0 ? (
          <p className="text-center text-ink/60">
            {filters.minPrice != null || filters.maxPrice != null || filters.inStockOnly
              ? tCat("noProductsMatchFilters")
              : tCat("noProducts")}
          </p>
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
                    href={{
                      pathname: `/category/${slug}`,
                      query: {
                        ...(p !== 1 ? { page: p } : {}),
                        ...(sort !== "newest" ? { sort } : {}),
                        ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
                        ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
                        ...(filters.inStockOnly ? { inStock: "1" } : {}),
                      },
                    }}
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
    </div>
  );
}
