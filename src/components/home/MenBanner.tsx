import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GemAccent } from "@/components/gem/GemAccent";
import { ScrollReveal } from "@/components/ScrollReveal";

// A dark band for the men's collection: a deep-blue live stone, no photograph, so it
// needs no imagery the shop does not have yet.
export function MenBanner() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
      <ScrollReveal>
        <Link
          href="/category/men"
          className="group relative grid items-center gap-4 overflow-hidden rounded-[32px] bg-ink px-6 py-10 text-center text-paper sm:grid-cols-[1fr_auto] sm:gap-10 sm:px-14 sm:py-14 sm:text-start"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -end-24 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(70,110,190,0.35)_0%,transparent_65%)]"
          />
          <div className="relative order-2 sm:order-1">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.2em] sm:text-4xl">{t("menTitle")}</h2>
            <span className="gold-rule mt-4 sm:ms-0" />
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-paper/70 sm:mx-0">{t("menCopy")}</p>
            <span className="glass-pill glass-pill-gold mt-6">{t("menCta")}</span>
          </div>
          <GemAccent stone="sapphire" className="relative order-1 mx-auto w-32 sm:order-2 sm:w-56" />
        </Link>
      </ScrollReveal>
    </section>
  );
}
