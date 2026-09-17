import { useTranslations } from "next-intl";

const partners = ["Vogue", "Elle", "L'Officiel", "Marie Claire", "Glamour"];

export function PartnersStrip() {
  const t = useTranslations("Home");
  return (
    <section className="border-y border-gold-soft bg-ivory-deep py-10">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
        {t("asSeenIn")}
      </p>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4">
        {partners.map((p) => (
          <span key={p} className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
