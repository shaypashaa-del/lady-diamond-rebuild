import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CalculatorsClient } from "./CalculatorsClient";
import { getLiveGoldPricePer24kGramIls } from "@/server/services/market-prices";
import { prisma } from "@/lib/prisma";

// Without this, Next.js statically renders this page once at build time —
// a plain Prisma call (unlike fetch()) gives no dynamic-rendering signal on
// its own, so the diamond price tables (and the live gold price) would be
// frozen at whatever they were during the last deploy and never reflect a
// later admin edit or DB seed. 5 minutes matches the same ceiling used on
// the product page for the same reason.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculators");
  return { title: t("pageTitle") };
}

export default async function CalculatorsPage() {
  const [liveGoldPrice, diamondPriceEntries, diamondBaseCostRanges] = await Promise.all([
    getLiveGoldPricePer24kGramIls(),
    prisma.diamondPriceEntry.findMany(),
    prisma.diamondBaseCostRange.findMany(),
  ]);

  return (
    <CalculatorsClient
      liveGoldPrice={liveGoldPrice}
      diamondPriceEntries={diamondPriceEntries.map((e) => ({
        diamondType: e.diamondType,
        shape: e.shape,
        caratMin: Number(e.caratMin),
        caratMax: Number(e.caratMax),
        colorGrade: e.colorGrade,
        clarityGrade: e.clarityGrade,
        pricePerCarat: Number(e.pricePerCarat),
      }))}
      diamondBaseCostRanges={diamondBaseCostRanges.map((r) => ({
        category: r.category,
        minCostPerCarat: Number(r.minCostPerCarat),
        maxCostPerCarat: Number(r.maxCostPerCarat),
        currency: r.currency,
      }))}
    />
  );
}
