"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMounted } from "@/lib/use-mounted";
import { getStoredConsent, storeConsent } from "@/lib/cookie-consent";

// Necessary cookies (session, cart, auth) always run — nothing non-essential
// (analytics/marketing scripts) should be loaded until the user accepts here.
export function CookieConsentBanner() {
  const t = useTranslations("Cookies");
  const mounted = useMounted();
  const [dismissed, setDismissed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  if (!mounted || dismissed || getStoredConsent()) return null;

  function acceptAll() {
    storeConsent({ analytics: true, marketing: true });
    setDismissed(true);
  }

  function rejectNonEssential() {
    storeConsent({ analytics: false, marketing: false });
    setDismissed(true);
  }

  function savePreferences() {
    storeConsent({ analytics, marketing });
    setDismissed(true);
  }

  return (
    <div className="cookie-card glass fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-[28px] p-5 sm:inset-x-6 sm:bottom-6 sm:p-6">
      <div>
        <p className="mb-3 text-sm text-ink/70">
          {t("message")}{" "}
          <Link href="/policies/privacy" className="underline hover:text-ink">
            {t("privacyLink")}
          </Link>
        </p>

        {showSettings && (
          <div className="mb-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-ink/50">
              <input type="checkbox" checked disabled /> {t("necessary")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              {t("analytics")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              {t("marketing")}
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={acceptAll} className="border border-gold-bright bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wide text-paper hover:bg-gold-bright">
            {t("acceptAll")}
          </button>
          <button onClick={rejectNonEssential} className="border border-gold-soft px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-paper-soft">
            {t("rejectNonEssential")}
          </button>
          {showSettings ? (
            <button onClick={savePreferences} className="border border-gold-soft px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-paper-soft">
              {t("save")}
            </button>
          ) : (
            <button onClick={() => setShowSettings(true)} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink/60 underline">
              {t("settings")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
