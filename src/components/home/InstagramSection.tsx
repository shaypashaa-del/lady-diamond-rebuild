import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ScrollReveal";

export function InstagramSection() {
  const t = useTranslations("Home");
  const tiles = Array.from({ length: 6 });
  return (
    <section className="py-14 text-center">
      <ScrollReveal>
        <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("instagram")}</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-ink/50" dir="ltr">
          @ladydiamondjewels
        </p>
      </ScrollReveal>
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-3 gap-1 px-4 sm:grid-cols-6 sm:px-8">
        {tiles.map((_, i) => (
          <ScrollReveal key={i} delay={(i % 6) * 0.06} y={16}>
            <div className="aspect-square placeholder-gradient" />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
