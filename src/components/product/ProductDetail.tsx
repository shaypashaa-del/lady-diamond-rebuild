"use client";

import { formatIls } from "@/lib/format-price";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heart, ChevronLeft, Truck } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/cn";
import { PriceDropAlert } from "./PriceDropAlert";
import type { ConfiguredPriceState } from "./ConfigurablePriceSelector";

export type ProductExtrasView = {
  badge?: string;
  minQty?: number;
  maxQty?: number;
  allowBackorder?: boolean;
  leadTimeDays?: number;
  lowStockLeft?: number | null;
  sections: { key: "warranty" | "care" | "certificate"; body: string }[];
};

export type VariantView = { id: string; label: string; price: number; inventory: number };
export type ProductImageView = { url: string; alt?: string };

export function ProductDetail({
  productId,
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
  categorySlug,
  shippingPrice,
  variants,
  images = [],
  colorImageOverride = null,
  configurable = false,
  configuredPrice = null,
  extras,
}: {
  extras?: ProductExtrasView;
  productId: string;
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
  categorySlug?: string;
  shippingPrice?: number;
  variants: VariantView[];
  images?: ProductImageView[];
  // When set (by ConfigurablePriceSelector, via ProductPageInteractive),
  // shows this specific photo instead of the thumbnail-selected one — only
  // populated for a color that has a real photo of its own.
  colorImageOverride?: string | null;
  // When true, this product's real price comes entirely from the
  // material/diamond picker below (ConfigurablePriceSelector) — the
  // price/salePrice props above are stale placeholders and must never be
  // shown or sold at. Exactly one price is ever displayed: this one.
  configurable?: boolean;
  configuredPrice?: ConfiguredPriceState | null;
}) {
  const t = useTranslations("Product");
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(slug));
  const mounted = useMounted();
  const [variantId, setVariantId] = useState<string | "">(variants.length ? "" : "default");
  const minQty = extras?.minQty ?? 1;
  const [quantity, setQuantity] = useState(minQty);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId),
    [variants, variantId]
  );

  const displayPrice = selectedVariant ? selectedVariant.price : salePrice ?? price;
  const availableInventory = selectedVariant ? selectedVariant.inventory : inventory;
  const backorder = !!extras?.allowBackorder;
  const maxQty = Math.min(extras?.maxQty ?? Infinity, backorder ? Infinity : availableInventory);
  const configuredOk = configuredPrice?.status === "ok" ? configuredPrice : null;
  const canAdd =
    (variants.length === 0 || !!selectedVariant) &&
    (availableInventory > 0 || backorder) &&
    quantity >= minQty &&
    (!configurable || configuredOk != null);

  function currentLine() {
    return {
      key: configurable
        ? `${slug}:${configuredOk?.materialOptionId ?? "pending"}:${(configuredOk?.diamondOptionIds ?? []).join(",")}:${
            configuredOk?.calculatorDiamondSpec
              ? JSON.stringify(configuredOk.calculatorDiamondSpec)
              : ""
          }`
        : `${slug}:${variantId || "default"}`,
      productId: slug,
      // `variantId` state doubles as a "default" sentinel for products with
      // no real variants — never forward that literal string as a real
      // variant id (it doesn't exist in the DB and fails the order's FK).
      variantId: selectedVariant?.id,
      slug,
      name,
      variantLabel: selectedVariant?.label,
      // For a CONFIGURABLE product, the displayed/charged price is always
      // the live one from the material/diamond picker — never the stale
      // basePrice/salePrice props. materialOptionId/diamondOptionIds ride
      // along so checkout can recompute and verify this same price
      // server-side (see resolveConfiguredPrice) rather than trusting it.
      price: configurable ? (configuredOk?.sellingPrice ?? 0) : displayPrice,
      materialOptionId: configurable ? configuredOk?.materialOptionId : undefined,
      diamondOptionIds: configurable ? configuredOk?.diamondOptionIds : undefined,
      calculatorDiamondSpec: configurable ? configuredOk?.calculatorDiamondSpec : undefined,
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
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
      <nav aria-label={t("breadcrumb")} className="mb-4 flex items-center gap-1.5 text-xs text-ink/50">
        <Link href="/" className="-my-2 py-2 hover:text-ink">
          {t("breadcrumbHome")}
        </Link>
        {categoryName && (
          <>
            <ChevronLeft size={12} className="rtl:rotate-180" />
            <Link href={categorySlug ? `/category/${categorySlug}` : "/category/all"} className="-my-2 py-2 hover:text-ink">
              {categoryName}
            </Link>
          </>
        )}
        <ChevronLeft size={12} className="rtl:rotate-180" />
        <span className="truncate text-ink/70">{name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2">
      <div>
        <div className="relative aspect-square placeholder-gradient">
          {colorImageOverride ? (
            <Image
              key={colorImageOverride}
              src={colorImageOverride}
              alt={name}
              fill
              sizes="(min-width: 640px) 40vw, 90vw"
              priority
              className="object-cover"
            />
          ) : (
            images[activeImage] && (
              <Image
                src={images[activeImage].url}
                alt={images[activeImage].alt ?? name}
                fill
                sizes="(min-width: 640px) 40vw, 90vw"
                priority
                className="object-cover"
              />
            )
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
        {extras?.badge && (
          <span className="mb-2 inline-block bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-bright">
            {t(`badge_${extras.badge}`)}
          </span>
        )}
        <p className="text-xs uppercase tracking-wide text-gold-deep">{categoryName}</p>
        <h1 className="mt-1 text-2xl font-semibold uppercase tracking-wide text-ink">{name}</h1>
        <span className="gold-rule-start mt-3 w-8" />
        <div className="mt-3 flex items-center gap-2 text-lg" aria-live="polite">
          {configurable ? (
            <>
              {configuredPrice?.status === "ok" && (
                <>
                  <span className="font-semibold text-ink">{formatIls(configuredPrice.sellingPrice)} ₪</span>
                  <span className="text-xs font-normal text-ink/50">{t("vatIncluded")}</span>
                </>
              )}
              {(configuredPrice == null || configuredPrice.status === "pending") && (
                <span className="text-base font-normal text-ink/50">{t("updatingPrice")}</span>
              )}
              {configuredPrice?.status === "error" && (
                <span className="text-base font-normal text-ink/60">{configuredPrice.message}</span>
              )}
            </>
          ) : salePrice ? (
            <>
              <span className="text-ink/40 line-through">{formatIls(price)} ₪</span>
              <span className="font-semibold text-clay">{formatIls(displayPrice)} ₪</span>
            </>
          ) : (
            <span className="font-semibold text-ink">{formatIls(displayPrice)} ₪</span>
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
                setQuantity(minQty);
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

        {(extras?.lowStockLeft || (backorder && availableInventory <= 0) || extras?.minQty || extras?.maxQty) && (
          <ul className="mt-4 space-y-1 text-xs text-ink/70">
            {extras?.lowStockLeft ? <li className="font-medium text-clay">{t("lowStockLeft", { count: extras.lowStockLeft })}</li> : null}
            {backorder && availableInventory <= 0 ? (
              <li>{extras?.leadTimeDays ? t("backorderNote", { days: extras.leadTimeDays }) : t("backorderNoteNoDays")}</li>
            ) : null}
            {extras?.minQty && extras.minQty > 1 ? <li>{t("minQtyNote", { count: extras.minQty })}</li> : null}
            {extras?.maxQty ? <li>{t("maxQtyNote", { count: extras.maxQty })}</li> : null}
          </ul>
        )}

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center border border-gold-soft">
            <button
              onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
              className="px-3 py-2 text-sm text-ink hover:text-gold-deep"
              aria-label={t("decreaseQty")}
            >
              −
            </button>
            <span className="w-8 text-center text-sm text-ink">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="px-3 py-2 text-sm text-ink hover:text-gold-deep disabled:cursor-not-allowed disabled:text-ink/30"
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

        {shippingPrice != null && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/60">
            <Truck size={14} className="text-gold-deep" />
            {shippingPrice > 0
              ? t("shippingCost", { price: shippingPrice.toFixed(2) })
              : t("freeShipping")}
          </p>
        )}

        <PriceDropAlert productId={productId} />

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

        {extras?.sections.map((sec) => (
          <div key={sec.key} className="mt-6 border-t border-gold-soft pt-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">{t(sec.key)}</h2>
            <p className="whitespace-pre-line text-sm text-ink/70">{sec.body}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
