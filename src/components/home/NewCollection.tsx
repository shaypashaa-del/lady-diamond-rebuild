import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ScrollReveal";

export function NewCollection() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-8">
      <ScrollReveal>
        <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("newCollectionTitle")}</h2>
        <span className="gold-rule mt-3" />
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-gold">{t("newCollectionSubtitle")}</p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink/60">{t("newCollectionCopy")}</p>
        <Link
          href="/category/all"
          className="mt-6 inline-block border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 hover:bg-gold-bright hover:text-ink"
        >
          {t("shopNow")}
        </Link>
      </ScrollReveal>
    </section>
  );
}

export function EuphoriaSpotlight() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 text-center sm:px-8">
      <ScrollReveal className="border border-gold-soft bg-paper-soft px-6 py-16">
        <h2 className="font-display text-5xl font-normal sm:text-6xl">{t("euphoriaTitle")}</h2>
        <span className="gold-rule mt-4" />
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">{t("euphoriaCopy")}</p>
        <Link
          href="/category/rings"
          className="mt-6 inline-block border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 hover:bg-gold-bright hover:text-ink"
        >
          {t("shopMore")}
        </Link>
      </ScrollReveal>
    </section>
  );
}
