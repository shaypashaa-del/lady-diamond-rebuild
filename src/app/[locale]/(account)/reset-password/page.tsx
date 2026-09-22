"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset, type RequestResetResult } from "@/server/actions/password-reset";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.5" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.5" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.35" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

export default function RequestResetPage() {
  const t = useTranslations("PasswordReset");
  const [state, action, pending] = useActionState<RequestResetResult | undefined, FormData>(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <DiamondMark className="mx-auto h-8 w-8 text-gold-bright" />
      <h1 className="mt-4 mb-2 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state && "error" in state && (
        <p className="mb-4 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}

      {state && "sent" in state ? (
        <div>
          <p className="mb-4 border border-gold-soft bg-paper-soft px-3 py-2 text-sm text-ink">{t("sent")}</p>
          {state.resetLink && (
            <div className="mb-4 border border-gold-soft bg-paper-soft px-3 py-2 text-xs text-ink/70">
              <p className="mb-1 font-medium">{t("devLinkNote")}</p>
              <Link href={state.resetLink} className="link-underline" dir="ltr">
                {state.resetLink}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form action={action}>
          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright disabled:opacity-50"
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
  );
}
