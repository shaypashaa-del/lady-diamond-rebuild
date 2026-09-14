"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { applyAsAffiliate } from "@/server/actions/affiliate";
import type { AuthResult } from "@/server/actions/auth";

export default function AffiliatePage() {
  const t = useTranslations("Affiliate");
  const [state, action, pending] = useActionState<AuthResult, FormData>(applyAsAffiliate, undefined);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-8">
      <h1 className="mb-2 text-center text-2xl font-semibold uppercase tracking-[0.15em]">
        {t("heroTitle")}
      </h1>
      <p className="mb-10 text-center text-sm text-neutral-500">{t("heroCopy")}</p>

      {state?.error && (
        <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("name")}</label>
            <input name="name" required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("email")}</label>
            <input name="email" type="email" required className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("phone")}</label>
            <input name="phone" className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("password")}</label>
            <input name="password" type="password" required minLength={8} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("website")}</label>
            <input name="website" className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("instagram")}</label>
            <input name="socialInstagram" className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("tiktok")}</label>
            <input name="socialTiktok" className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">{t("facebook")}</label>
            <input name="socialFacebook" className="w-full border border-neutral-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">{t("promotionMethod")}</label>
          <textarea name="promotionMethod" rows={3} className="w-full border border-neutral-300 px-3 py-2 text-sm" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full border border-neutral-900 bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {t("haveAccount")}{" "}
        <Link href="/affiliate/login" className="font-medium text-neutral-900 underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
