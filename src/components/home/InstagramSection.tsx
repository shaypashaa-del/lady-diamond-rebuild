import { useTranslations } from "next-intl";

export function InstagramSection() {
  const t = useTranslations("Home");
  const tiles = Array.from({ length: 6 });
  return (
    <section className="py-14 text-center">
      <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("instagram")}</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.3em] text-neutral-400" dir="ltr">
        @ladydiamondjewels
      </p>
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-3 gap-1 px-4 sm:grid-cols-6 sm:px-8">
        {tiles.map((_, i) => (
          <div key={i} className="aspect-square placeholder-gradient" />
        ))}
      </div>
    </section>
  );
}
