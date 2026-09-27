import { prisma } from "@/lib/prisma";
import { refreshGoldPriceIfStale, getMetalPrice } from "@/server/services/market-prices";
import { MetalType } from "@/generated/prisma/enums";
import { CostReferenceClient } from "./CostReferenceClient";

// Internal, cost-only mirror of the public /calculators diamond + gold
// panels — no margin/markup applied anywhere here. Sourced strictly from
// the same two owner-supplied spreadsheets the public calculator uses
// (CalculatorDiamondPrice for diamond; the live 24K gold spot price +
// PURITY_FRACTION for gold) — deliberately not the metals-price or
// diamond-price admin tables above, which feed real catalog product
// pricing and are a different tool for a different job.
export default async function CostReferencePage() {
  await refreshGoldPriceIfStale();
  const [calculatorDiamondPrices, goldPrice] = await Promise.all([
    prisma.calculatorDiamondPrice.findMany(),
    getMetalPrice(MetalType.GOLD),
  ]);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">עלות גלם — יהלום וזהב (ללא רווח)</h1>
      <p className="mb-6 max-w-2xl text-sm text-neutral-500">
        עותק פנימי של מחשבוני היהלום והזהב הציבוריים (/calculators), אבל בלי שום תוספת רווח — רק עלות
        הגלם הגולמית לפי 2 קבצי האקסל שהוזנו למערכת (יהלום טבעי/CVD, ומחיר ספוט זהב). מיועד לשימוש
        פנימי בלבד ולעולם לא מוצג ללקוח.
      </p>

      <CostReferenceClient
        calculatorDiamondPrices={calculatorDiamondPrices.map((e) => ({
          diamondType: e.diamondType as "NATURAL" | "LAB_GROWN",
          growthMethod: e.growthMethod,
          shape: e.shape,
          caratWeight: Number(e.caratWeight),
          colorGrade: e.colorGrade,
          clarityGrade: e.clarityGrade,
          costPerCaratUsd: Number(e.costPerCaratUsd),
        }))}
        goldPricePerGram24k={goldPrice ? Number(goldPrice.pricePerGram) : null}
      />
    </div>
  );
}
