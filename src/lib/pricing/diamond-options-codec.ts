import type { CalculatorDiamondOption } from "@/lib/pricing/engine";

// Compact wire format for the diamond pricelist's available combinations
// (no cost data): [type, growth, shape, carat, color, clarity] where
// type 0=NATURAL 1=LAB_GROWN and growth 0=none 1=CVD 2=HPHT. About a tenth
// the size of the equivalent array of objects.
export type EncodedDiamondOption = [number, number, string, number, string, string];

const GROWTH = [null, "CVD", "HPHT"] as const;

export function encodeDiamondOption(o: CalculatorDiamondOption): EncodedDiamondOption {
  return [
    o.diamondType === "NATURAL" ? 0 : 1,
    o.growthMethod === "CVD" ? 1 : o.growthMethod === "HPHT" ? 2 : 0,
    o.shape,
    o.caratWeight,
    o.colorGrade,
    o.clarityGrade,
  ];
}

export function decodeDiamondOptions(rows: EncodedDiamondOption[]): CalculatorDiamondOption[] {
  return rows.map(([type, growth, shape, carat, color, clarity]) => ({
    diamondType: type === 0 ? "NATURAL" : "LAB_GROWN",
    growthMethod: GROWTH[growth],
    shape,
    caratWeight: carat,
    colorGrade: color,
    clarityGrade: clarity,
  }));
}
