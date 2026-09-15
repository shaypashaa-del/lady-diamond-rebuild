"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/cn";

export type VariantView = { id: string; label: string; price: number; inventory: number };
export type ProductImageView = { url: string; alt?: string };

export function ProductDetail({
  slug,
  name,
  shortDescription,
  description,
  price,
  salePrice,
  sku,
  weightGrams,
  categoryName,
  variants,
  images = [],
}: {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  sku?: string;
  weightGrams?: number | null;
  categoryName: string;
  variants: VariantView[];
  images?: ProductImageView[];
}) {
  const t = useTranslations("Product");
  const addLine = useCartStore((s) => s.addLine);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(slug));
  const mounted = useMounted();
  const [variantId, setVariantId] = useState<string | "">(variants.length ? "" : "default");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId),
    [variants, variantId]
  );

  const displayPrice = selectedVariant ? selectedVariant.price : salePrice ?? price;
  const canAdd = variants.length === 0 || !!selectedVariant;

  function handleAddToCart() {
    if (!canAdd) return;
    addLine(
      {
        key: `${slug}:${variantId || "default"}`,
        productId: slug,
        variantId: variantId || undefined,
        slug,
        name,
        variantLabel: selectedVariant?.label,
        price: displayPrice,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-8">
      <div>
        <div className="relative aspect-square bg-neutral-100">
          {images[activeImage] && (
            <Image
              src={images[activeImage].url}
              alt={images[activeImage].alt ?? name}
              fill
              sizes="(min-width: 640px) 40vw, 90vw"
              priority
              className="object-cover"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 overflow-hidden border ${
                  i === activeImage ? "border-neutral-900" : "border-neutral-200"
                }`}
              >
                <Image src={img.url} alt={img.alt ?? name} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-400">{categoryName}</p>
        <h1 className="mt-1 text-2xl font-semibold uppercase tracking-wide">{name}</h1>
        <div className="mt-3 flex items-center gap-2 text-lg">
          {salePrice ? (
            <>
              <span className="text-neutral-400 line-through">{price.toFixed(2)} ₪</span>
              <span className="font-semibold text-rose-600">{displayPrice.toFixed(2)} ₪</span>
            </>
          ) : (
            <span className="font-semibold">{displayPrice.toFixed(2)} ₪</span>
          )}
        </div>

        {shortDescription && <p className="mt-4 text-sm text-neutral-600">{shortDescription}</p>}

        {variants.length > 0 && (
          <div className="mt-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t("options")}
            </label>
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">{t("chooseOption")}</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.inventory <= 0}>
                  {v.label} {v.inventory <= 0 ? `(${t("sold")})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center border border-neutral-300">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-sm"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="flex-1 border border-neutral-900 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
          >
            {added ? "✓" : t("addToCart")}
          </button>
          <button
            onClick={() => toggleWishlist(slug)}
            aria-label={t("wishlist")}
            className={cn(
              "flex items-center justify-center border border-neutral-300 px-3 py-3 hover:border-neutral-900",
              mounted && isWishlisted && "border-rose-600 text-rose-600"
            )}
          >
            <Heart size={16} fill={mounted && isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {(sku || weightGrams) && (
          <div className="mt-6 flex gap-3 text-xs text-neutral-400">
            {sku && <span>{t("sku")}: {sku}</span>}
            {weightGrams != null && <span>{t("weight")}: {weightGrams}g</span>}
          </div>
        )}

        {description && (
          <div className="mt-10 border-t border-neutral-200 pt-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t("description")}
            </h2>
            <p className="text-sm text-neutral-600">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
