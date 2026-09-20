"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Accessibility, X, Plus, Minus, RotateCcw } from "lucide-react";

const STORAGE_KEY = "ld-a11y-settings";
const FONT_STEPS = [100, 112, 124, 136] as const;

type Settings = {
  fontStep: number; // index into FONT_STEPS
  contrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  fontStep: 0,
  contrast: false,
  grayscale: false,
  underlineLinks: false,
  readableFont: false,
  stopAnimations: false,
  bigCursor: false,
};

function applyToDocument(s: Settings) {
  const root = document.documentElement;
  root.style.fontSize = `${FONT_STEPS[s.fontStep]}%`;
  root.classList.toggle("a11y-contrast", s.contrast);
  root.classList.toggle("a11y-grayscale", s.grayscale);
  root.classList.toggle("a11y-underline-links", s.underlineLinks);
  root.classList.toggle("a11y-readable-font", s.readableFont);
  root.classList.toggle("a11y-stop-animations", s.stopAnimations);
  root.classList.toggle("a11y-big-cursor", s.bigCursor);
}

// A real, working accessibility adjustments toolbar — required alongside the
// accessibility statement page under Israel's Equal Rights for Persons with
// Disabilities (Service Accessibility Adjustments) Regulations, 5773-2013,
// and Israeli Standard 5568 (WCAG 2.0 AA). Every toggle here does something
// real to the page (not a decorative checkbox): font scaling, high
// contrast, grayscale, link emphasis, a plain readable font, motion
// disabling, and an enlarged cursor. Settings persist per browser via
// localStorage and are re-applied on every load.
export function AccessibilityWidget() {
  const t = useTranslations("Accessibility");
  const [open, setOpen] = useState(false);
  // Read localStorage lazily, in the initializer rather than an effect —
  // this component's settings-driven UI (the panel below) only ever
  // renders after a user click on `open`, never during the initial
  // render, so there's no SSR/hydration mismatch to guard against here.
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyToDocument(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore — nothing we can do if storage is blocked.
    }
  }, [settings]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("openLabel")}
        aria-expanded={open}
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-gold-soft bg-ink text-paper shadow-[0_6px_20px_-4px_rgba(0,0,0,0.3)] transition-transform hover:scale-105 sm:bottom-5 sm:left-5 sm:h-14 sm:w-14"
      >
        <Accessibility size={26} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t("panelTitle")}
          className="fixed bottom-20 left-4 z-40 w-[calc(100vw-2rem)] max-w-xs border border-gold-soft bg-paper p-4 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] sm:bottom-24 sm:left-5"
        >
          <div className="mb-3 flex items-center justify-between border-b border-gold-soft pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide">{t("panelTitle")}</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="text-ink/60 hover:text-ink">
              <X size={18} />
            </button>
          </div>

          <div className="mb-3 flex items-center justify-between text-sm">
            <span>{t("textSize")}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t("decreaseText")}
                onClick={() => update("fontStep", Math.max(0, settings.fontStep - 1))}
                className="flex h-7 w-7 items-center justify-center border border-gold-soft hover:bg-paper-soft"
              >
                <Minus size={14} />
              </button>
              <button
                type="button"
                aria-label={t("increaseText")}
                onClick={() => update("fontStep", Math.min(FONT_STEPS.length - 1, settings.fontStep + 1))}
                className="flex h-7 w-7 items-center justify-center border border-gold-soft hover:bg-paper-soft"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {(
              [
                ["contrast", "highContrast"],
                ["grayscale", "grayscale"],
                ["underlineLinks", "underlineLinks"],
                ["readableFont", "readableFont"],
                ["stopAnimations", "stopAnimations"],
                ["bigCursor", "bigCursor"],
              ] as const
            ).map(([key, labelKey]) => (
              <li key={key} className="flex items-center justify-between">
                <span>{t(labelKey)}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  aria-label={t(labelKey)}
                  className="h-4 w-4 accent-gold-bright"
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={reset}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-gold-soft py-2 text-xs font-semibold uppercase tracking-wide hover:bg-paper-soft"
          >
            <RotateCcw size={14} />
            {t("reset")}
          </button>

          <Link
            href="/policies/accessibility"
            onClick={() => setOpen(false)}
            className="mt-3 block text-center text-xs text-ink/60 underline hover:text-ink"
          >
            {t("statementLink")}
          </Link>
        </div>
      )}
    </>
  );
}
