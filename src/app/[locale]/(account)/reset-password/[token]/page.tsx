"use client";

import { GemAccent } from "@/components/gem/GemAccent";
import { use } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPassword, type ResetPasswordResult } from "@/server/actions/password-reset";

export default function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const t = useTranslations("PasswordReset");
  const action = resetPassword.bind(null, token);
  const [state, formAction, pending] = useActionState<ResetPasswordResult, FormData>(action, undefined);

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-8 sm:py-16">
     <div className="glass auth-card">
      <GemAccent className="mx-auto w-28" />
      <h1 className="mt-2 mb-2 text-center text-xl font-semibold uppercase tracking-wide">
        {t("newPasswordTitle")}
      </h1>
      <span className="gold-rule mx-auto mb-6 w-12" />

      {state?.error && (
        <p className="mb-4 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">{state.error}</p>
      )}

      <form action={formAction}>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("newPassword")}</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="buy-main w-full py-3.5 text-sm font-semibold tracking-wide"
        >
          {pending ? t("saving") : t("saveSubmit")}
        </button>
      </form>
     </div>
    </div>
  );
}
