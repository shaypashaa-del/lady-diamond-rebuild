"use server";

import { prisma } from "@/lib/prisma";
import { encodeDiamondOption, type EncodedDiamondOption } from "@/lib/pricing/diamond-options-codec";

// Which shape/carat/color/clarity combinations the diamond pricelist covers —
// loaded by the product page only when a customer actually opens the diamond
// picker, instead of being embedded in every product page. Deliberately
// returns NO cost data; prices are always computed server-side.
let cache: { at: number; rows: EncodedDiamondOption[] } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function getDiamondPricelistOptions(): Promise<EncodedDiamondOption[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  const rows = await prisma.calculatorDiamondPrice.findMany({
    select: { diamondType: true, growthMethod: true, shape: true, caratWeight: true, colorGrade: true, clarityGrade: true },
  });
  const encoded = rows.map((r) =>
    encodeDiamondOption({
      diamondType: r.diamondType as "NATURAL" | "LAB_GROWN",
      growthMethod: r.growthMethod,
      shape: r.shape,
      caratWeight: Number(r.caratWeight),
      colorGrade: r.colorGrade,
      clarityGrade: r.clarityGrade,
    })
  );
  cache = { at: Date.now(), rows: encoded };
  return encoded;
}
