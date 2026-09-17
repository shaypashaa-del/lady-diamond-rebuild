"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginAffiliate } from "@/server/actions/affiliate";
import type { AuthResult } from "@/server/actions/auth";

export default function AffiliateLoginPage() {
  const t = useTranslations("Affiliate");
  const tLogin = useTranslations("AuthLogin");
  const [state, action, pending] = useActionState<AuthResult, FormData>(loginAffiliate, undefined);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <h1 className="mb-6 text-center text-xl font-semibold uppercase tracking-wide">{t("dashTitle")}</h1>

      {state?.error && (
        <p className="mb-4 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}

      <form action={action}>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
          <input name="email" type="email" required className="w-full border border-gold-soft px-3 py-2 text-sm" />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("password")}</label>
          <input name="password" type="password" required className="w-full border border-gold-soft px-3 py-2 text-sm" />
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
