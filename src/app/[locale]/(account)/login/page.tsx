"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginCustomer, type AuthResult } from "@/server/actions/auth";

export default function LoginPage() {
  const t = useTranslations("AuthLogin");
  const [state, action, pending] = useActionState<AuthResult, FormData>(loginCustomer, undefined);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-8">
      <h1 className="mb-6 text-center text-xl font-semibold uppercase tracking-wide">{t("title")}</h1>

      {state?.error && (
        <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      <form action={action}>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-neutral-500">{t("email")}</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mb-2">
          <label className="mb-1 block text-xs font-medium text-neutral-500">{t("password")}</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <Link href="/reset-password" className="mb-6 block text-end text-xs text-neutral-400 underline">
          {t("forgot")}
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="w-full border border-neutral-900 bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-neutral-900 underline">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
