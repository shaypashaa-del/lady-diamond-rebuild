"use client";

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
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <h1 className="mb-6 text-center text-xl font-semibold uppercase tracking-wide">
        {t("newPasswordTitle")}
      </h1>

      {state?.error && (
        <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      <form action={formAction}>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-neutral-500">{t("newPassword")}</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full border border-neutral-900 bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? t("saving") : t("saveSubmit")}
        </button>
      </form>
    </div>
  );
}
