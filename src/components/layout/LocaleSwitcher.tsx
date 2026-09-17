"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, localeNames, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-xs">
      {routing.locales.map((code) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code })}
          className={
            code === locale
              ? "font-semibold text-ink underline underline-offset-2"
              : "text-ink/50 hover:text-gold"
          }
          aria-current={code === locale}
        >
          {localeNames[code]}
        </button>
      ))}
    </div>
  );
}
