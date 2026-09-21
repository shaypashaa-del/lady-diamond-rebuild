import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CalculatorsClient } from "./CalculatorsClient";
import { getLiveGoldPricePer24kGramIls } from "@/server/services/market-prices";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculators");
  return { title: t("pageTitle") };
}

export default async function CalculatorsPage() {
  const liveGoldPrice = await getLiveGoldPricePer24kGramIls();
  return <CalculatorsClient liveGoldPrice={liveGoldPrice} />;
}
