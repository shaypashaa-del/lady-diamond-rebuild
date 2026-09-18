"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { createOrder } from "@/server/actions/orders";
import { getMyAddress, type AddressData } from "@/server/actions/address";
import { getCheckoutPreview, type CheckoutPreview } from "@/server/actions/checkout-preview";
import type { PaymentMethodId } from "@/server/payments/types";

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [country, setCountry] = useState("Israel");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("bank_transfer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);

  useEffect(() => {
    getMyAddress().then((addr) => {
      setSavedAddress(addr);
      if (addr?.country) setCountry(addr.country);
    }).finally(() => setAddressLoaded(true));
  }, []);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  // Live pricing preview — recomputed server-side whenever country or
  // coupon changes, so the displayed total always matches what createOrder
  // will actually charge (shipping cost previously wasn't shown at all here).
  useEffect(() => {
    if (!addressLoaded || lines.length === 0) return;
    const handle = setTimeout(() => {
      getCheckoutPreview(subtotal, country, couponCode || undefined).then(setPreview);
    }, 300);
    return () => clearTimeout(handle);
  }, [subtotal, country, couponCode, addressLoaded, lines.length]);

  if (!mounted || !addressLoaded) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-8">
        <p className="mb-6 text-sm text-ink/60">{t("emptyCart")}</p>
        <Link href="/category/all" className="border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-gold-bright hover:text-ink">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  const shippingCost = preview?.shipping ?? 0;
  const discount = preview?.discount ?? 0;
  const total = preview ? preview.total : subtotal;

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);

    const result = await createOrder({
      email: String(formData.get("email")),
      billingAddress: {
        fullName: String(formData.get("fullName")),
        phone: String(formData.get("phone")),
        country: String(formData.get("country")),
        city: String(formData.get("city")),
        street: String(formData.get("street")),
        apartment: String(formData.get("apartment") ?? ""),
        zip: String(formData.get("zip") ?? ""),
      },
      paymentMethod,
      couponCode: couponCode || undefined,
      orderNotes: String(formData.get("orderNotes") ?? ""),
      lines: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        name: l.name,
        variantLabel: l.variantLabel,
        price: l.price,
        quantity: l.quantity,
      })),
    });

    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    clear();
    router.push(`/order-confirmation/${result.orderNumber}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold uppercase tracking-[0.2em]">{t("title")}</h1>

      <button
        type="button"
        onClick={() => setShowCoupon((v) => !v)}
        className="mb-6 text-sm text-ink/60 underline"
      >
        {t("haveCoupon")}
      </button>
      {showCoupon && (
        <div className="mb-2 flex max-w-sm gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={t("couponCode")}
            aria-label={t("couponCode")}
            className="flex-1 border border-gold-soft px-3 py-2 text-sm"
            dir="ltr"
          />
        </div>
      )}
      {preview?.couponError && (
        <p className="mb-6 text-sm text-clay">{t("couponInvalid")}</p>
      )}

      {error && <p className="mb-6 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}

      <form action={handleSubmit} className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("billingDetails")}</h2>
          <div className="space-y-4">
            <input name="fullName" placeholder={t("fullName")} aria-label={t("fullName")} defaultValue={savedAddress?.fullName} required className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder={t("email")} aria-label={t("email")} required className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <input name="phone" placeholder={t("phone")} aria-label={t("phone")} defaultValue={savedAddress?.phone} className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <input
              name="country"
              placeholder={t("country")}
              aria-label={t("country")}
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gold-soft px-3 py-2 text-sm"
            />
            <input name="city" placeholder={t("city")} aria-label={t("city")} defaultValue={savedAddress?.city} required className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <input name="street" placeholder={t("street")} aria-label={t("street")} defaultValue={savedAddress?.street} required className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <input name="apartment" placeholder={t("apartment")} aria-label={t("apartment")} defaultValue={savedAddress?.apartment} className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <input name="zip" placeholder={t("zip")} aria-label={t("zip")} defaultValue={savedAddress?.zip} className="w-full border border-gold-soft px-3 py-2 text-sm" />
            <textarea name="orderNotes" placeholder={t("orderNotes")} aria-label={t("orderNotes")} rows={3} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("yourOrder")}</h2>
          <div className="border border-gold-soft p-5">
            {lines.map((l) => (
              <div key={l.key} className="flex justify-between py-2 text-sm">
                <span>{l.name}{l.variantLabel ? ` — ${l.variantLabel}` : ""} × {l.quantity}</span>
                <span>{(l.price * l.quantity).toFixed(2)} ₪</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gold-soft py-2 text-sm">
              <span>{t("subtotal")}</span>
              <span>{subtotal.toFixed(2)} ₪</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-2 text-sm text-clay">
                <span>{t("discount")}</span>
                <span>-{discount.toFixed(2)} ₪</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm">
              <span>{t("shipping")}</span>
              <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} ₪` : t("free")}</span>
            </div>
            <div className="flex justify-between border-t border-gold-soft py-2 text-sm font-semibold">
              <span>{t("total")}</span>
              <span>{total.toFixed(2)} ₪</span>
            </div>
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide">{t("paymentMethod")}</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 border border-gold-soft p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
              />
              {t("bankTransfer")}
            </label>
            <label className="flex items-center gap-2 border border-gold-soft p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "cash_on_delivery"}
                onChange={() => setPaymentMethod("cash_on_delivery")}
              />
              {t("cod")}
            </label>
            <label className="flex items-center gap-2 border border-gold-soft p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "bit"}
                onChange={() => setPaymentMethod("bit")}
              />
              {t("bit")}
            </label>
            <label className="flex items-center gap-2 border border-gold-soft p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "credit_card"}
                onChange={() => setPaymentMethod("credit_card")}
              />
              {t("creditCard")}
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright disabled:opacity-50"
          >
            {submitting ? t("placing") : t("placeOrder")}
          </button>
        </div>
      </form>
    </div>
  );
}
