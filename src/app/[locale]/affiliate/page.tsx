"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { applyAsAffiliate } from "@/server/actions/affiliate";
import type { AuthResult } from "@/server/actions/auth";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";

const DiamondMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.4" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.3" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.25" />
  </svg>
);

const inputClass = "w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

export default function AffiliatePage() {
  const t = useTranslations("Affiliate");
  const [state, action, pending] = useActionState<AuthResult, FormData>(applyAsAffiliate, undefined);

  const benefits = [
    { title: t("benefit1Title"), copy: t("benefit1Copy") },
    { title: t("benefit2Title"), copy: t("benefit2Copy") },
    { title: t("benefit3Title"), copy: t("benefit3Copy") },
  ];

  return (
    <div>
      {/* Same dark jewel-box hero used across the rest of the site. */}
      <div className="relative overflow-hidden bg-ink py-14 text-center sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,170,93,0.16)_0%,transparent_65%)]"
        />
        <DiamondMark className="pointer-events-none absolute -top-14 -end-14 h-56 w-56 text-paper/[0.05]" />
        <DiamondMark className="pointer-events-none absolute -bottom-12 -start-12 h-44 w-44 text-paper/[0.04]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-bright">{t("kicker")}</p>
          <span className="gold-rule mt-4 w-16" />
          <h1 className="mt-4 text-3xl font-semibold uppercase tracking-[0.15em] text-paper sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl px-4 text-sm text-paper/60">{t("heroCopy")}</p>
        </div>
      </div>

      {/* Real value props (10% is the system's actual default commission
          rate — see src/server/services/commission.ts — not a made-up
          number), so the pitch is concrete rather than a bare form. */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-14 text-center sm:grid-cols-3 sm:px-8">
        {benefits.map((b) => (
          <div key={b.title} className="flex flex-col items-center gap-3">
            <DiamondMark className="h-7 w-7 text-gold-bright" />
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink">{b.title}</h3>
            <p className="max-w-[22ch] text-xs leading-6 text-ink/55">{b.copy}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-xl px-4 pb-20 sm:px-8">
        <div className="relative border border-gold-soft p-6 sm:p-10">
          <span aria-hidden="true" className="absolute -top-3 -start-3 h-10 w-10 border-t-2 border-s-2 border-gold-bright" />
          <span aria-hidden="true" className="absolute -bottom-3 -end-3 h-10 w-10 border-b-2 border-e-2 border-gold-bright" />

          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep">
            {t("formTitle")}
          </h2>
          <span className="gold-rule mx-auto mt-3" />

          {state?.error && (
            <p className="mt-6 border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{state.error}</p>
          )}

          <form action={action} className="mt-8 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{t("name")}</label>
                <input name="name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("email")}</label>
                <input name="email" type="email" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("phone")}</label>
                <input name="phone" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("password")}</label>
                <input name="password" type="password" required minLength={8} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("website")}</label>
                <input name="website" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("instagram")}</label>
                <input name="socialInstagram" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("tiktok")}</label>
                <input name="socialTiktok" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("facebook")}</label>
                <input name="socialFacebook" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("promotionMethod")}</label>
              <textarea name="promotionMethod" rows={3} className={inputClass} />
            </div>

            <ConsentCheckbox id="affiliate-consent" />

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
            <Link href="/affiliate/login" className="link-underline font-medium text-ink">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
