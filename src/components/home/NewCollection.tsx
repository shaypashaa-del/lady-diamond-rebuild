import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ScrollReveal";

export function NewCollection() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-16">
        <ScrollReveal className="relative aspect-[4/5] w-full overflow-hidden shadow-[0_30px_60px_-25px_rgba(0,0,0,0.3)]">
          <Image
            src="/brand/collection/v2-lifestyle-model-flower-jewelry.jpeg"
            alt="דוגמנית עונדת תכשיטי Lady Diamond מקולקציית פרח היהלומים"
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="text-center">
          <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("newCollectionTitle")}</h2>
          <span className="gold-rule mt-3" />
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-gold-deep">{t("newCollectionSubtitle")}</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">{t("newCollectionCopy")}</p>
          <Link
            href="/category/all"
            className="mt-6 inline-block border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 hover:bg-gold-bright hover:text-ink"
          >
            {t("shopNow")}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function EuphoriaSpotlight() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-8">
      <ScrollReveal className="relative overflow-hidden">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          <Image
            src="/brand/collection/v2-rings-emerald-collage.jpeg"
            alt="טבעות Lady Diamond משובצות אמרלד על משי זהוב"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="hero-scrim absolute inset-0" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-paper">
          <h2 className="text-5xl font-semibold sm:text-6xl">{t("euphoriaTitle")}</h2>
          <span className="gold-rule mt-4" />
          <p className="mx-auto mt-4 max-w-md text-sm text-paper/80">{t("euphoriaCopy")}</p>
          <Link
            href="/category/rings"
            className="mt-6 inline-block border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide text-paper transition-colors duration-300 hover:bg-gold-bright hover:text-ink"
          >
            {t("shopMore")}
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
