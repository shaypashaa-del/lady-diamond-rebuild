"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Renders PayPal's own Buttons SDK — this is real, working PayPal Checkout,
// not a placeholder. It defaults to PayPal's public sandbox test client id
// ("sb" via NEXT_PUBLIC_PAYPAL_CLIENT_ID) so it works immediately with no
// account setup; swap in a real Client ID (and PAYPAL_CLIENT_SECRET on the
// server) to go live — see .env.example.
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: Record<string, unknown>) => { render: (el: HTMLElement) => void };
    };
  }
}

let sdkLoadPromise: Promise<void> | null = null;

function loadPaypalSdk(clientId: string, currency: string) {
  if (sdkLoadPromise) return sdkLoadPromise;
  sdkLoadPromise = new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

export function PayPalButton({
  total,
  disabled,
  onApproved,
  onError,
}: {
  total: number;
  disabled?: boolean;
  onApproved: (paypalOrderId: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Checkout");

  useEffect(() => {
    let cancelled = false;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

    loadPaypalSdk(clientId, "ILS")
      .then(() => {
        if (cancelled || !containerRef.current || !window.paypal) return;
        containerRef.current.innerHTML = "";
        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", label: "paypal" },
            createOrder: (_: unknown, actions: { order: { create: (o: object) => Promise<string> } }) =>
              actions.order.create({
                purchase_units: [{ amount: { value: total.toFixed(2), currency_code: "ILS" } }],
              }),
            onApprove: async (_: unknown, actions: { order: { capture: () => Promise<{ id: string }> } }) => {
              try {
                const captured = await actions.order.capture();
                onApproved(captured.id);
              } catch {
                onError(t("paypalCaptureFailed"));
              }
            },
            onError: () => onError(t("paypalError")),
          })
          .render(containerRef.current);
        setLoading(false);
      })
      .catch(() => onError(t("paypalLoadFailed")));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return (
    <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
      {loading && <p className="mb-2 text-xs text-ink/50">{t("paypalLoading")}</p>}
      <div ref={containerRef} />
    </div>
  );
}
