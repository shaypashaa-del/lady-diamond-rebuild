"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
        <p className="text-sm text-ink/60">{t("empty")}</p>
        <Link
          href="/category/all"
          className="mt-6 inline-block border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright hover:text-ink"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const estimatedTotal = totalPrice + (shipping ?? 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold uppercase tracking-[0.2em] text-ink">{t("title")}</h1>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div className="space-y-6 sm:col-span-2">
          {lines.map((line) => (
            <div key={line.key} className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-gold-soft pb-6">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden placeholder-gradient">
                {line.imageUrl && (
                  <Image src={line.imageUrl} alt={line.name} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div className="min-w-[140px] flex-1">
                <Link href={`/product/${line.slug}`} className="block text-sm font-medium uppercase text-ink">
                  {line.name}
                </Link>
                {line.variantLabel && <p className="text-xs text-ink/50">{line.variantLabel}</p>}
                <p className="mt-1 text-sm text-ink">{line.price.toFixed(2)} ₪</p>
              </div>
              <div className="flex w-full items-center justify-between gap-4 ps-24 sm:w-auto sm:justify-start sm:ps-0">
                <div className="flex items-center border border-gold-soft">
                  <button
                    onClick={() => setQuantity(line.key, line.quantity - 1)}
                    className="px-2 py-1 text-sm text-ink hover:text-gold-deep"
                    aria-label={t("decreaseQty")}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm text-ink">{line.quantity}</span>
                  <button
                    onClick={() => setQuantity(line.key, line.quantity + 1)}
                    className="px-2 py-1 text-sm text-ink hover:text-gold-deep"
                    aria-label={t("increaseQty")}
                  >
                    +
                  </button>
                </div>
                <p className="text-end text-sm font-semibold text-ink sm:w-20">
                  {(line.price * line.quantity).toFixed(2)} ₪
                </p>
                <button
                  onClick={() => removeLine(line.key)}
                  aria-label={t("remove")}
                  className="text-ink/40 transition-colors hover:text-clay"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gold-soft p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink">{t("cartTotals")}</h2>
          <div className="flex justify-between border-t border-gold-soft py-3 text-sm text-ink">
            <span>{t("shipping")}</span>
            <span className="font-medium">
              {shipping == null ? "…" : shipping > 0 ? `${shipping.toFixed(2)} ₪` : t("free")}
            </span>
          </div>
          <div className="flex justify-between border-t border-gold-soft py-3 text-sm font-semibold text-ink">
            <span>{t("estimatedTotal")}</span>
            <span>{estimatedTotal.toFixed(2)} ₪</span>
          </div>
          <Link
            href="/checkout"
            className="mt-4 block w-full border border-gold-bright bg-ink py-3 text-center text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-bright hover:text-ink"
          >
            {t("proceedToCheckout")}
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/checkout?pm=bit"
              className="flex-1 border border-gold-soft py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-gold"
            >
              {t("buyWithBit")}
            </Link>
            <Link
              href="/checkout?pm=paypal"
              className="flex-1 border border-gold-soft py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-gold"
            >
              {t("buyWithPaypal")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
