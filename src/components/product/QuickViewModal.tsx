"use client";

import { useState } from "react";
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

  function handleAddToCart() {
    addLine(
      { key: `${product.slug}:default`, productId: product.slug, slug: product.slug, name: product.name, price: product.price },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative grid w-full max-w-2xl grid-cols-1 gap-6 bg-white p-6 shadow-xl sm:grid-cols-2">
        <button
          aria-label={tQuick("close")}
          onClick={onClose}
          className="absolute end-4 top-4 text-neutral-500 hover:text-neutral-900"
        >
          <X size={20} />
        </button>

        <div className="relative aspect-square bg-neutral-100">
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
          <p className="text-xs uppercase tracking-wide text-neutral-400">{product.category}</p>
          <h2 className="mt-1 text-lg font-semibold uppercase tracking-wide">{product.name}</h2>
          <p className="mt-2 font-semibold">{product.price.toFixed(2)} ₪</p>
          {product.blurb && <p className="mt-3 text-sm text-neutral-500">{product.blurb}</p>}

          {!product.hasVariants && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center border border-neutral-300">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-sm">
                  −
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-sm">
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 border border-neutral-900 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
              >
                {added ? "✓" : t("addToCart")}
              </button>
            </div>
          )}

          <Link
            href={`/product/${product.slug}`}
            onClick={onClose}
            className="mt-4 block text-center text-xs font-semibold uppercase tracking-wide underline underline-offset-4"
          >
            {tQuick("viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
