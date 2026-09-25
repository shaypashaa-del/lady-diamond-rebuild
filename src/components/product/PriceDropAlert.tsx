"use client";

import { useState, useTransition } from "react";
import { BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import { subscribeToPriceDrop } from "@/server/actions/price-drop";

export function PriceDropAlert({ productId }: { productId: string }) {
  const t = useTranslations("Product");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await subscribeToPriceDrop(productId, email);
      setResult(res.ok ? { ok: true } : { ok: false, message: res.message });
    });
  }

  if (result?.ok) {
    return <p className="mt-3 text-xs text-ink/60">{t("priceDropSubscribed")}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-1.5 text-xs text-ink/60 underline decoration-gold-soft underline-offset-4 hover:text-ink"
      >
        <BellRing size={14} className="text-gold-deep" />
        {t("priceDropCta")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-start gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("priceDropEmailPlaceholder")}
        className="min-w-0 flex-1 border border-gold-soft bg-paper px-3 py-1.5 text-xs text-ink focus:border-gold-bright focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="whitespace-nowrap border border-gold-bright px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-gold-bright disabled:opacity-50"
      >
        {isPending ? "…" : t("priceDropSubmit")}
      </button>
      {result && !result.ok && <p className="w-full text-xs text-clay">{result.message}</p>}
    </form>
  );
}
