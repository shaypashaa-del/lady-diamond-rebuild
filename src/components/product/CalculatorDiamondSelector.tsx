"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { CalculatorDiamondOption, CalculatorDiamondChoice } from "@/lib/pricing/engine";

// "natural"/"lab_cvd" have real exact-match pricelist data (see
// estimateCalculatorDiamondPrice / CalculatorDiamondPrice) — the same
// restriction the public diamond calculator applies, never offer an origin
// that would only ever resolve to "no data". "none" is a first-class third
// option, not an afterthought: this product has no ProductDiamondOption
// rows of its own, which for a plain metal piece (a band, a chain) is
// simply correct, not missing data — see resolveConfiguredPrice.
const DIAMOND_ORIGINS = [
  { id: "natural" as const, diamondType: "NATURAL" as const, growthMethod: null },
  { id: "lab_cvd" as const, diamondType: "LAB_GROWN" as const, growthMethod: "CVD" as const },
];
const NONE_ORIGIN = { id: "none" as const };
const ORIGINS = [...DIAMOND_ORIGINS, NONE_ORIGIN];

const COLOR_ORDER = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const CLARITY_ORDER = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"];

// This product has hasDiamond=true but no real ProductDiamondOption rows of
// its own yet (see AGENTS.md — a data gap the owner asked to bridge, not
// silently price around, with the exact same shape/carat/color/clarity
// pricelist filter the public diamond calculator uses). The final price for
// this pick is resolved server-side (see resolveConfiguredPrice) — this
// component only ever reports the SELECTION up, never a price it computed
// itself.
export function CalculatorDiamondSelector({
  calculatorDiamondPrices,
  onSpecChange,
  allowNone = true,
}: {
  calculatorDiamondPrices: CalculatorDiamondOption[];
  onSpecChange: (choice: CalculatorDiamondChoice | null) => void;
  // A product with no diamond of its own starts on "no diamond" (metal-only
  // price) and the customer opts INTO a diamond; a product that already has
  // a designed diamond offers only real pricelist origins here.
  allowNone?: boolean;
}) {
  const t = useTranslations("Product");
  const [originId, setOriginId] = useState<(typeof ORIGINS)[number]["id"]>(allowNone ? "none" : "natural");
  const isNone = originId === "none";
  const origin = DIAMOND_ORIGINS.find((o) => o.id === originId) ?? DIAMOND_ORIGINS[0];

  const rowsForOrigin = useMemo(
    () =>
      isNone
        ? []
        : calculatorDiamondPrices.filter(
            (r) => r.diamondType === origin.diamondType && (r.growthMethod ?? null) === origin.growthMethod
          ),
    [calculatorDiamondPrices, origin, isNone]
  );

  const shapes = useMemo(
    () => [...new Set(rowsForOrigin.map((r) => r.shape))].sort(),
    [rowsForOrigin]
  );
  const [shapeState, setShapeState] = useState<string | null>(null);
  // Whenever a step up the chain changes, snap every step below it back to
  // its own first valid value instead of silently keeping a stale one that
  // may no longer exist for the new selection (same discipline as the
  // calculator's own origin switch) — done as a render-time adjustment
  // (React's documented pattern for this), not inside an effect.
  const [lastOriginId, setLastOriginId] = useState(originId);
  if (originId !== lastOriginId) {
    setLastOriginId(originId);
    setShapeState(shapes[0] ?? null);
  }
  const shape = shapeState ?? shapes[0] ?? null;

  const rowsForShape = useMemo(
    () => (shape ? rowsForOrigin.filter((r) => r.shape === shape) : []),
    [rowsForOrigin, shape]
  );
  const carats = useMemo(
    () => [...new Set(rowsForShape.map((r) => r.caratWeight))].sort((a, b) => a - b),
    [rowsForShape]
  );
  const [caratState, setCaratState] = useState<number | null>(null);
  const [lastShape, setLastShape] = useState(shape);
  if (shape !== lastShape) {
    setLastShape(shape);
    setCaratState(carats[0] ?? null);
  }
  const carat = caratState ?? carats[0] ?? null;

  const rowsForCarat = useMemo(
    () => (carat != null ? rowsForShape.filter((r) => r.caratWeight === carat) : []),
    [rowsForShape, carat]
  );
  const colors = useMemo(
    () =>
      [...new Set(rowsForCarat.map((r) => r.colorGrade))].sort(
        (a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b)
      ),
    [rowsForCarat]
  );
  const [colorState, setColorState] = useState<string | null>(null);
  const [lastCarat, setLastCarat] = useState(carat);
  if (carat !== lastCarat) {
    setLastCarat(carat);
    setColorState(colors[0] ?? null);
  }
  const color = colorState ?? colors[0] ?? null;

  const rowsForColor = useMemo(
    () => (color ? rowsForCarat.filter((r) => r.colorGrade === color) : []),
    [rowsForCarat, color]
  );
  const clarities = useMemo(
    () =>
      [...new Set(rowsForColor.map((r) => r.clarityGrade))].sort(
        (a, b) => CLARITY_ORDER.indexOf(a) - CLARITY_ORDER.indexOf(b)
      ),
    [rowsForColor]
  );
  const [clarityState, setClarityState] = useState<string | null>(null);
  const [lastColor, setLastColor] = useState(color);
  if (color !== lastColor) {
    setLastColor(color);
    setClarityState(clarities[0] ?? null);
  }
  const clarity = clarityState ?? clarities[0] ?? null;

  useEffect(() => {
    if (isNone) {
      onSpecChange("none");
      return;
    }
    if (!shape || carat == null || !color || !clarity) {
      onSpecChange(null);
      return;
    }
    onSpecChange({
      diamondType: origin.diamondType,
      growthMethod: origin.growthMethod,
      shape,
      caratWeight: carat,
      colorGrade: color,
      clarityGrade: clarity,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNone, origin, shape, carat, color, clarity]);

  return (
    <div className="mt-6 space-y-5 border-t border-gold-soft pt-6">
      <label className="block text-sm font-medium text-ink">{t("diamondSpecHeading")}</label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
            {t("diamondOriginLabel")}
          </label>
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value as typeof originId)}
            className="w-full border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          >
            {(allowNone ? ORIGINS : DIAMOND_ORIGINS).map((o) => (
              <option key={o.id} value={o.id}>
                {t(`origin_${o.id}`)}
              </option>
            ))}
          </select>
        </div>

        {isNone ? null : shapes.length === 0 ? (
          <p className="col-span-3 self-end pb-2 text-sm text-ink/60">{t("diamondSpecUnavailable")}</p>
        ) : (
          <>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
            {t("detailShape")}
          </label>
          <select
            value={shape ?? ""}
            onChange={(e) => setShapeState(e.target.value)}
            className="w-full border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          >
            {shapes.map((s) => (
              <option key={s} value={s}>
                {t(`shape_${s}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
            {t("caratLabel")}
          </label>
          <select
            value={carat ?? ""}
            onChange={(e) => setCaratState(Number(e.target.value))}
            className="w-full border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          >
            {carats.map((c) => (
              <option key={c} value={c}>
                {t("caratUnit", { weight: c })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
            {t("colorLabel")}
          </label>
          <select
            value={color ?? ""}
            onChange={(e) => setColorState(e.target.value)}
            className="w-full border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          >
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60">
            {t("clarityLabel")}
          </label>
          <select
            value={clarity ?? ""}
            onChange={(e) => setClarityState(e.target.value)}
            className="w-full border border-gold-soft bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
          >
            {clarities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
