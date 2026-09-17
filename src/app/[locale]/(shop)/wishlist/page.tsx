"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useMounted } from "@/lib/use-mounted";
import { getProductsBySlugs } from "@/server/actions/wishlist";
import { toCardProduct } from "@/lib/catalog-view";
import { ProductCard } from "@/components/product/ProductCard";
import type { Locale } from "@/i18n/routing";
import type { SampleProduct } from "@/lib/products-data";

export default function WishlistPage() {
  const t = useTranslations("Wishlist");
  const locale = useLocale() as Locale;
  const slugs = useWishlistStore((s) => s.slugs);
  const mounted = useMounted();
  const [cards, setCards] = useState<SampleProduct[]>([]);

  useEffect(() => {
    if (!mounted) return;
    getProductsBySlugs(slugs).then((products) => {
      setCards(products.map((p) => toCardProduct(p, locale)));
    });
  }, [mounted, slugs, locale]);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      <h1 className="mb-10 text-center text-2xl font-semibold uppercase tracking-[0.2em]">{t("title")}</h1>
      {cards.length === 0 ? (
        <div className="text-center">
          <p className="mb-6 text-sm text-ink/60">{t("empty")}</p>
          <Link href="/category/all" className="border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-gold-bright hover:text-ink">
            {t("continueShopping")}
          </Link>
        </div>
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
