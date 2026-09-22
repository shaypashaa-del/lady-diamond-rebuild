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

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.25" />
  </svg>
);

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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,170,93,0.16)_0%,transparent_65%)]"
        />
        <DiamondMark className="pointer-events-none absolute -top-14 -end-14 h-56 w-56 text-paper/[0.05]" />
        <DiamondMark className="pointer-events-none absolute -bottom-12 -start-12 h-44 w-44 text-paper/[0.04]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-bright">{tCat("kicker")}</p>
          <span className="gold-rule mt-4 w-16" />
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.2em] text-paper sm:text-4xl">
            {t("title")}
          </h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
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
    </div>
  );
}
