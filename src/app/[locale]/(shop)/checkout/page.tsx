"use client";

import { BANK_DETAILS, BUSINESS_PHONE } from "@/lib/site-config";
import { describeOptions } from "@/lib/line-options";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { createOrder } from "@/server/actions/orders";
import { getMyAddress, type AddressData } from "@/server/actions/address";
import { getCheckoutPreview, type CheckoutPreview } from "@/server/actions/checkout-preview";
import type { PaymentMethodId } from "@/server/payments/types";
import { PayPalButton } from "@/components/checkout/PayPalButton";

function ConsentText() {
  const tc = useTranslations("Consent");
  return (
    <span>
      {tc("prefix")}{" "}
      <Link href="/policies/terms" className="underline hover:text-ink" target="_blank">
        {tc("terms")}
      </Link>{" "}
      {tc("and")}{" "}
      <Link href="/policies/privacy" className="underline hover:text-ink" target="_blank">
        {tc("privacy")}
      </Link>
      .
    </span>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const t = useTranslations("Checkout");
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);

  const requestedMethod = searchParams.get("pm");
  const validMethods: PaymentMethodId[] = ["bank_transfer", "cash_on_delivery", "bit", "paybox", "credit_card", "paypal"];
  const initialMethod = validMethods.includes(requestedMethod as PaymentMethodId)
    ? (requestedMethod as PaymentMethodId)
    : "bank_transfer";

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [country, setCountry] = useState("Israel");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(initialMethod);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const showError = (msg: string) => {
    setError(msg);
    // The message sits next to the order button; bring it into view (on phones the
    // customer is at the bottom of a long form and would otherwise see nothing).
    setTimeout(() => errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 50);
  };

  useEffect(() => {
    getMyAddress().then((addr) => {
      setSavedAddress(addr);
      if (addr?.country) setCountry(addr.country);
    }).finally(() => setAddressLoaded(true));
    // The saved address is only a convenience: never leave the customer on a
    // blank page if that lookup is slow.
    const giveUp = setTimeout(() => setAddressLoaded(true), 2500);
    return () => clearTimeout(giveUp);
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

  async function submitOrder(formData: FormData, paymentMeta?: Record<string, string>) {
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
      paymentMeta,
      couponCode: couponCode || undefined,
      orderNotes: String(formData.get("orderNotes") ?? ""),
      lines: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        name: l.name,
        variantLabel: l.variantLabel,
        options: l.options,
        price: l.price,
        quantity: l.quantity,
        materialOptionId: l.materialOptionId,
        diamondOptionIds: l.diamondOptionIds,
        calculatorDiamondSpec: l.calculatorDiamondSpec,
      })),
    });

    setSubmitting(false);

    if ("error" in result) {
      showError(result.error);
      return;
    }

    clear();
    router.push(`/order-confirmation/${result.orderNumber}`);
  }

  async function handleSubmit(formData: FormData) {
    await submitOrder(formData);
  }

  async function handlePaypalApproved(paypalOrderId: string) {
    if (!formRef.current?.reportValidity()) return;
    await submitOrder(new FormData(formRef.current), { paypalOrderId });
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
            className="flex-1 border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
            dir="ltr"
          />
        </div>
      )}
      {preview?.couponError && (
        <p className="mb-6 text-sm text-clay">{t("couponInvalid")}</p>
      )}

      <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("billingDetails")}</h2>
          <div className="space-y-4">
            <input name="fullName" autoComplete="name" placeholder={t("fullName")} aria-label={t("fullName")} defaultValue={savedAddress?.fullName} required className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <input name="email" type="email" inputMode="email" autoComplete="email" placeholder={t("email")} aria-label={t("email")} required className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={t("phone")} aria-label={t("phone")} defaultValue={savedAddress?.phone} required className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <input
              name="country"
              placeholder={t("country")}
              aria-label={t("country")}
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
            />
            <input name="city" autoComplete="address-level2" placeholder={t("city")} aria-label={t("city")} defaultValue={savedAddress?.city} required className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <input name="street" autoComplete="street-address" placeholder={t("street")} aria-label={t("street")} defaultValue={savedAddress?.street} required className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <input name="apartment" placeholder={t("apartment")} aria-label={t("apartment")} defaultValue={savedAddress?.apartment} className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <input name="zip" inputMode="numeric" autoComplete="postal-code" placeholder={t("zip")} aria-label={t("zip")} defaultValue={savedAddress?.zip} className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
            <textarea name="orderNotes" placeholder={t("orderNotes")} aria-label={t("orderNotes")} rows={3} className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none" />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("yourOrder")}</h2>
          <div className="border border-gold-soft p-5">
            {lines.map((l) => (
              <div key={l.key} className="flex justify-between py-2 text-sm">
                <span>{l.name}{l.variantLabel ? ` — ${l.variantLabel}` : ""}{describeOptions(l.options) ? ` (${describeOptions(l.options)})` : ""} × {l.quantity}</span>
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
                checked={paymentMethod === "paybox"}
                onChange={() => setPaymentMethod("paybox")}
              />
              {t("paybox")}
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
            <label className="flex items-center gap-2 border border-gold-soft p-3 text-sm">
              <input
                type="radio"
                name="paymentMethodChoice"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
              />
              PayPal
            </label>
          </div>

          {paymentMethod === "bank_transfer" && (
            <div className="mt-4 border border-gold-bright/60 bg-gold-soft/20 p-4 text-sm text-ink">
              <p className="font-semibold">{t("bankTitle")}</p>
              <p className="mt-2 text-ink/80">{t("bankHint", { amount: total.toFixed(2) })}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-ink/60">{t("bankHolder")}</dt>
                <dd>{BANK_DETAILS.holder}</dd>
                <dt className="text-ink/60">{t("bankName")}</dt>
                <dd>{BANK_DETAILS.bank}</dd>
                <dt className="text-ink/60">{t("bankBranch")}</dt>
                <dd dir="ltr" className="text-end">{BANK_DETAILS.branch}</dd>
                <dt className="text-ink/60">{t("bankAccount")}</dt>
                <dd dir="ltr" className="text-end font-semibold">{BANK_DETAILS.account}</dd>
              </dl>
              <p className="mt-3 text-xs text-ink/60">{t("orderNumberAfterBank")}</p>
            </div>
          )}

          {(paymentMethod === "paybox" || paymentMethod === "bit") && (
            <div className="mt-4 border border-gold-bright/60 bg-gold-soft/20 p-4 text-sm text-ink">
              <p className="font-semibold">{paymentMethod === "paybox" ? t("payboxTitle") : t("bitTitle")}</p>
              <p className="mt-2 text-ink/80">{t("phoneTransferHint", { amount: total.toFixed(2) })}</p>
              <div className="mt-3 flex items-center gap-3">
                <span dir="ltr" className="text-lg font-semibold tracking-wide">{BUSINESS_PHONE}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(BUSINESS_PHONE.replace(/-/g, "")).then(() => setCopied(true)).catch(() => undefined);
                  }}
                  className="border border-gold-bright px-3 py-1.5 text-xs font-semibold hover:bg-gold-bright"
                >
                  {copied ? t("copied") : t("copyNumber")}
                </button>
              </div>
              <p className="mt-3 text-xs text-ink/60">{t("orderNumberAfter")}</p>
            </div>
          )}

          <label className="mt-6 flex items-start gap-2 text-xs text-ink/70">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setError(null);
              }}
              className="mt-0.5 h-4 w-4 accent-gold-bright"
            />
            <ConsentText />
          </label>

          {error && (
            <p ref={errorRef} role="alert" className="mt-4 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">
              {error}
            </p>
          )}

          {paymentMethod === "paypal" ? (
            <div className="mt-4">
              <PayPalButton total={total} disabled={submitting || !agreed} onApproved={handlePaypalApproved} onError={showError} />
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              onClick={(e) => {
                // Not disabled when the terms box is unticked: a silently greyed-out
                // button looks broken. Explain what is missing instead.
                if (!agreed) {
                  e.preventDefault();
                  showError(t("mustAgree"));
                }
              }}
              className="mt-4 w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright disabled:opacity-50"
            >
              {submitting ? t("placing") : t("placeOrder")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
