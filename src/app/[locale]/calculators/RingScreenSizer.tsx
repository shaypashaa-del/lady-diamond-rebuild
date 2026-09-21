"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  diameterMmToUsSize,
  diameterMmToIsraeliSize,
  usSizeToDiameterMm,
  MEN_RING_SIZES,
  WOMEN_RING_SIZES,
  STANDARD_CARD_WIDTH_MM,
  STANDARD_CARD_HEIGHT_MM,
} from "@/lib/ring-size";

const CALIBRATION_KEY = "ld-ring-sizer-px-per-mm";

// A screen's real pixel density varies too much (phone vs 4K monitor, OS
// zoom level, browser scaling) to draw an "actual size" circle from a CSS
// pixel count alone. Instead: have the customer resize an on-screen
// rectangle until it matches a real credit/debit card held against the
// screen — a near-universal, precisely standardized object (ISO/IEC 7810
// ID-1, 85.6mm) — which gives a real px-per-mm scale for *this* screen,
// the same technique real-world online ring sizers use.
export function RingScreenSizer() {
  const t = useTranslations("Calculators");
  // Read a previous calibration lazily, in the initializer — this
  // component only ever mounts client-side (from a "use client" page, never
  // rendered during an SSR pass whose markup a client hydration needs to
  // match), so there's no hydration-mismatch risk in reading localStorage
  // here instead of in an effect.
  const [initial] = useState(() => {
    try {
      const saved = localStorage.getItem(CALIBRATION_KEY);
      const pxPerMm = saved ? Number(saved) : 0;
      if (pxPerMm > 0) {
        return { cardWidthPx: Math.round(pxPerMm * STANDARD_CARD_WIDTH_MM), calibrated: true };
      }
    } catch {
      // localStorage unavailable — fall back to the uncalibrated default.
    }
    return { cardWidthPx: 320, calibrated: false };
  });
  const [cardWidthPx, setCardWidthPx] = useState(initial.cardWidthPx);
  const [calibrated, setCalibrated] = useState(initial.calibrated);
  const [diameterMm, setDiameterMm] = useState(17.3);

  const pxPerMm = cardWidthPx / STANDARD_CARD_WIDTH_MM;
  const cardHeightPx = pxPerMm * STANDARD_CARD_HEIGHT_MM;
  const ringDiameterPx = diameterMm * pxPerMm;
  const usSize = diameterMmToUsSize(diameterMm);
  const israeliSize = diameterMmToIsraeliSize(diameterMm);

  function confirmCalibration() {
    setCalibrated(true);
    try {
      localStorage.setItem(CALIBRATION_KEY, String(pxPerMm));
    } catch {
      // Ignore — nothing we can do if storage is blocked.
    }
  }

  return (
    <div className="border border-gold-soft bg-paper-soft p-5 sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{t("screenSizerTitle")}</h3>

      {!calibrated ? (
        <div className="mt-4">
          <p className="text-xs leading-6 text-ink/60">{t("calibrateHelp")}</p>
          <div className="mt-5 flex flex-col items-center">
            <div
              aria-hidden="true"
              className="rounded-md border-2 border-gold-bright bg-paper shadow-sm"
              style={{ width: cardWidthPx, height: cardHeightPx, maxWidth: "100%" }}
            />
            <input
              type="range"
              min={200}
              max={480}
              step={1}
              value={cardWidthPx}
              onChange={(e) => setCardWidthPx(Number(e.target.value))}
              className="mt-5 w-full max-w-xs accent-gold-bright"
              aria-label={t("calibrateSlider")}
            />
          </div>
          <button
            type="button"
            onClick={confirmCalibration}
            className="mt-5 w-full border border-gold-bright bg-ink py-2.5 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-bright hover:text-ink sm:w-auto sm:px-8"
          >
            {t("calibrateConfirm")}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-xs leading-6 text-ink/60">{t("measureHelp")}</p>
          <div className="mt-5 flex flex-col items-center">
            <div
              aria-hidden="true"
              className="rounded-full border-[3px] border-gold-bright"
              style={{ width: ringDiameterPx, height: ringDiameterPx, maxWidth: "100%", maxHeight: 260 }}
            />
            <input
              type="range"
              min={11}
              max={29}
              step={0.1}
              value={diameterMm}
              onChange={(e) => setDiameterMm(Number(e.target.value))}
              className="mt-5 w-full max-w-xs accent-gold-bright"
              aria-label={t("ringSlider")}
            />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gold-soft pt-5 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">{t("diameterLabel")}</p>
              <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
                {diameterMm.toFixed(1)} {t("mm")}
              </p>
              <p className="text-xs text-ink/40" dir="ltr">
                ({(diameterMm / 10).toFixed(2)} {t("cm")})
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">{t("ringSizeIsraeli")}</p>
              <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
                {israeliSize}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">{t("ringSizeUS")}</p>
              <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
                {usSize}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCalibrated(false)}
            className="mx-auto mt-5 block text-xs text-ink/50 underline hover:text-gold-deep"
          >
            {t("recalibrate")}
          </button>
        </div>
      )}
    </div>
  );
}

const DiamondGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.6" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.6" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

// A small, tactile "pick your size" explorer rather than a printed table —
// select a gender range, tap a chip, and see that one size's full detail
// (mm/cm/Israeli/US) in the same panel style as the on-screen sizer above,
// so the two tools read as one coherent piece rather than a tool plus a
// plain data dump underneath it.
export function RingSizeReferenceTables() {
  const t = useTranslations("Calculators");
  const [gender, setGender] = useState<"women" | "men">("women");
  const sizes = gender === "women" ? WOMEN_RING_SIZES : MEN_RING_SIZES;
  const [selected, setSelected] = useState(7);

  const activeSize = sizes.includes(selected) ? selected : sizes[Math.floor(sizes.length / 2)];
  const diameterMm = usSizeToDiameterMm(activeSize);
  const israeliSize = diameterMmToIsraeliSize(diameterMm);

  return (
    <div className="mt-8 border border-gold-soft bg-paper-soft p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{t("referenceSizesTitle")}</h3>
        <DiamondGlyph className="h-5 w-5 shrink-0 text-gold-bright" />
      </div>

      <div className="mt-4 inline-flex border border-gold-soft">
        {(["women", "men"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            className={`px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              gender === g ? "bg-ink text-paper" : "text-ink/60 hover:text-gold-deep"
            }`}
          >
            {g === "women" ? t("womenSizes") : t("menSizes")}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelected(s)}
            aria-pressed={activeSize === s}
            className={`border py-2.5 text-center transition-colors ${
              activeSize === s
                ? "border-gold-bright bg-ink text-paper"
                : "border-gold-soft bg-paper text-ink/70 hover:border-gold-bright hover:text-gold-deep"
            }`}
          >
            <span className="block text-sm font-semibold" dir="ltr">
              {s}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gold-soft pt-5 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{t("diameterLabel")}</p>
          <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
            {diameterMm.toFixed(1)} {t("mm")}
          </p>
          <p className="text-xs text-ink/40" dir="ltr">
            ({(diameterMm / 10).toFixed(2)} {t("cm")})
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{t("ringSizeIsraeli")}</p>
          <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
            {israeliSize}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{t("ringSizeUS")}</p>
          <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
            {activeSize}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink/50">{t("sizesBeyondTableNote")}</p>
    </div>
  );
}
