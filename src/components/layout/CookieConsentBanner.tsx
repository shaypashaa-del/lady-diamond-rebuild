"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-4 shadow-lg sm:p-6">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm text-neutral-600">{t("message")}</p>

        {showSettings && (
          <div className="mb-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-neutral-400">
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
          <button onClick={acceptAll} className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-neutral-800">
            {t("acceptAll")}
          </button>
          <button onClick={rejectNonEssential} className="border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-100">
            {t("rejectNonEssential")}
          </button>
          {showSettings ? (
            <button onClick={savePreferences} className="border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-100">
              {t("save")}
            </button>
          ) : (
            <button onClick={() => setShowSettings(true)} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 underline">
              {t("settings")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
