"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GemAccent } from "@/components/gem/GemAccent";
import { Link } from "@/i18n/navigation";
import { loginCustomer, type AuthResult } from "@/server/actions/auth";

export default function LoginPage() {
  const t = useTranslations("AuthLogin");
  const [state, action, pending] = useActionState<AuthResult, FormData>(loginCustomer, undefined);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-8 sm:py-16">
     <div className="glass auth-card">
      <GemAccent className="mx-auto w-28" />
      <h1 className="mt-2 mb-2 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state?.error && (
        <p className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">{state.error}</p>
      )}

      <form action={action}>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
          <input
            name="email"
            type="email"
            required
            className="field"
          />
        </div>
        <div className="mb-2">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("password")}</label>
          <input
            name="password"
            type="password"
            required
            className="field"
          />
        </div>
        <Link href="/reset-password" className="link-underline mb-4 block py-2 text-end text-xs text-ink/40">
          {t("forgot")}
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="buy-main w-full py-3.5 text-sm font-semibold tracking-wide"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {t("noAccount")}{" "}
        <Link href="/register" className="link-underline inline-block py-2 font-medium text-ink">
          {t("register")}
        </Link>
      </p>
     </div>
    </div>
  );
}
