"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginAffiliate } from "@/server/actions/affiliate";
import type { AuthResult } from "@/server/actions/auth";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.5" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.5" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

const inputClass = "w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none";

export default function AffiliateLoginPage() {
  const t = useTranslations("Affiliate");
  const tLogin = useTranslations("AuthLogin");
  const [state, action, pending] = useActionState<AuthResult, FormData>(loginAffiliate, undefined);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <DiamondMark className="mx-auto h-8 w-8 text-gold-bright" />
      <h1 className="mt-4 mb-2 text-center text-xl font-semibold uppercase tracking-wide">{t("dashTitle")}</h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state?.error && (
        <p className="mb-4 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}

      <form action={action}>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
          <input name="email" type="email" required className={inputClass} />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("password")}</label>
          <input name="password" type="password" required className={inputClass} />
        </div>
        <Link href="/reset-password" className="mb-6 block text-end text-xs text-ink/50 underline">
          {tLogin("forgot")}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright disabled:opacity-50"
        >
          {pending ? tLogin("submitting") : tLogin("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        <Link href="/affiliate" className="font-medium text-ink underline">
          {t("apply")}
        </Link>
      </p>
    </div>
  );
}
