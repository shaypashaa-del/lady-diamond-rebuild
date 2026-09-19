"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
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
  inventory,
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
  inventory: number;
  sku?: string;
  weightGrams?: number | null;
  categoryName: string;
  variants: VariantView[];
  images?: ProductImageView[];
}) {
  const t = useTranslations("Product");
  const router = useRouter();
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
  const availableInventory = selectedVariant ? selectedVariant.inventory : inventory;
  const canAdd = (variants.length === 0 || !!selectedVariant) && availableInventory > 0;

  function currentLine() {
    return {
      key: `${slug}:${variantId || "default"}`,
      productId: slug,
      // `variantId` state doubles as a "default" sentinel for products with
      // no real variants — never forward that literal string as a real
      // variant id (it doesn't exist in the DB and fails the order's FK).
      variantId: selectedVariant?.id,
      slug,
      name,
      variantLabel: selectedVariant?.label,
      price: displayPrice,
      imageUrl: images[0]?.url,
    };
  }

  function handleAddToCart() {
    if (!canAdd) return;
    addLine(currentLine(), quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow(method: "bit" | "paypal") {
    if (!canAdd) return;
    addLine(currentLine(), quantity);
    router.push(`/checkout?pm=${method}`);
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-8">
      <div>
        <div className="relative aspect-square placeholder-gradient">
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
                  i === activeImage ? "border-gold" : "border-gold-soft"
                }`}
              >
                <Image src={img.url} alt={img.alt ?? name} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-gold">{categoryName}</p>
        <h1 className="mt-1 text-2xl font-semibold uppercase tracking-wide text-ink">{name}</h1>
        <span className="gold-rule-start mt-3 w-8" />
        <div className="mt-3 flex items-center gap-2 text-lg">
          {salePrice ? (
            <>
              <span className="text-ink/40 line-through">{price.toFixed(2)} ₪</span>
              <span className="font-semibold text-clay">{displayPrice.toFixed(2)} ₪</span>
            </>
          ) : (
            <span className="font-semibold text-ink">{displayPrice.toFixed(2)} ₪</span>
          )}
        </div>

        {shortDescription && <p className="mt-4 text-sm text-ink/70">{shortDescription}</p>}

        {variants.length > 0 && (
          <div className="mt-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink/60">
              {t("options")}
            </label>
            <select
              value={variantId}
              onChange={(e) => {
                setVariantId(e.target.value);
                setQuantity(1);
              }}
              className="w-full border border-gold-soft px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
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
          <div className="flex items-center border border-gold-soft">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-sm text-ink hover:text-gold"
              aria-label={t("decreaseQty")}
            >
              −
            </button>
            <span className="w-8 text-center text-sm text-ink">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(availableInventory, q + 1))}
              disabled={quantity >= availableInventory}
              className="px-3 py-2 text-sm text-ink hover:text-gold disabled:cursor-not-allowed disabled:text-ink/30"
              aria-label={t("increaseQty")}
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="flex-1 border border-gold-bright py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink disabled:cursor-not-allowed disabled:border-gold-soft disabled:text-ink/40"
          >
            {added ? "✓" : t("addToCart")}
          </button>
          <button
            onClick={() => toggleWishlist(slug)}
            aria-label={t("wishlist")}
            className={cn(
              "flex items-center justify-center border border-gold-soft px-3 py-3 text-ink transition-colors hover:border-gold",
              mounted && isWishlisted && "border-clay text-clay"
            )}
          >
            <Heart size={16} fill={mounted && isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => handleBuyNow("bit")}
            disabled={!canAdd}
            className="flex-1 border border-gold-soft py-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("buyWithBit")}
          </button>
          <button
            onClick={() => handleBuyNow("paypal")}
            disabled={!canAdd}
            className="flex-1 border border-gold-soft py-2.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("buyWithPaypal")}
          </button>
        </div>

        {(sku || weightGrams) && (
          <div className="mt-6 flex gap-3 text-xs text-ink/50">
            {sku && <span>{t("sku")}: {sku}</span>}
            {weightGrams != null && <span>{t("weight")}: {weightGrams}g</span>}
          </div>
        )}

        {description && (
          <div className="mt-10 border-t border-gold-soft pt-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
              {t("description")}
            </h2>
            <p className="text-sm text-ink/70">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
