"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const CYCLE_MS = 4500;

// A brand-matched chat button (ink + gold ring, not stock WhatsApp green —
// deliberately restyled to fit the site's palette rather than the raw
// plugin look) that auto-cycles through three faces: Diana's real photo,
// the brand's diamond logo, and the WhatsApp glyph. Plain <img> tags on
// purpose (not next/image) — this icon is tiny (48–60px) and next/image's
// optimizer cache kept serving a stale cropped version of the logo after it
// was regenerated, keyed by URL rather than file content.
export function WhatsappButton() {
  const t = useTranslations("Whatsapp");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 3), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href="https://wa.me/972503781589"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("chatWithUs")}
      className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gold-bright bg-ink shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 sm:bottom-5 sm:right-5 sm:h-[60px] sm:w-[60px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/whatsapp-avatar.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[2200ms] ease-in-out"
        style={{ opacity: step === 0 ? 1 : 0 }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt=""
        className="absolute inset-0 h-full w-full bg-paper object-contain p-1.5 transition-opacity duration-[2200ms] ease-in-out"
        style={{ opacity: step === 1 ? 1 : 0 }}
      />
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="var(--gold-bright)"
        aria-hidden="true"
        className="absolute transition-opacity duration-[2200ms] ease-in-out"
        style={{ opacity: step === 2 ? 1 : 0 }}
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2Zm5.8 14.14c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.28-.12.56.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.37-.23.62-.14.26.1 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  );
}
