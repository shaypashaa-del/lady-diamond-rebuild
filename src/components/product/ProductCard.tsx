"use client";

import { useTranslations } from "next-intl";
import { Eye, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SampleProduct } from "@/lib/products-data";
import { cn } from "@/lib/cn";
import { useCartStore } from "@/lib/cart-store";

export function ProductCard({ product }: { product: SampleProduct }) {
  const t = useTranslations("Product");
  const addLine = useCartStore((s) => s.addLine);
  const isSold = product.badge === "Sold";

  function handleAddToCart() {
    addLine({
      key: `${product.slug}:default`,
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      price: product.price,
    });
  }

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        {product.badge && (
          <span
            className={cn(
              "absolute start-2 top-2 z-10 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
              product.badge === "Sale" && "bg-rose-600",
              product.badge === "New" && "bg-neutral-900",
              product.badge === "Sold" && "bg-neutral-400"
            )}
          >
            {t(product.badge.toLowerCase() as "sale" | "new" | "sold")}
          </span>
        )}
        <div className="absolute end-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button aria-label={t("quickView")} className="rounded-full bg-white p-2 shadow hover:bg-neutral-900 hover:text-white">
            <Eye size={14} />
          </button>
          <button aria-label={t("wishlist")} className="rounded-full bg-white p-2 shadow hover:bg-neutral-900 hover:text-white">
            <Heart size={14} />
          </button>
        </div>
        <Link href={`/product/${product.slug}`} className="flex h-full w-full items-center justify-center text-neutral-300">
          <span className="text-xs">{product.name}</span>
        </Link>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[11px] uppercase tracking-wide text-neutral-400">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="text-sm font-medium uppercase tracking-wide text-neutral-900">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm">
          {product.salePrice ? (
            <>
              <span className="text-neutral-400 line-through">{product.salePrice.toFixed(2)} ₪</span>
              <span className="font-semibold text-rose-600">{product.price.toFixed(2)} ₪</span>
            </>
          ) : (
            <span className="font-semibold">{product.price.toFixed(2)} ₪</span>
          )}
        </div>
        {isSold ? (
          <button
            disabled
            className="mt-3 w-full border border-neutral-300 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400"
          >
            {t("readMore")}
          </button>
        ) : product.hasVariants ? (
          <Link
            href={`/product/${product.slug}`}
            className="mt-3 block w-full border border-neutral-900 py-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            {t("selectOptions")}
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            className="mt-3 w-full border border-neutral-900 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
          >
            {t("addToCart")}
          </button>
        )}
      </div>
    </div>
  );
}
