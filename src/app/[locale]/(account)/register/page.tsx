"use client";

import { useActionState, startTransition } from "react";
import { useTranslations } from "next-intl";
import { GemAccent } from "@/components/gem/GemAccent";
import { Link } from "@/i18n/navigation";
import { registerCustomer, type AuthResult } from "@/server/actions/auth";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

export default function RegisterPage() {
  const t = useTranslations("AuthRegister");
  const [state, action, pending] = useActionState<AuthResult, FormData>(registerCustomer, undefined);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-8 sm:py-16">
     <div className="glass auth-card">
      <GemAccent className="mx-auto w-28" />
      <h1 className="mt-2 mb-2 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state?.error && (
        <p className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">{state.error}</p>
      )}

      <form onSubmit={(e) => {
          // Not a form `action`: React would clear every field (and the consent tick) after a failed submit.
          e.preventDefault();
          startTransition(() => action(new FormData(e.currentTarget)));
        }}>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("name")}</label>
          <input name="name" defaultValue={state?.values?.name} required className="field" />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
          <input
            name="email" defaultValue={state?.values?.email}
            type="email"
            required
            className="field"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("phone")}</label>
          <input name="phone" defaultValue={state?.values?.phone} className="field" />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("password")}</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
          />
        </div>

        <div className="mb-6">
          <ConsentCheckbox id="register-consent" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="buy-main w-full py-3.5 text-sm font-semibold tracking-wide"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {t("haveAccount")}{" "}
        <Link href="/login" className="link-underline inline-block py-2 font-medium text-ink">
          {t("login")}
        </Link>
      </p>
     </div>
    </div>
  );
}
