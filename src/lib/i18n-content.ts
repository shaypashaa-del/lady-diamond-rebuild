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
// a LocalizedText JSON column — old un-migrated rows still hold a bare Hebrew
// string rather than { he, en?, ru? }. Separately, rows written after the
// column was altered from text to jsonb via a raw ALTER COLUMN (rather than
// a column Prisma created as jsonb from the start) come back from Prisma as
// a JSON-encoded *string* instead of a parsed object — so a value here can
// be a plain legacy alt string, a JSON-text string that needs parsing, or
// (once Prisma/Postgres agree on the type after a fresh deploy) a real
// object. All three are handled so no image ever shows raw JSON as its alt
// text.
export function tMediaAlt(value: unknown, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return t(JSON.parse(trimmed) as LocalizedText, locale);
      } catch {
        // Not actually JSON — fall through and treat it as a literal
        // legacy Hebrew alt string.
      }
    }
    return value;
  }
  return t(value as LocalizedText, locale);
}
