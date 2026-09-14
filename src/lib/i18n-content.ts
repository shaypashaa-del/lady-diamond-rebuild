import type { Locale } from "@/i18n/routing";

// Shape stored in every translatable Json column (Product.name, Category.description, ...).
// "he" is required since Hebrew is the store's default/source language; other locales
// are optional and fall back to Hebrew when missing.
export type LocalizedText = Partial<Record<Locale, string>> & { he: string };

export function t(value: LocalizedText | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] ?? value.he ?? "";
}
