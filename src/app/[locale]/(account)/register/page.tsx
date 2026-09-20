"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registerCustomer, type AuthResult } from "@/server/actions/auth";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

export default function RegisterPage() {
  const t = useTranslations("AuthRegister");
  const [state, action, pending] = useActionState<AuthResult, FormData>(registerCustomer, undefined);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <h1 className="mb-6 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>

      {state?.error && (
        <p className="mb-4 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}

      <form action={action}>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("name")}</label>
          <input name="name" required className="w-full border border-gold-soft px-3 py-2 text-sm" />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-gold-soft px-3 py-2 text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("phone")}</label>
          <input name="phone" className="w-full border border-gold-soft px-3 py-2 text-sm" />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("password")}</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-gold-soft px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-6">
          <ConsentCheckbox id="register-consent" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-bright hover:text-ink disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {t("haveAccount")}{" "}
        <Link href="/login" className="link-underline font-medium text-ink">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
