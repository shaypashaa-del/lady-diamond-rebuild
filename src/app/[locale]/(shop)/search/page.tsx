import { getTranslations, getLocale } from "next-intl/server";
import { ProductCard } from "@/components/product/ProductCard";
import { getAllPublishedProductsForSearch } from "@/server/repositories/catalog";
import { FilterBar } from "@/components/category/FilterBar";
import { toCardProduct } from "@/lib/catalog-view";
import type { LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.25" />
  </svg>
);

// Client-side substring match across all locales + SKU. The catalog is small
// enough that fetching all published products and filtering in-process is
// fine; a full-text index (e.g. Postgres tsvector) would be the next step
// once the catalog grows large enough for it to matter.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; minPrice?: string; maxPrice?: string; inStock?: string }>;
}) {
  const { q, minPrice: minPriceRaw, maxPrice: maxPriceRaw, inStock } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Search");
  const tCat = await getTranslations("Category");

  const minPriceNum = minPriceRaw ? Number.parseFloat(minPriceRaw) : undefined;
  const maxPriceNum = maxPriceRaw ? Number.parseFloat(maxPriceRaw) : undefined;
  const minPrice = Number.isFinite(minPriceNum) ? minPriceNum : undefined;
  const maxPrice = Number.isFinite(maxPriceNum) ? maxPriceNum : undefined;
  const inStockOnly = inStock === "1";

  const products = query ? await getAllPublishedProductsForSearch() : [];

  const matches = products.filter((p) => {
    const name = p.name as LocalizedText;
    const haystack = [name.he, name.en, name.ru, p.sku].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(query)) return false;
    const price = Number(p.salePrice ?? p.basePrice);
    if (minPrice != null && price < minPrice) return false;
    if (maxPrice != null && price > maxPrice) return false;
    if (inStockOnly && p.inventory <= 0) return false;
    return true;
  });

  const cards = matches.map((p) => toCardProduct(p, locale));
  const hasActiveFilters = minPrice != null || maxPrice != null || inStockOnly;

  return (
    <div>
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
          <h1 className="mt-4 text-xl font-semibold uppercase tracking-[0.2em] text-paper sm:text-3xl">
            {t("resultsFor")} &quot;{q}&quot;
          </h1>
          <p className="mt-4 text-sm text-paper/60">
            {cards.length} {cards.length === 1 ? tCat("item") : tCat("items")}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        {query && (
          <div className="mb-6">
            <FilterBar minPrice={minPrice} maxPrice={maxPrice} inStockOnly={inStockOnly} />
          </div>
        )}
        {cards.length === 0 ? (
          <p className="text-center text-ink/60">{hasActiveFilters ? tCat("noProductsMatchFilters") : t("noResults")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {cards.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
