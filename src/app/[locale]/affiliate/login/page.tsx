"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GemAccent } from "@/components/gem/GemAccent";
import { Link } from "@/i18n/navigation";
import { loginAffiliate } from "@/server/actions/affiliate";
import type { AuthResult } from "@/server/actions/auth";

const inputClass = "field";

export default function AffiliateLoginPage() {
  const t = useTranslations("Affiliate");
  const tLogin = useTranslations("AuthLogin");
  const [state, action, pending] = useActionState<AuthResult, FormData>(loginAffiliate, undefined);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-8 sm:py-16">
     <div className="glass auth-card">
      <GemAccent className="mx-auto w-28" />
      <h1 className="mt-2 mb-2 text-center text-xl font-semibold uppercase tracking-wide">{t("dashTitle")}</h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state?.error && (
        <p className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">{state.error}</p>
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
        <Link href="/reset-password" className="mb-4 block py-2 text-end text-xs text-ink/50 underline">
          {tLogin("forgot")}
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="buy-main w-full py-3.5 text-sm font-semibold tracking-wide"
        >
          {pending ? tLogin("submitting") : tLogin("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        <Link href="/affiliate" className="inline-block py-2 font-medium text-ink underline">
          {t("apply")}
        </Link>
      </p>
     </div>
    </div>
  );
}
