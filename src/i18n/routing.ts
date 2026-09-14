import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["he", "en", "ru"],
  defaultLocale: "he",
  localePrefix: "as-needed", // default locale (he) has no /he prefix, /en and /ru do
  localeDetection: false, // always default to Hebrew at "/" regardless of browser Accept-Language
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  he: "עברית",
  en: "English",
  ru: "Русский",
};

export const rtlLocales: Locale[] = ["he"];
