"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  diameterMmToUsSize,
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
  const size = diameterMmToUsSize(diameterMm);

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
              min={10}
              max={24}
              step={0.1}
              value={diameterMm}
              onChange={(e) => setDiameterMm(Number(e.target.value))}
              className="mt-5 w-full max-w-xs accent-gold-bright"
              aria-label={t("ringSlider")}
            />
          </div>
          <div className="mt-5 flex items-center justify-center gap-8 border-t border-gold-soft pt-5 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">{t("diameterLabel")}</p>
              <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
                {diameterMm.toFixed(1)} {t("mm")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">{t("ringSizeUS")}</p>
              <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
                {size}
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

function RingSizeTable({ title, sizes }: { title: string; sizes: number[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/70">{title}</h4>
      <ul className="divide-y divide-gold-soft border border-gold-soft">
        {sizes.map((s) => (
          <li key={s} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-ink/70" dir="ltr">
              US {s}
            </span>
            <span className="font-medium text-ink" dir="ltr">
              {usSizeToDiameterMm(s).toFixed(1)} mm
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RingSizeReferenceTables() {
  const t = useTranslations("Calculators");
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
      <RingSizeTable title={t("womenSizes")} sizes={WOMEN_RING_SIZES} />
      <RingSizeTable title={t("menSizes")} sizes={MEN_RING_SIZES} />
    </div>
  );
}
