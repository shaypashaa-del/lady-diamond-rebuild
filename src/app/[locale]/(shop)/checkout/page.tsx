"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { createOrder } from "@/server/actions/orders";
import { getMyAddress, type AddressData } from "@/server/actions/address";
import type { PaymentMethodId } from "@/server/payments/types";

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("bank_transfer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);

  useEffect(() => {
    getMyAddress()
      .then(setSavedAddress)
      .finally(() => setAddressLoaded(true));
  }, []);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  if (!mounted || !addressLoaded) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-8">
        <p className="mb-6 text-sm text-neutral-500">{t("emptyCart")}</p>
        <Link href="/category/all" className="border border-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

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
        className="mb-6 text-sm text-neutral-500 underline"
      >
        {t("haveCoupon")}
      </button>
      {showCoupon && (
        <div className="mb-8 flex max-w-sm gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={t("couponCode")}
            className="flex-1 border border-neutral-300 px-3 py-2 text-sm"
            dir="ltr"
          />
        </div>
      )}

      {error && <p className="mb-6 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      <form action={handleSubmit} className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("billingDetails")}</h2>
          <div className="space-y-4">
            <input name="fullName" placeholder={t("fullName")} defaultValue={savedAddress?.fullName} required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder={t("email")} required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="phone" placeholder={t("phone")} defaultValue={savedAddress?.phone} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="country" placeholder={t("country")} required defaultValue={savedAddress?.country ?? "Israel"} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="city" placeholder={t("city")} defaultValue={savedAddress?.city} required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="street" placeholder={t("street")} defaultValue={savedAddress?.street} required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="apartment" placeholder={t("apartment")} defaultValue={savedAddress?.apartment} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <input name="zip" placeholder={t("zip")} defaultValue={savedAddress?.zip} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
            <textarea name="orderNotes" placeholder={t("orderNotes")} rows={3} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("yourOrder")}</h2>
          <div className="border border-neutral-200 p-5">
            {lines.map((l) => (
              <div key={l.key} className="flex justify-between py-2 text-sm">
                <span>{l.name} × {l.quantity}</span>
                <span>{(l.price * l.quantity).toFixed(2)} ₪</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-neutral-200 py-2 text-sm">
              <span>{t("subtotal")}</span>
              <span>{subtotal.toFixed(2)} ₪</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 py-2 text-sm font-semibold">
              <span>{t("total")}</span>
              <span>{subtotal.toFixed(2)} ₪</span>
            </div>
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide">{t("paymentMethod")}</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 border border-neutral-200 p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
              />
              {t("bankTransfer")}
            </label>
            <label className="flex items-center gap-2 border border-neutral-200 p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "cash_on_delivery"}
                onChange={() => setPaymentMethod("cash_on_delivery")}
              />
              {t("cod")}
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full border border-neutral-900 bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? t("placing") : t("placeOrder")}
          </button>
        </div>
      </form>
    </div>
  );
}
