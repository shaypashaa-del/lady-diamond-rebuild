import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CalculatorsClient } from "./CalculatorsClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Calculators");
  return { title: t("pageTitle") };
}

export default function CalculatorsPage() {
  return <CalculatorsClient />;
}
