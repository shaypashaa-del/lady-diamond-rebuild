"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, localeNames, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 border border-gold-soft px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-ink/70 transition-colors hover:border-gold hover:text-gold"
      >
        <Globe size={13} strokeWidth={1.5} />
        {localeNames[locale]}
      </button>

      {open && (
        <ul className="absolute top-full z-20 mt-1 min-w-full border border-gold-soft bg-paper shadow-sm end-0">
          {routing.locales.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.replace(pathname, { locale: code });
                }}
                aria-current={code === locale}
                className={`block w-full whitespace-nowrap px-4 py-2 text-start text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  code === locale ? "bg-paper-soft text-gold" : "text-ink/70 hover:bg-paper-soft hover:text-gold"
                }`}
              >
                {localeNames[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
