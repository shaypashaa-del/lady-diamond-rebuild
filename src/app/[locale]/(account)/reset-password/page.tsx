"use client";

import { useActionState, startTransition } from "react";
import { useTranslations } from "next-intl";
import { GemAccent } from "@/components/gem/GemAccent";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset, type RequestResetResult } from "@/server/actions/password-reset";

export default function RequestResetPage() {
  const t = useTranslations("PasswordReset");
  const [state, action, pending] = useActionState<RequestResetResult | undefined, FormData>(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-8 sm:py-16">
     <div className="glass auth-card">
      <GemAccent className="mx-auto w-28" />
      <h1 className="mt-2 mb-2 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state && "error" in state && (
        <p className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">{state.error}</p>
      )}

      {state && "sent" in state ? (
        <div>
          <p className="mb-4 rounded-2xl bg-gold-soft/25 ring-1 ring-gold-bright/40 px-4 py-3 text-sm text-ink">{t("sent")}</p>
          {state.resetLink && (
            <div className="mb-4 rounded-2xl bg-gold-soft/25 ring-1 ring-gold-bright/40 px-4 py-3 text-xs text-ink/70">
              <p className="mb-1 font-medium">{t("devLinkNote")}</p>
              <Link href={state.resetLink} className="link-underline" dir="ltr">
                {state.resetLink}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => {
          // Not a form `action`: React would clear every field (and the consent tick) after a failed submit.
          e.preventDefault();
          startTransition(() => action(new FormData(e.currentTarget)));
        }}>
          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
            <input
              name="email"
              type="email"
              required
              className="field"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="buy-main w-full py-3.5 text-sm font-semibold tracking-wide"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink/60">
        <Link href="/login" className="link-underline font-medium text-ink">
          {t("backToLogin")}
        </Link>
      </p>
     </div>
    </div>
  );
}
