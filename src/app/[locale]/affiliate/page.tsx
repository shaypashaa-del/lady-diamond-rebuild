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
      <p className="mb-10 text-center text-sm text-ink/60">{t("heroCopy")}</p>

      {state?.error && (
        <p className="mb-4 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
      )}

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("name")}</label>
            <input name="name" required className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("email")}</label>
            <input name="email" type="email" required className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("phone")}</label>
            <input name="phone" className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("password")}</label>
            <input name="password" type="password" required minLength={8} className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("website")}</label>
            <input name="website" className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("instagram")}</label>
            <input name="socialInstagram" className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("tiktok")}</label>
            <input name="socialTiktok" className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">{t("facebook")}</label>
            <input name="socialFacebook" className="w-full border border-gold-soft px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">{t("promotionMethod")}</label>
          <textarea name="promotionMethod" rows={3} className="w-full border border-gold-soft px-3 py-2 text-sm" />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        {t("haveAccount")}{" "}
        <Link href="/affiliate/login" className="font-medium text-ink underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
