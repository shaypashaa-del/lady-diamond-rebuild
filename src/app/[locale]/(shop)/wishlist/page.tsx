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

import { GemBackdrop } from "@/components/gem/GemBackdrop";

export default function WishlistPage() {
  const t = useTranslations("Wishlist");
  const tCat = useTranslations("Category");
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
    <div>
      <div className="relative overflow-hidden bg-ink py-14 text-center sm:py-20">
        <div className="relative">
          <GemBackdrop stone="ruby" />
          <p className="text-xs uppercase tracking-[0.4em] text-gold-bright">{tCat("kicker")}</p>
          <span className="gold-rule mt-4 w-16" />
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.2em] text-paper sm:text-4xl">
            {t("title")}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center text-center">
            <p className="mb-6 text-sm text-ink/60">{t("empty")}</p>
            <Link href="/category/all" className="glass-pill glass-pill-gold">
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
    </div>
  );
}
