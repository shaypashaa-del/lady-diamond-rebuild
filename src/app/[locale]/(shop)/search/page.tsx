import { getTranslations, getLocale } from "next-intl/server";
import { ProductCard } from "@/components/product/ProductCard";
import { getAllPublishedProducts } from "@/server/repositories/catalog";
import { toCardProduct } from "@/lib/catalog-view";
import type { LocalizedText } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

// Client-side substring match across all locales + SKU. The catalog is small
// enough that fetching all published products and filtering in-process is
// fine; a full-text index (e.g. Postgres tsvector) would be the next step
// once the catalog grows large enough for it to matter.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("Search");
  const tCat = await getTranslations("Category");

  const products = query ? await getAllPublishedProducts() : [];

  const matches = products.filter((p) => {
    const name = p.name as LocalizedText;
    const haystack = [name.he, name.en, name.ru, p.sku].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query);
  });

  const cards = matches.map((p) => toCardProduct(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="mb-2 text-center text-xl font-semibold uppercase tracking-[0.2em]">
        {t("resultsFor")} &quot;{q}&quot;
      </h1>
      <p className="mb-10 text-center text-sm text-neutral-400">
        {cards.length} {cards.length === 1 ? tCat("item") : tCat("items")}
      </p>
      {cards.length === 0 ? (
        <p className="text-center text-neutral-500">{t("noResults")}</p>
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
