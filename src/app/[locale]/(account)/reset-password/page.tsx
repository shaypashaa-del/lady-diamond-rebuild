"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset, type RequestResetResult } from "@/server/actions/password-reset";

export default function RequestResetPage() {
  const t = useTranslations("PasswordReset");
  const [state, action, pending] = useActionState<RequestResetResult | undefined, FormData>(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <h1 className="mb-6 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>

      {state && "error" in state && (
        <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      {state && "sent" in state ? (
        <div>
          <p className="mb-4 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t("sent")}</p>
          {state.resetLink && (
            <div className="mb-4 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <p className="mb-1 font-medium">{t("devLinkNote")}</p>
              <Link href={state.resetLink} className="underline" dir="ltr">
                {state.resetLink}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form action={action}>
          <div className="mb-6">
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("email")}</label>
            <input name="email" type="email" required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full border border-neutral-900 bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-500">
        <Link href="/login" className="font-medium text-neutral-900 underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
