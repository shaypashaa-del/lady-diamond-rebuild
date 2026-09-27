"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { circumferenceMmToUsSize, circumferenceMmToIsraeliSize } from "@/lib/ring-size";
import { RingScreenSizer, RingSizeReferenceTables, DiamondGlyph, LuxuryPanel } from "./RingScreenSizer";
import type { LiveGoldPrice } from "@/server/services/market-prices";
import {
  estimateDiamondRetailPrice,
  estimateCalculatorDiamondPrice,
  type DiamondPriceEntryLike,
  type DiamondBaseCostRangeLike,
  type CalculatorDiamondPriceLike,
} from "@/lib/pricing/engine";
import { PURITY_FRACTION } from "@/lib/pricing/constants";

type Tab = "diamond" | "gold" | "size";

// Retail markup applied on top of the raw material/market cost in the gold
// calculator ONLY (owner's explicit choice, 2026-09-27) — a flat +25%
// markup, not the gross-margin division style used elsewhere in the
// pricing engine (retail = cost / (1 - margin)). Never shown to the
// customer — only the final retail figure ever renders (see
// PriceBreakdown below), same as the diamond calculator.
const GOLD_RETAIL_MARKUP = 0.25;

const GOLD_KARATS = [24, 22, 18, 14, 10, 9] as const;

export function CalculatorsClient({
  liveGoldPrice,
  diamondPriceEntries,
  diamondBaseCostRanges,
  calculatorDiamondPrices,
}: {
  liveGoldPrice: LiveGoldPrice | null;
  diamondPriceEntries: DiamondPriceEntryLike[];
  diamondBaseCostRanges: DiamondBaseCostRangeLike[];
  calculatorDiamondPrices: CalculatorDiamondPriceLike[];
}) {
  const t = useTranslations("Calculators");
  const [tab, setTab] = useState<Tab>("diamond");

  return (
    <div>
      {/* A dark jewel-box band, not a flat cream one — matches the about-us
          hero treatment: a soft gold radial glow behind the title and two
          faint diamond watermarks, rather than a pale, ornament-free strip. */}
      <div className="relative overflow-hidden bg-ink py-16 text-center sm:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,170,93,0.16)_0%,transparent_65%)]"
        />
        <DiamondGlyph className="pointer-events-none absolute -top-16 -end-16 h-64 w-64 text-paper/[0.05]" />
        <DiamondGlyph className="pointer-events-none absolute -bottom-14 -start-14 h-48 w-48 text-paper/[0.04]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-bright">{t("kicker")}</p>
          <span className="gold-rule mt-4 w-16" />
          <h1 className="mt-4 text-3xl font-semibold uppercase tracking-[0.15em] text-paper sm:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl px-4 text-sm text-paper/60">{t("disclaimer")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <div className="mb-10 flex justify-center gap-2">
          {(["diamond", "gold", "size"] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`border px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                tab === key
                  ? "border-gold-bright bg-ink text-paper"
                  : "border-gold-soft text-ink/70 hover:border-gold"
              }`}
            >
              {t(`tab_${key}`)}
            </button>
          ))}
        </div>

        {tab === "diamond" && (
          <DiamondCalculator
            diamondPriceEntries={diamondPriceEntries}
            diamondBaseCostRanges={diamondBaseCostRanges}
            calculatorDiamondPrices={calculatorDiamondPrices}
          />
        )}
        {tab === "gold" && <GoldCalculator liveGoldPrice={liveGoldPrice} />}
        {tab === "size" && <SizeCalculator />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none";

function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-8 border border-gold-bright bg-paper-soft p-6 text-center">
      <p className="text-xs uppercase tracking-wide text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

// Shows only the final estimated price. Deliberately does NOT show the raw
// material/market cost alongside it — showing both lets a customer just
// subtract the two and back out the store's exact margin, which is exactly
// as much a leak as printing the margin percentage directly.
function PriceBreakdown({
  retailLabel,
  retail,
}: {
  retailLabel: string;
  retail: number;
}) {
  return (
    <div className="mt-8 border border-gold-bright bg-paper p-6 text-center">
      <span className="text-xs uppercase tracking-wide text-ink/60">{retailLabel}</span>
      <p className="mt-2 text-2xl font-semibold text-ink" dir="ltr">
        ₪{retail.toLocaleString()}
      </p>
    </div>
  );
}

// UI origin options -> real diamondType + fancyColor pair the pricing
// engine understands. "Natural Brown/Champagne" from the owner's spec is
// modeled as FANCY_COLOR + fancyColor=BROWN_CHAMPAGNE (see
// resolveDiamondCostCategory), not a fourth top-level type.
const ORIGIN_OPTIONS = [
  { id: "natural", diamondType: "NATURAL" as const, fancyColor: null },
  { id: "lab_cvd", diamondType: "LAB_GROWN" as const, fancyColor: null, growthMethod: "CVD" as const },
  { id: "lab_hpht", diamondType: "LAB_GROWN" as const, fancyColor: null, growthMethod: "HPHT" as const },
  { id: "fancy_brown_champagne", diamondType: "FANCY_COLOR" as const, fancyColor: "BROWN_CHAMPAGNE" },
  { id: "fancy_yellow", diamondType: "FANCY_COLOR" as const, fancyColor: "YELLOW" },
  { id: "fancy_orange", diamondType: "FANCY_COLOR" as const, fancyColor: "ORANGE" },
  { id: "fancy_pink", diamondType: "FANCY_COLOR" as const, fancyColor: "PINK" },
  { id: "fancy_green", diamondType: "FANCY_COLOR" as const, fancyColor: "GREEN" },
  { id: "fancy_blue", diamondType: "FANCY_COLOR" as const, fancyColor: "BLUE" },
  { id: "fancy_red", diamondType: "FANCY_COLOR" as const, fancyColor: "RED" },
] as const;

const SHAPE_OPTIONS = [
  "ROUND", "OVAL", "EMERALD", "PRINCESS", "PEAR", "MARQUISE", "CUSHION", "RADIANT", "ASSCHER", "HEART",
] as const;

// Representative single grade per band, only used to populate the
// DiamondSelection so the category fallback (natural white diamonds outside
// any priced carat band) can bucket correctly — the granular price-table
// lookup itself matches on shape/carat only (see DiamondPriceEntry seed
// data), so within a priced band the exact grade chosen here doesn't change
// the result, same as on a real product page.
const COLOR_BAND_GRADE: Record<string, string> = { "D-F": "E", "G-H": "G", "I-J": "I", "K-M": "L" };
const CLARITY_BAND_GRADE: Record<string, string> = { "FL-IF": "IF", VVS: "VVS2", VS: "VS1", SI: "SI1", I: "I1" };
const FANCY_INTENSITY_OPTIONS = ["LIGHT", "FANCY", "INTENSE", "VIVID", "DEEP", "DARK"] as const;

// Sort helper for the exact grade dropdowns below — plain alphabetical
// order would put "VS1"/"VS2" ahead of "VVS1"/"VVS2" incorrectly and mix up
// color letters with clarity codes, so each list is ordered against its own
// real-world best-to-worst scale.
const COLOR_ORDER = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const CLARITY_ORDER = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"];

function DiamondCalculator({
  diamondPriceEntries,
  diamondBaseCostRanges,
  calculatorDiamondPrices,
}: {
  diamondPriceEntries: DiamondPriceEntryLike[];
  diamondBaseCostRanges: DiamondBaseCostRangeLike[];
  calculatorDiamondPrices: CalculatorDiamondPriceLike[];
}) {
  const t = useTranslations("Calculators");
  const [originId, setOriginId] = useState<(typeof ORIGIN_OPTIONS)[number]["id"]>("natural");
  const [shape, setShape] = useState<(typeof SHAPE_OPTIONS)[number]>("ROUND");
  const [color, setColor] = useState("G-H");
  const [clarity, setClarity] = useState("VS");
  const [fancyIntensity, setFancyIntensity] = useState<(typeof FANCY_INTENSITY_OPTIONS)[number]>("FANCY");

  const origin = ORIGIN_OPTIONS.find((o) => o.id === originId) ?? ORIGIN_OPTIONS[0];
  const isFancy = origin.diamondType === "FANCY_COLOR";
  // "natural" and "lab_cvd" are priced from the exact-match spreadsheet data
  // (CalculatorDiamondPrice); "lab_hpht" and every fancy-color origin have no
  // such data and keep using the older band-based estimate/fallback path.
  const usesExactData = origin.diamondType === "NATURAL" || (origin.diamondType === "LAB_GROWN" && origin.growthMethod === "CVD");

  // Only the carat/color/clarity combinations actually present in the
  // source spreadsheet for this origin — picking one always resolves to a
  // real price, never a silent gap.
  const exactOptions = useMemo(() => {
    if (!usesExactData) return null;
    const growthMethod = origin.diamondType === "LAB_GROWN" ? (origin.growthMethod ?? null) : null;
    const rows = calculatorDiamondPrices.filter(
      (e) => e.diamondType === origin.diamondType && (e.growthMethod ?? null) === growthMethod
    );
    const carats = [...new Set(rows.map((r) => r.caratWeight))].sort((a, b) => a - b);
    const colors = [...new Set(rows.map((r) => r.colorGrade))].sort(
      (a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b)
    );
    const clarities = [...new Set(rows.map((r) => r.clarityGrade))].sort(
      (a, b) => CLARITY_ORDER.indexOf(a) - CLARITY_ORDER.indexOf(b)
    );
    return { carats, colors, clarities };
  }, [usesExactData, origin, calculatorDiamondPrices]);

  const [exactCarat, setExactCarat] = useState<number | null>(null);
  const [exactColor, setExactColor] = useState<string | null>(null);
  const [exactClarity, setExactClarity] = useState<string | null>(null);

  // Whenever the origin changes to/from the exact-data path, snap the
  // carat/color/clarity selection to a value that's actually valid for it —
  // switching from CVD (D-H) to natural (D-K) with "H" still selected would
  // otherwise silently carry over a stale value that happens to still work,
  // masking the fact the lists differ.
  const exactKey = exactOptions ? `${origin.id}` : null;
  const [lastExactKey, setLastExactKey] = useState<string | null>(null);
  if (exactOptions && exactKey !== lastExactKey) {
    setLastExactKey(exactKey);
    setExactCarat(exactOptions.carats.includes(1) ? 1 : (exactOptions.carats[0] ?? null));
    setExactColor(exactOptions.colors[0] ?? null);
    setExactClarity(exactOptions.clarities[0] ?? null);
  }

  const estimate = useMemo(() => {
    if (usesExactData) {
      if (exactCarat == null || exactColor == null || exactClarity == null) {
        return { ok: false as const, detail: "" };
      }
      return estimateCalculatorDiamondPrice(
        {
          diamondType: origin.diamondType as "NATURAL" | "LAB_GROWN",
          growthMethod: origin.diamondType === "LAB_GROWN" ? (origin.growthMethod ?? null) : null,
          shape,
          caratWeight: exactCarat,
          colorGrade: exactColor,
          clarityGrade: exactClarity,
        },
        calculatorDiamondPrices
      );
    }
    return estimateDiamondRetailPrice(
      {
        diamondType: origin.diamondType,
        shape,
        caratWeight: 1,
        colorGrade: isFancy ? null : (COLOR_BAND_GRADE[color] ?? null),
        clarityGrade: isFancy ? null : (CLARITY_BAND_GRADE[clarity] ?? null),
        fancyColor: origin.fancyColor,
        quantity: 1,
      },
      diamondPriceEntries,
      diamondBaseCostRanges
    );
  }, [
    usesExactData,
    origin,
    shape,
    exactCarat,
    exactColor,
    exactClarity,
    color,
    clarity,
    isFancy,
    calculatorDiamondPrices,
    diamondPriceEntries,
    diamondBaseCostRanges,
  ]);

  return (
    <LuxuryPanel>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{t("tab_diamond")}</h3>
        <DiamondGlyph className="h-5 w-5 shrink-0 text-gold-bright" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("origin")}>
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value as (typeof ORIGIN_OPTIONS)[number]["id"])}
            className={inputClass}
          >
            {ORIGIN_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {t(`origin_${o.id}`)}
              </option>
            ))}
          </select>
        </Field>

        {usesExactData && exactOptions ? (
          <Field label={t("caratWeight")}>
            <select
              value={exactCarat ?? ""}
              onChange={(e) => setExactCarat(Number(e.target.value))}
              className={inputClass}
            >
              {exactOptions.carats.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label={t("caratWeight")}>
            <select value="1" disabled className={inputClass}>
              <option value="1">1</option>
            </select>
          </Field>
        )}

        <Field label={t("shape")}>
          <select value={shape} onChange={(e) => setShape(e.target.value as (typeof SHAPE_OPTIONS)[number])} className={inputClass}>
            {SHAPE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`shape_${s.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </Field>

        {usesExactData && exactOptions && (
          <>
            <Field label={t("color")}>
              <select value={exactColor ?? ""} onChange={(e) => setExactColor(e.target.value)} className={inputClass}>
                {exactOptions.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("clarity")}>
              <select value={exactClarity ?? ""} onChange={(e) => setExactClarity(e.target.value)} className={inputClass}>
                {exactOptions.clarities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        {!usesExactData && !isFancy && (
          <>
            <Field label={t("color")}>
              <select value={color} onChange={(e) => setColor(e.target.value)} className={inputClass}>
                {Object.keys(COLOR_BAND_GRADE).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("clarity")}>
              <select value={clarity} onChange={(e) => setClarity(e.target.value)} className={inputClass}>
                {Object.keys(CLARITY_BAND_GRADE).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        {isFancy && (
          <Field label={t("fancyIntensity")}>
            <select
              value={fancyIntensity}
              onChange={(e) => setFancyIntensity(e.target.value as (typeof FANCY_INTENSITY_OPTIONS)[number])}
              className={inputClass}
            >
              {FANCY_INTENSITY_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {t(`fancyIntensity_${i}`)}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="sm:col-span-2">
          {estimate.ok ? (
            <PriceBreakdown retailLabel={t("estimatedPrice")} retail={estimate.retailPrice} />
          ) : (
            <div className="mt-8 border border-clay/30 bg-clay/10 p-6 text-center text-sm text-clay">
              {t("diamondPricingUnavailable")}
            </div>
          )}
          <p className="mt-3 text-center text-xs text-ink/50">{t("diamondNote")}</p>
        </div>
      </div>
    </LuxuryPanel>
  );
}

// Maps the calculator's plain karat number to the same purity keys the real
// pricing engine uses (PURITY_FRACTION in constants.ts) — e.g. 14K = 0.585,
// the hallmark-certified minimum content, not the raw 14/24 fraction. 10K
// isn't a purity the catalog actually sells (see GOLD_PURITIES), so it has
// no entry there; the true 10/24 fraction is used only for that one case.
const KARAT_PURITY_KEY: Record<number, string> = { 24: "K24", 22: "K22", 18: "K18", 14: "K14", 9: "K9" };

function GoldCalculator({ liveGoldPrice }: { liveGoldPrice: LiveGoldPrice | null }) {
  const t = useTranslations("Calculators");
  const [grams, setGrams] = useState(5);
  const [karat, setKarat] = useState<number>(14);
  // Defaults to today's real gold spot price when the live fetch succeeded;
  // falls back to asking the person to enter a current price themselves
  // rather than ever silently showing a made-up or stale number.
  const [pricePerGram24k, setPricePerGram24k] = useState(liveGoldPrice?.pricePerGram24kIls ?? 0);

  const { retail } = useMemo(() => {
    const purityKey = KARAT_PURITY_KEY[karat];
    const purity = purityKey ? PURITY_FRACTION[purityKey] : karat / 24;
    const costValue = Math.round(grams * purity * pricePerGram24k);
    return { cost: costValue, retail: Math.round(costValue * (1 + GOLD_RETAIL_MARKUP)) };
  }, [grams, karat, pricePerGram24k]);

  return (
    <LuxuryPanel>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ink">{t("tab_gold")}</h3>
        <DiamondGlyph className="h-5 w-5 shrink-0 text-gold-bright" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {liveGoldPrice ? (
          <p className="sm:col-span-2 border border-gold-bright bg-paper px-3 py-2 text-center text-xs text-ink/60">
            {t("liveGoldPriceNote", {
              price: liveGoldPrice.pricePerGram24kIls.toFixed(2),
              time: new Date(liveGoldPrice.fetchedAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
            })}
          </p>
        ) : (
          <p className="sm:col-span-2 border border-clay/30 bg-clay/10 px-3 py-2 text-center text-xs text-clay">
            {t("liveGoldPriceUnavailable")}
          </p>
        )}
        <Field label={t("weightGrams")}>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={grams}
            onChange={(e) => setGrams(Math.max(0, Number(e.target.value) || 0))}
            className={inputClass}
          />
        </Field>
        <Field label={t("karat")}>
          <select value={karat} onChange={(e) => setKarat(Number(e.target.value))} className={inputClass}>
            {GOLD_KARATS.map((k) => (
              <option key={k} value={k}>
                {k}K
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("goldPricePerGram")}>
          <input
            type="number"
            min={1}
            step={1}
            value={pricePerGram24k}
            onChange={(e) => setPricePerGram24k(Math.max(0, Number(e.target.value) || 0))}
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <PriceBreakdown retailLabel={t("estimatedValue")} retail={retail} />
          <p className="mt-3 text-center text-xs text-ink/50">{t("goldNote")}</p>
        </div>
      </div>
    </LuxuryPanel>
  );
}

const FIT_ADDITION: Record<"snug" | "comfortable" | "loose", number> = {
  snug: 1,
  comfortable: 1.75,
  loose: 2.5,
};

// A single, self-contained panel — one slider, three fit chips, one live
// result — instead of two plain form fields and a number, so a buyer who
// doesn't know their wrist measurement offhand still has an obvious,
// forgiving way to arrive at a length with confidence.
function BraceletCalculator() {
  const t = useTranslations("Calculators");
  const [wristCm, setWristCm] = useState(16);
  const [fit, setFit] = useState<"snug" | "comfortable" | "loose">("comfortable");

  const braceletLength = (wristCm + FIT_ADDITION[fit]).toFixed(1);

  return (
    <LuxuryPanel>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs leading-6 text-ink/60">{t("wristMeasureHelp")}</p>
        <DiamondGlyph className="h-5 w-5 shrink-0 text-gold-bright" />
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="text-xs text-ink/40" dir="ltr">
          12
        </span>
        <input
          type="range"
          min={12}
          max={22}
          step={0.5}
          value={wristCm}
          onChange={(e) => setWristCm(Number(e.target.value))}
          className="w-full max-w-xs accent-gold-bright"
          aria-label={t("wristCircumference")}
        />
        <span className="text-xs text-ink/40" dir="ltr">
          22
        </span>
      </div>
      <p className="mt-2 text-center text-lg font-semibold text-ink" dir="ltr">
        {wristCm.toFixed(1)} {t("cm")}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {(["snug", "comfortable", "loose"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFit(f)}
            aria-pressed={fit === f}
            className={`relative border px-2 py-3 text-center transition-colors ${
              fit === f
                ? "border-gold-bright bg-ink text-paper"
                : "border-gold-soft bg-paper text-ink/70 hover:border-gold-bright hover:text-gold-deep"
            }`}
          >
            {f === "comfortable" && (
              <span className="absolute -top-2.5 start-1/2 -translate-x-1/2 whitespace-nowrap bg-gold-bright px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink rtl:translate-x-1/2">
                {t("recommended")}
              </span>
            )}
            <span className="block text-xs font-semibold uppercase tracking-wide">
              {f === "snug" ? t("fitSnug") : f === "loose" ? t("fitLoose") : t("fitComfortable")}
            </span>
            <span className={`mt-1 block text-[11px] ${fit === f ? "text-paper/70" : "text-ink/50"}`}>
              {t(`fitHelp_${f}`)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-gold-soft pt-5 text-center">
        <p className="text-xs uppercase tracking-wide text-ink/50">{t("recommendedLength")}</p>
        <p className="mt-1 text-2xl font-semibold text-ink" dir="ltr">
          {braceletLength} {t("cm")}
        </p>
      </div>
    </LuxuryPanel>
  );
}

// `drop` is roughly how far the necklace hangs below the neckline (cm) —
// used only to position each style on the proportional scale below, not
// shown directly.
const NECKLACE_LENGTHS = [
  { key: "choker", cm: "35–40", drop: 2 },
  { key: "princess", cm: "45", drop: 7 },
  { key: "matinee", cm: "50–60", drop: 13 },
  { key: "opera", cm: "70–80", drop: 23 },
  { key: "rope", cm: "90+", drop: 32 },
] as const;

// A vertical proportional scale (shortest at the top, near the neck) so a
// buyer can see *where on the body* each style actually falls, rather than
// guessing what "Matinee" or "Opera" means from the name alone.
function NecklaceLengthGuide() {
  const t = useTranslations("Calculators");
  const [selected, setSelected] = useState<(typeof NECKLACE_LENGTHS)[number]["key"]>("princess");
  const active = NECKLACE_LENGTHS.find((n) => n.key === selected) ?? NECKLACE_LENGTHS[1];
  const maxDrop = NECKLACE_LENGTHS[NECKLACE_LENGTHS.length - 1].drop;

  return (
    <LuxuryPanel>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs leading-6 text-ink/60">{t("necklaceHelp")}</p>
        <DiamondGlyph className="h-5 w-5 shrink-0 text-gold-bright" />
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-6 sm:gap-8">
        <div className="relative w-6" style={{ height: 220 }}>
          <span aria-hidden="true" className="absolute inset-y-0 start-1/2 w-px -translate-x-1/2 bg-gold-soft" />
          <span
            aria-hidden="true"
            className="absolute start-1/2 -translate-x-1/2 rounded-full bg-gold-bright"
            style={{ top: 0, width: 10, height: 10 }}
          />
          {NECKLACE_LENGTHS.map((n) => {
            const top = (n.drop / maxDrop) * 190 + 10;
            const isActive = n.key === selected;
            return (
              <button
                key={n.key}
                type="button"
                aria-label={t(`necklace_${n.key}`)}
                aria-pressed={isActive}
                onClick={() => setSelected(n.key)}
                className="absolute start-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all"
                style={{
                  top,
                  width: isActive ? 18 : 12,
                  height: isActive ? 18 : 12,
                  backgroundColor: isActive ? "var(--gold-bright)" : "var(--paper)",
                  border: "2px solid var(--gold-bright)",
                }}
              />
            );
          })}
        </div>

        <div className="space-y-2">
          {NECKLACE_LENGTHS.map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => setSelected(n.key)}
              aria-pressed={selected === n.key}
              className={`flex w-full items-center justify-between border px-4 py-2.5 text-start transition-colors ${
                selected === n.key
                  ? "border-gold-bright bg-ink text-paper"
                  : "border-gold-soft bg-paper text-ink/70 hover:border-gold-bright hover:text-gold-deep"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{t(`necklace_${n.key}`)}</span>
              <span className="text-xs" dir="ltr">
                {n.cm} {t("cm")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-gold-soft pt-5 text-center">
        <p className="text-xs uppercase tracking-wide text-ink/50">{t(`necklace_${active.key}`)}</p>
        <p className="mt-1 text-lg font-semibold text-ink" dir="ltr">
          {active.cm} {t("cm")}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-ink/60">{t(`necklaceDesc_${active.key}`)}</p>
      </div>
    </LuxuryPanel>
  );
}

function SizeCalculator() {
  const t = useTranslations("Calculators");
  const [circumference, setCircumference] = useState(52);

  const ringSizeUS = useMemo(() => circumferenceMmToUsSize(circumference), [circumference]);
  const ringSizeIsraeli = useMemo(() => circumferenceMmToIsraeliSize(circumference), [circumference]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("ringSizeTitle")}</h2>

        <RingScreenSizer />

        <div className="mt-8 border-t border-gold-soft pt-8">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink/70">{t("manualMethodTitle")}</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={t("fingerCircumference")}>
              <input
                type="number"
                min={30}
                max={90}
                step={0.5}
                value={circumference}
                onChange={(e) => setCircumference(Number(e.target.value) || 0)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-ink/40" dir="ltr">
                ({(circumference / 10).toFixed(2)} {t("cm")})
              </p>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ResultBox label={t("ringSizeIsraeli")} value={String(ringSizeIsraeli)} />
              <ResultBox label={t("ringSizeUS")} value={String(ringSizeUS)} />
            </div>
          </div>
          <p className="mt-3 text-xs text-ink/50">{t("ringSizeHelp")}</p>
        </div>

        <RingSizeReferenceTables />
      </div>

      <div className="border-t border-gold-soft pt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("braceletTitle")}</h2>
        <BraceletCalculator />
      </div>

      <div className="border-t border-gold-soft pt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("necklaceTitle")}</h2>
        <NecklaceLengthGuide />
      </div>
    </div>
  );
}
