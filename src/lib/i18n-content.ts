import type { Locale } from "@/i18n/routing";

// Shape stored in every translatable Json column (Product.name, Category.description, ...).
// "he" is required since Hebrew is the store's default/source language; other locales
// are optional and fall back to Hebrew when missing.
export type LocalizedText = Partial<Record<Locale, string>> & { he: string };

export function t(value: LocalizedText | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] ?? value.he ?? "";
}

// MediaAsset.altText was a plain (Hebrew-only) string column before it became
// a LocalizedText JSON column — old rows still hold a bare JSON string rather
// than { he, en?, ru? }. This reads either shape so existing un-migrated rows
// keep showing their Hebrew alt text instead of going blank.
export function tMediaAlt(value: unknown, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return t(value as LocalizedText, locale);
}
