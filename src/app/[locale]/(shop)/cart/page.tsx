"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { getMyAddress } from "@/server/actions/address";
import { getCheckoutPreview } from "@/server/actions/checkout-preview";

export default function CartPage() {
  const t = useTranslations("Cart");
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const mounted = useMounted();
  const [shipping, setShipping] = useState<number | null>(null);

  useEffect(() => {
    if (!mounted || lines.length === 0) return;
    getMyAddress().then((addr) => {
      getCheckoutPreview(totalPrice, addr?.country ?? "Israel").then((preview) => {
        setShipping(preview.shipping);
      });
    });
  }, [mounted, lines.length, totalPrice]);

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-8">
        <p className="text-sm text-neutral-500">{t("empty")}</p>
        <Link
          href="/category/all"
          className="mt-6 inline-block border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const estimatedTotal = totalPrice + (shipping ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold uppercase tracking-[0.2em]">{t("title")}</h1>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="space-y-6 sm:col-span-2">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-4 border-b border-neutral-200 pb-6">
              <div className="h-20 w-20 flex-shrink-0 placeholder-gradient" />
              <div className="flex-1">
                <Link href={`/product/${line.slug}`} className="text-sm font-medium uppercase">
                  {line.name}
                </Link>
                {line.variantLabel && <p className="text-xs text-neutral-400">{line.variantLabel}</p>}
                <p className="mt-1 text-sm">{line.price.toFixed(2)} ₪</p>
              </div>
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setQuantity(line.key, line.quantity - 1)}
                  className="px-2 py-1 text-sm"
                  aria-label={t("decreaseQty")}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{line.quantity}</span>
                <button
                  onClick={() => setQuantity(line.key, line.quantity + 1)}
                  className="px-2 py-1 text-sm"
                  aria-label={t("increaseQty")}
                >
                  +
                </button>
              </div>
              <p className="w-20 text-end text-sm font-semibold">
                {(line.price * line.quantity).toFixed(2)} ₪
              </p>
              <button
                onClick={() => removeLine(line.key)}
                aria-label={t("remove")}
                className="text-neutral-400 hover:text-neutral-900"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="border border-neutral-200 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("cartTotals")}</h2>
          <div className="flex justify-between border-t border-neutral-200 py-3 text-sm">
            <span>{t("shipping")}</span>
            <span className="font-medium">
              {shipping == null ? "…" : shipping > 0 ? `${shipping.toFixed(2)} ₪` : t("free")}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 py-3 text-sm font-semibold">
            <span>{t("estimatedTotal")}</span>
            <span>{estimatedTotal.toFixed(2)} ₪</span>
          </div>
          <Link
            href="/checkout"
            className="mt-4 block w-full border border-neutral-900 bg-neutral-900 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800"
          >
            {t("proceedToCheckout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
