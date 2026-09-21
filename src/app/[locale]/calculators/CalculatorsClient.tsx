"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { circumferenceMmToUsSize } from "@/lib/ring-size";
import { RingScreenSizer, RingSizeReferenceTables } from "./RingScreenSizer";
import type { LiveGoldPrice } from "@/server/services/market-prices";

type Tab = "diamond" | "gold" | "size";

// Retail margin applied on top of the raw material/market cost in both the
// diamond and gold calculators, per the store's pricing policy.
const RETAIL_MARGIN = 0.2;

// Base price (ILS) per carat for a round, G-color, VS-clarity, 1.00ct diamond —
// a reference midpoint only; real prices vary by exact grading and market
// conditions, so results are explicitly labeled as estimates throughout.
const BASE_PRICE_PER_CARAT = 18000;

const SHAPE_MULTIPLIER: Record<string, number> = {
  round: 1.0,
  princess: 0.85,
  oval: 0.9,
  cushion: 0.82,
  emerald: 0.78,
  pear: 0.83,
  marquise: 0.8,
  radiant: 0.8,
  heart: 0.75,
};

const COLOR_MULTIPLIER: Record<string, number> = {
  "D-F": 1.35,
  "G-H": 1.0,
  "I-J": 0.78,
  "K-M": 0.55,
};

const CLARITY_MULTIPLIER: Record<string, number> = {
  "FL-IF": 1.6,
  VVS: 1.3,
  VS: 1.0,
  SI: 0.72,
  I: 0.42,
};

// Larger stones command a higher price *per carat*, not just linear scaling.
function caratWeightFactor(carat: number): number {
  if (carat < 0.3) return 0.55;
  if (carat < 0.5) return 0.75;
  if (carat < 0.7) return 0.9;
  if (carat < 1.0) return 1.0;
  if (carat < 1.5) return 1.35;
  if (carat < 2.0) return 1.7;
  if (carat < 3.0) return 2.2;
  return 2.8;
}

const GOLD_KARATS = [24, 22, 18, 14, 10, 9] as const;

export function CalculatorsClient({ liveGoldPrice }: { liveGoldPrice: LiveGoldPrice | null }) {
  const t = useTranslations("Calculators");
  const [tab, setTab] = useState<Tab>("diamond");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="mb-2 text-center text-2xl font-semibold uppercase tracking-[0.2em]">{t("pageTitle")}</h1>
      <p className="mx-auto mb-10 max-w-xl text-center text-sm text-ink/60">{t("disclaimer")}</p>

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

      {tab === "diamond" && <DiamondCalculator />}
      {tab === "gold" && <GoldCalculator liveGoldPrice={liveGoldPrice} />}
      {tab === "size" && <SizeCalculator />}
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

const inputClass = "w-full border border-gold-soft px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none";

function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-8 border border-gold-bright bg-paper-soft p-6 text-center">
      <p className="text-xs uppercase tracking-wide text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

// Shows the raw material/market cost alongside the retail price after the
// store's margin — transparent breakdown rather than a single opaque number.
function PriceBreakdown({
  costLabel,
  cost,
  retailLabel,
  retail,
  marginLabel,
}: {
  costLabel: string;
  cost: number;
  retailLabel: string;
  retail: number;
  marginLabel: string;
}) {
  return (
    <div className="mt-8 border border-gold-bright bg-paper-soft p-6">
      <div className="flex items-center justify-between text-sm text-ink/60">
        <span>{costLabel}</span>
        <span dir="ltr">₪{cost.toLocaleString()}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-ink/60">
        <span>{marginLabel}</span>
        <span dir="ltr">+₪{(retail - cost).toLocaleString()}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gold-soft pt-3">
        <span className="text-xs uppercase tracking-wide text-ink/60">{retailLabel}</span>
        <span className="text-2xl font-semibold text-ink" dir="ltr">
          ₪{retail.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function DiamondCalculator() {
  const t = useTranslations("Calculators");
  const [carat, setCarat] = useState(1);
  const [shape, setShape] = useState("round");
  const [color, setColor] = useState("G-H");
  const [clarity, setClarity] = useState("VS");

  const { cost, retail } = useMemo(() => {
    const perCaratBase = BASE_PRICE_PER_CARAT * SHAPE_MULTIPLIER[shape] * COLOR_MULTIPLIER[color] * CLARITY_MULTIPLIER[clarity];
    const perCaratAdjusted = perCaratBase * caratWeightFactor(carat);
    const costValue = Math.round(perCaratAdjusted * carat);
    return { cost: costValue, retail: Math.round(costValue * (1 + RETAIL_MARGIN)) };
  }, [carat, shape, color, clarity]);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Field label={t("caratWeight")}>
        <input
          type="number"
          min={0.05}
          max={10}
          step={0.05}
          value={carat}
          onChange={(e) => setCarat(Math.max(0.05, Number(e.target.value) || 0))}
          className={inputClass}
        />
      </Field>
      <Field label={t("shape")}>
        <select value={shape} onChange={(e) => setShape(e.target.value)} className={inputClass}>
          {Object.keys(SHAPE_MULTIPLIER).map((s) => (
            <option key={s} value={s}>
              {t(`shape_${s}`)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("color")}>
        <select value={color} onChange={(e) => setColor(e.target.value)} className={inputClass}>
          {Object.keys(COLOR_MULTIPLIER).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("clarity")}>
        <select value={clarity} onChange={(e) => setClarity(e.target.value)} className={inputClass}>
          {Object.keys(CLARITY_MULTIPLIER).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <div className="sm:col-span-2">
        <PriceBreakdown
          costLabel={t("marketCost")}
          cost={cost}
          marginLabel={t("retailMargin")}
          retailLabel={t("estimatedPrice")}
          retail={retail}
        />
        <p className="mt-3 text-center text-xs text-ink/50">{t("diamondNote")}</p>
      </div>
    </div>
  );
}

function GoldCalculator({ liveGoldPrice }: { liveGoldPrice: LiveGoldPrice | null }) {
  const t = useTranslations("Calculators");
  const [grams, setGrams] = useState(5);
  const [karat, setKarat] = useState<number>(14);
  // Defaults to today's real gold spot price when the live fetch succeeded;
  // falls back to asking the person to enter a current price themselves
  // rather than ever silently showing a made-up or stale number.
  const [pricePerGram24k, setPricePerGram24k] = useState(liveGoldPrice?.pricePerGram24kIls ?? 0);

  const { cost, retail } = useMemo(() => {
    const costValue = Math.round(grams * (karat / 24) * pricePerGram24k);
    return { cost: costValue, retail: Math.round(costValue * (1 + RETAIL_MARGIN)) };
  }, [grams, karat, pricePerGram24k]);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {liveGoldPrice ? (
        <p className="sm:col-span-2 border border-gold-soft bg-paper-soft px-3 py-2 text-center text-xs text-ink/60">
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
        <PriceBreakdown
          costLabel={t("goldMarketValue")}
          cost={cost}
          marginLabel={t("retailMargin")}
          retailLabel={t("estimatedValue")}
          retail={retail}
        />
        <p className="mt-3 text-center text-xs text-ink/50">{t("goldNote")}</p>
      </div>
    </div>
  );
}

const NECKLACE_LENGTHS = [
  { cm: "35–40", key: "choker" },
  { cm: "45", key: "princess" },
  { cm: "50–60", key: "matinee" },
  { cm: "70–80", key: "opera" },
  { cm: "90+", key: "rope" },
];

function SizeCalculator() {
  const t = useTranslations("Calculators");
  const [circumference, setCircumference] = useState(52);
  const [wrist, setWrist] = useState(16);
  const [fit, setFit] = useState<"snug" | "comfortable" | "loose">("comfortable");

  const ringSizeUS = useMemo(() => circumferenceMmToUsSize(circumference), [circumference]);

  const braceletAddition = fit === "snug" ? 1 : fit === "loose" ? 2.5 : 1.75;
  const braceletLength = (wrist + braceletAddition).toFixed(1);

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
            </Field>
            <div className="flex items-end">
              <ResultBox label={t("ringSizeUS")} value={String(ringSizeUS)} />
            </div>
          </div>
          <p className="mt-3 text-xs text-ink/50">{t("ringSizeHelp")}</p>
        </div>

        <RingSizeReferenceTables />
      </div>

      <div className="border-t border-gold-soft pt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("braceletTitle")}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t("wristCircumference")}>
            <input
              type="number"
              min={10}
              max={25}
              step={0.5}
              value={wrist}
              onChange={(e) => setWrist(Number(e.target.value) || 0)}
              className={inputClass}
            />
          </Field>
          <Field label={t("fitStyle")}>
            <select value={fit} onChange={(e) => setFit(e.target.value as typeof fit)} className={inputClass}>
              <option value="snug">{t("fitSnug")}</option>
              <option value="comfortable">{t("fitComfortable")}</option>
              <option value="loose">{t("fitLoose")}</option>
            </select>
          </Field>
        </div>
        <ResultBox label={t("recommendedLength")} value={`${braceletLength} ${t("cm")}`} />
      </div>

      <div className="border-t border-gold-soft pt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{t("necklaceTitle")}</h2>
        <ul className="divide-y divide-gold-soft border border-gold-soft">
          {NECKLACE_LENGTHS.map((n) => (
            <li key={n.key} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink/70">{t(`necklace_${n.key}`)}</span>
              <span className="font-semibold text-ink" dir="ltr">
                {n.cm} {t("cm")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
