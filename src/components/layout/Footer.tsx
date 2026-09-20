import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { footerColumns } from "@/lib/nav-data";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-gold-soft bg-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-4 sm:px-8">
        <div>
          <h3 className="text-base uppercase tracking-wide text-ink">{t("brand")}</h3>
          <p className="mt-3 text-sm text-ink/60">{t("tagline")}</p>
          <p className="mt-3 text-sm text-ink/60">{t("address")}</p>
          <a href="tel:+972503781589" className="mt-2 block text-sm text-ink/60 hover:text-ink" dir="ltr">
            +972-50-3781589
          </a>
          <p className="mt-1 text-xs text-ink/50">{t("hours")}</p>
          <SocialLinks className="mt-4 flex items-center gap-4" />
        </div>
        {footerColumns.map((col) => (
          <div key={col.titleKey}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep">{t(col.titleKey)}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink/60">
              {col.links.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="link-underline hover:text-ink">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gold-soft py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-ink/60 sm:flex-row sm:px-8">
          <p>{t("rights")}</p>
          <a href="mailto:info@ladydiamondjewels.com" className="hover:text-ink" dir="ltr">
            info@ladydiamondjewels.com
          </a>
        </div>
      </div>
      <div className="border-t border-gold-soft/60 bg-paper-soft py-3">
        <p dir="rtl" className="mx-auto max-w-7xl px-4 text-center text-[11px] tracking-wide text-ink/40 sm:px-8">
          כל הזכויות שמורות <bdi dir="ltr">© 2007</bdi> פשה גרופ.
        </p>
      </div>
    </footer>
  );
}
