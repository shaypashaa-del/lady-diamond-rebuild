"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Eye, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SampleProduct } from "@/lib/products-data";
import { cn } from "@/lib/cn";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useMounted } from "@/lib/use-mounted";
import { QuickViewModal } from "./QuickViewModal";

export function ProductCard({ product }: { product: SampleProduct }) {
  const t = useTranslations("Product");
  const addLine = useCartStore((s) => s.addLine);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.slug));
  const mounted = useMounted();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const isSold = product.badge === "Sold";

  function handleAddToCart() {
    addLine({
      key: `${product.slug}:default`,
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden placeholder-gradient">
        {product.badge && (
          <span
            className={cn(
              "absolute start-2 top-2 z-10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper",
              product.badge === "Sale" && "bg-clay",
              product.badge === "New" && "bg-ink",
              product.badge === "Sold" && "bg-ink/40"
            )}
          >
            {t(product.badge.toLowerCase() as "sale" | "new" | "sold")}
          </span>
        )}
        {/* Visible by default on touch devices (phones, tablets), which
            have no real hover state to reveal these — only fades in on
            hover for true pointer/desktop screens (lg+). */}
        <div className="absolute end-2 top-2 z-10 flex flex-col gap-2 opacity-100 transition-opacity max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
          <button
            aria-label={t("quickView")}
            onClick={() => setQuickViewOpen(true)}
            className="border border-gold-soft bg-paper p-2 text-ink shadow transition-colors hover:border-gold hover:bg-gold-bright hover:text-ink"
          >
            <Eye size={14} />
          </button>
          <button
            aria-label={t("wishlist")}
            onClick={() => toggleWishlist(product.slug)}
            className={cn(
              "border border-gold-soft bg-paper p-2 text-ink shadow transition-colors hover:border-gold hover:bg-gold-bright hover:text-ink",
              mounted && isWishlisted && "border-clay bg-clay text-paper"
            )}
          >
            <Heart size={14} fill={mounted && isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
        <Link href={`/product/${product.slug}`} className="relative flex h-full w-full items-center justify-center p-4 text-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(min-width: 640px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <span className="text-sm text-gold-deep">{product.name}</span>
          )}
        </Link>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[11px] uppercase tracking-wide text-gold-deep">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="block text-sm font-medium uppercase tracking-wide text-ink">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm">
          {product.salePrice ? (
            <>
              <span className="text-ink/40 line-through">{product.salePrice.toFixed(2)} ₪</span>
              <span className="font-semibold text-clay">{product.price.toFixed(2)} ₪</span>
            </>
          ) : (
            <span className="font-semibold text-ink">{product.price.toFixed(2)} ₪</span>
          )}
        </div>
        {isSold ? (
          <button
            disabled
            className="mt-3 w-full border border-gold-soft py-2 text-xs font-semibold uppercase tracking-wide text-ink/40"
          >
            {t("readMore")}
          </button>
        ) : product.hasVariants ? (
          <Link
            href={`/product/${product.slug}`}
            className="mt-3 block w-full border border-gold-bright py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink"
          >
            {t("selectOptions")}
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full border border-gold-bright py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink"
          >
            {t("addToCart")}
          </button>
        )}
      </div>

      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </div>
  );
}
