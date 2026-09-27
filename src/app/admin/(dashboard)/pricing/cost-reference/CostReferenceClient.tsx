"use client";

import { useMemo, useState } from "react";
import { PURITY_FRACTION, USD_TO_ILS_RATE } from "@/lib/pricing/constants";
import type { CalculatorDiamondPriceLike } from "@/lib/pricing/engine";

const inputClass = "w-full border border-neutral-300 px-2 py-2 text-xs";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

const SHAPE_OPTIONS = [
  "ROUND", "OVAL", "EMERALD", "PRINCESS", "PEAR", "MARQUISE", "CUSHION", "RADIANT", "ASSCHER", "HEART",
] as const;
const SHAPE_LABEL: Record<string, string> = {
  ROUND: "עגול", OVAL: "אובלי", EMERALD: "אמרלד", PRINCESS: "פרינסס", PEAR: "אגס",
  MARQUISE: "מרקיז", CUSHION: "כרית", RADIANT: "רדיאנט", ASSCHER: "אשר", HEART: "לב",
};
const COLOR_ORDER = ["D", "E", "F", "G", "H", "I", "J", "K"];
const CLARITY_ORDER = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"];
const ORIGINS = [
  { id: "natural", diamondType: "NATURAL" as const, growthMethod: null, label: "טבעי" },
  { id: "lab_cvd", diamondType: "LAB_GROWN" as const, growthMethod: "CVD" as const, label: "מעבדה (CVD)" },
];

function DiamondCostPanel({ entries }: { entries: CalculatorDiamondPriceLike[] }) {
  const [originId, setOriginId] = useState<(typeof ORIGINS)[number]["id"]>("natural");
  const [shape, setShape] = useState<(typeof SHAPE_OPTIONS)[number]>("ROUND");
  const origin = ORIGINS.find((o) => o.id === originId) ?? ORIGINS[0];

  const rows = useMemo(
    () => entries.filter((e) => e.diamondType === origin.diamondType && (e.growthMethod ?? null) === origin.growthMethod),
    [entries, origin]
  );
  const carats = useMemo(() => [...new Set(rows.map((r) => r.caratWeight))].sort((a, b) => a - b), [rows]);
  const colors = useMemo(
    () => [...new Set(rows.map((r) => r.colorGrade))].sort((a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b)),
    [rows]
  );
  const clarities = useMemo(
    () => [...new Set(rows.map((r) => r.clarityGrade))].sort((a, b) => CLARITY_ORDER.indexOf(a) - CLARITY_ORDER.indexOf(b)),
    [rows]
  );

  const [carat, setCarat] = useState<number | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [clarity, setClarity] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);
  if (originId !== lastKey) {
    setLastKey(originId);
    setCarat(carats.includes(1) ? 1 : (carats[0] ?? null));
    setColor(colors[0] ?? null);
    setClarity(clarities[0] ?? null);
  }

  const match = rows.find(
    (r) => r.shape === shape && r.caratWeight === carat && r.colorGrade === color && r.clarityGrade === clarity
  );
  const costUsd = match ? match.costPerCaratUsd * match.caratWeight : null;
  const costIls = costUsd != null ? costUsd * USD_TO_ILS_RATE : null;

  return (
    <div className="max-w-2xl border border-neutral-200 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">עלות יהלום</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="מקור">
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value as (typeof ORIGINS)[number]["id"])}
            className={inputClass}
          >
            {ORIGINS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="קראט">
          <select value={carat ?? ""} onChange={(e) => setCarat(Number(e.target.value))} className={inputClass}>
            {carats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="צורה">
          <select value={shape} onChange={(e) => setShape(e.target.value as (typeof SHAPE_OPTIONS)[number])} className={inputClass}>
            {SHAPE_OPTIONS.map((s) => (
              <option key={s} value={s}>{SHAPE_LABEL[s]}</option>
            ))}
          </select>
        </Field>
        <Field label="צבע">
          <select value={color ?? ""} onChange={(e) => setColor(e.target.value)} className={inputClass}>
            {colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="ניקיון">
          <select value={clarity ?? ""} onChange={(e) => setClarity(e.target.value)} className={inputClass}>
            {clarities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-4 text-sm">
        {match ? (
          <div className="space-y-1">
            <p>עלות $/קראט: <span dir="ltr">{match.costPerCaratUsd.toLocaleString("en-US")}</span></p>
            <p>עלות כוללת $: <span dir="ltr">{costUsd!.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span></p>
            <p className="text-base font-semibold">עלות כוללת ₪: <span dir="ltr">{costIls!.toLocaleString("he-IL", { maximumFractionDigits: 0 })}</span></p>
          </div>
        ) : (
          <p className="text-neutral-400">אין נתון לשילוב הזה.</p>
        )}
      </div>
    </div>
  );
}

const GOLD_KARATS = [24, 22, 18, 14, 9] as const;

function GoldCostPanel({ pricePerGram24k }: { pricePerGram24k: number | null }) {
  const [grams, setGrams] = useState(5);
  const [karat, setKarat] = useState<number>(14);

  const costIls = useMemo(() => {
    if (pricePerGram24k == null) return null;
    const purity = PURITY_FRACTION[`K${karat}`] ?? karat / 24;
    return grams * purity * pricePerGram24k;
  }, [grams, karat, pricePerGram24k]);

  return (
    <div className="max-w-2xl border border-neutral-200 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">עלות זהב</h2>
      {pricePerGram24k == null && (
        <p className="mb-3 text-xs text-rose-600">אין מחיר זהב חי זמין כרגע — בדוק את עמוד &quot;מחירי מתכות&quot;.</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="משקל (גרם)">
          <input
            type="number"
            min={0}
            step={0.1}
            value={grams}
            onChange={(e) => setGrams(Math.max(0, Number(e.target.value) || 0))}
            className={inputClass}
          />
        </Field>
        <Field label="טוהר">
          <select value={karat} onChange={(e) => setKarat(Number(e.target.value))} className={inputClass}>
            {GOLD_KARATS.map((k) => (
              <option key={k} value={k}>{k}K</option>
            ))}
          </select>
        </Field>
        <Field label="מחיר 24K לגרם (₪)">
          <input value={pricePerGram24k?.toFixed(2) ?? "—"} disabled className={inputClass} dir="ltr" />
        </Field>
      </div>
      <div className="mt-4 border-t border-neutral-200 pt-4 text-sm">
        {costIls != null ? (
          <p className="text-base font-semibold">עלות ₪: <span dir="ltr">{costIls.toLocaleString("he-IL", { maximumFractionDigits: 2 })}</span></p>
        ) : (
          <p className="text-neutral-400">אין נתון.</p>
        )}
      </div>
    </div>
  );
}

export function CostReferenceClient({
  calculatorDiamondPrices,
  goldPricePerGram24k,
}: {
  calculatorDiamondPrices: CalculatorDiamondPriceLike[];
  goldPricePerGram24k: number | null;
}) {
  return (
    <div className="space-y-6">
      <DiamondCostPanel entries={calculatorDiamondPrices} />
      <GoldCostPanel pricePerGram24k={goldPricePerGram24k} />
    </div>
  );
}
