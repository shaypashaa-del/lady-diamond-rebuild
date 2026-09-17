"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { SampleProduct } from "@/lib/products-data";
import { useCartStore } from "@/lib/cart-store";

export function QuickViewModal({ product, onClose }: { product: SampleProduct; onClose: () => void }) {
  const t = useTranslations("Product");
  const tQuick = useTranslations("QuickView");
  const addLine = useCartStore((s) => s.addLine);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Basic dialog accessibility: move focus into the modal on open, restore
  // it to whatever triggered the modal on close, and let Escape close it —
  // without these a screen reader user gets no indication a dialog opened
  // and has no keyboard way to dismiss it.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function handleAddToCart() {
    addLine(
      { key: `${product.slug}:default`, productId: product.slug, slug: product.slug, name: product.name, price: product.price, imageUrl: product.imageUrl },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative grid w-full max-w-2xl grid-cols-1 gap-6 bg-paper p-6 shadow-xl sm:grid-cols-2"
      >
        <button
          ref={closeButtonRef}
          aria-label={tQuick("close")}
          onClick={onClose}
          className="absolute end-4 top-4 text-ink/50 transition-colors hover:text-gold"
        >
          <X size={20} />
        </button>

        <div className="relative aspect-square placeholder-gradient">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(min-width: 640px) 40vw, 90vw"
              className="object-cover"
            />
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-gold">{product.category}</p>
          <h2 className="mt-1 text-lg font-semibold uppercase tracking-wide text-ink">{product.name}</h2>
          <span className="gold-rule-start mt-2 w-8" />
          <p className="mt-2 font-semibold text-ink">{product.price.toFixed(2)} ₪</p>
          {product.blurb && <p className="mt-3 text-sm text-ink/70">{product.blurb}</p>}

          {product.hasVariants ? (
            <>
              <p className="mt-4 text-xs text-ink/60">{tQuick("hasVariantsNotice")}</p>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="mt-4 block border border-gold-bright py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink"
              >
                {tQuick("viewDetails")}
              </Link>
            </>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center border border-gold-soft">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-sm text-ink hover:text-gold">
                    −
                  </button>
                  <span className="w-8 text-center text-sm text-ink">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-sm text-ink hover:text-gold">
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border border-gold-bright py-2 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink"
                >
                  {added ? "✓" : t("addToCart")}
                </button>
              </div>
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="link-underline mt-4 block text-center text-xs font-semibold uppercase tracking-wide text-ink"
              >
                {tQuick("viewDetails")}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
