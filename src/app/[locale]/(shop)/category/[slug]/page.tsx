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
import type { Locale } from "@/i18n/routing";

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

  if (slug === "all") {
    title = tNav("shop");
    products = await getAllPublishedProducts();
  } else {
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    title = localize(category.name as LocalizedText, locale);
    products = await getProductsByCategorySlug(slug);
  }

  const cards = products.map((p) => toCardProduct(p, locale));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
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
