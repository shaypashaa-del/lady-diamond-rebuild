import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GemAccent, type Stone } from "@/components/gem/GemAccent";

const ROW: { stone: Stone; key: "Diamond" | "Sapphire" | "Emerald" | "Ruby"; pitch: number }[] = [
  { stone: "diamond", key: "Diamond", pitch: 1.2 },
  { stone: "sapphire", key: "Sapphire", pitch: 1.0 },
  { stone: "emerald", key: "Emerald", pitch: 1.25 },
  { stone: "ruby", key: "Ruby", pitch: 0.95 },
];

// Four live stones, each a way into the catalogue. Every one can be spun by hand.
export function StoneRow() {
  const t = useTranslations("Home");
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <ScrollReveal className="text-center">
        <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("stonesTitle")}</h2>
        <span className="gold-rule mb-8 mt-3" />
      </ScrollReveal>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {ROW.map((s, i) => (
          <ScrollReveal key={s.stone} delay={i * 0.07}>
            <div className="stone-tile group relative flex flex-col items-center overflow-hidden rounded-[28px] px-4 pb-6 pt-4 text-paper">
              <GemAccent stone={s.stone} pitch={s.pitch} className="w-[82%] max-w-[15rem]" />
              <h3 className="mt-1 text-base font-semibold tracking-wide sm:text-lg">{t(`stone${s.key}`)}</h3>
              <Link
                href={{ pathname: "/search", query: { q: t(`stone${s.key}Query`) } }}
                className="glass-pill mt-4 min-h-0 px-5 py-2 text-xs after:absolute after:inset-0"
              >
                {t("stonesCta")}
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
