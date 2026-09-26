import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { footerColumns } from "@/lib/nav-data";
import { SocialLinks } from "./SocialLinks";
import { ScrollReveal } from "@/components/ScrollReveal";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="relative overflow-hidden border-t border-gold-bright/30 bg-ink text-paper">
      {/* A single faint gold line at the very top edge, echoing .gold-rule
          elsewhere on the site, so the footer reads as a deliberate dark
          "closing" section rather than a plain color swap. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-bright to-transparent"
      />
      {/* A very large, mostly-invisible watermark diamond mark behind the
          brand column — pure texture, never competes with real content. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -bottom-16 -start-16 h-64 w-64 text-paper/[0.03] rtl:scale-x-[-1]"
      >
        <path
          fill="currentColor"
          d="M100 10 L160 70 L100 190 L40 70 Z M40 70 L160 70 M70 70 L100 190 M130 70 L100 190"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <ScrollReveal>
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-16 sm:grid-cols-4 sm:gap-8 sm:px-8 sm:py-20">
          <div className="col-span-2 sm:col-span-1">
            <Image src="/brand/logo.png" alt={t("brand")} width={72} height={58} className="h-14 w-auto brightness-0 invert" />
            <p className="mt-5 max-w-[26ch] text-sm leading-6 text-paper/60">{t("tagline")}</p>
            <p className="mt-4 text-sm text-paper/50">{t("address")}</p>
            <a href="tel:+972503781589" className="mt-2 block text-sm text-paper/50 transition-colors hover:text-gold-bright" dir="ltr">
              +972-50-3781589
            </a>
            <p className="mt-1 text-xs text-paper/40">{t("hours")}</p>
            <SocialLinks variant="dark" className="mt-6 flex items-center gap-3" />
          </div>
          {footerColumns.map((col) => (
            <div key={col.titleKey}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-bright">{t(col.titleKey)}</h3>
              <span className="mt-3 block h-px w-8 bg-gold-bright/40" />
              <ul className="mt-4 space-y-3 text-sm text-paper/60">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} className="link-underline transition-colors hover:text-paper">
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <div className="relative border-t border-paper/10 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-paper/50 sm:flex-row sm:px-8">
          <p>{t("rights")}</p>
          <a href="mailto:info@ladydiamondjewels.com" className="transition-colors hover:text-gold-bright" dir="ltr">
            info@ladydiamondjewels.com
          </a>
        </div>
      </div>
      <div className="relative border-t border-paper/5 bg-black/20 py-3">
        <p className="mx-auto max-w-7xl px-4 text-center text-[11px] tracking-wide text-paper/30 sm:px-8">
          {t("legalRights")}
        </p>
      </div>
    </footer>
  );
}
