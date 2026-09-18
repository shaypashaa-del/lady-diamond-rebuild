import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ScrollReveal";

const partners = ["Vogue", "Elle", "L'Officiel", "Marie Claire", "Glamour"];

export function PartnersStrip() {
  const t = useTranslations("Home");
  return (
    <section className="border-y border-gold-soft bg-paper-soft py-10">
      <ScrollReveal y={14}>
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">
          {t("asSeenIn")}
        </p>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4">
          {partners.map((p) => (
            <span key={p} className="text-sm font-semibold uppercase tracking-widest text-ink/50">
              {p}
            </span>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
