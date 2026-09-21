import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// A thin, overlapping-circles line motif drawn over each photo — echoes a
// jeweler's loupe/gem outline without being a literal icon. Pure decoration,
// so it's hidden from screen readers.
function CircleOverlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className={className}>
      <circle cx="120" cy="130" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="180" cy="170" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function CategoryTile({
  href,
  image,
  title,
  copy,
  findMoreLabel,
  className = "",
}: {
  href: string;
  image: string;
  title: string;
  copy: string;
  findMoreLabel: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`zoom-on-hover-trigger group relative flex w-full flex-col items-center justify-center overflow-hidden text-center ${className}`}
    >
      <Image src={image} alt={title} fill sizes="(min-width: 640px) 45vw, 100vw" className="zoom-on-hover object-cover" />
      <div className="hero-scrim absolute inset-0" />
      <CircleOverlay className="pointer-events-none absolute inset-0 h-full w-full text-paper/50 mix-blend-screen" />
      <div className="relative px-6 text-paper">
        <h3 className="text-lg font-semibold uppercase tracking-[0.25em] sm:text-xl">{title}</h3>
        <span className="mt-3 hidden max-w-[16rem] text-xs leading-6 text-paper/80 sm:block">{copy}</span>
        <span className="link-underline mt-4 hidden text-[11px] font-semibold uppercase tracking-wide text-gold-bright sm:inline-block">
          {findMoreLabel}
        </span>
      </div>
    </Link>
  );
}

export function CategoryBanners() {
  const t = useTranslations("Home");

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-0">
        {/* Left column: one tall image, the "more categories" note below it. */}
        <div className="flex flex-col">
          <CategoryTile
            href="/category/necklaces"
            image="/brand/products/necklace-heart-rosegold-halo-box.jpeg"
            title={t("sophisticatedTitle")}
            copy={t("sophisticatedCopy")}
            findMoreLabel={t("findMore")}
            className="aspect-[3/4] border border-gold-soft"
          />
          <div className="mt-8 flex flex-1 flex-col items-center justify-center px-4 text-center sm:mt-12">
            <h3 className="text-lg font-semibold uppercase tracking-[0.25em] text-ink">{t("moreCategoriesTitle")}</h3>
            <span className="gold-rule mt-3" />
            <p className="mx-auto mt-4 max-w-xs text-sm text-ink/60">{t("moreCategoriesCopy")}</p>
            <Link
              href="/category/all"
              className="link-underline mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-gold-deep"
            >
              {t("findMore")}
            </Link>
          </div>
        </div>

        {/* Right column: offset downward from the left, so the two columns
            step rather than align — the same staggered rhythm as the
            reference layout, built with real categories/copy/photos. */}
        <div className="mt-8 flex flex-col gap-8 sm:mt-16 sm:gap-10">
          <CategoryTile
            href="/category/bracelets"
            image="/brand/products/bracelet-tennis-trio.jpeg"
            title={t("beautyBraceletsTitle")}
            copy={t("beautyBraceletsCopy")}
            findMoreLabel={t("findMore")}
            className="aspect-[4/3] border border-gold-soft"
          />
          <CategoryTile
            href="/category/earrings"
            image="/brand/collection/v2-lifestyle-model-emerald-drops.jpeg"
            title={t("newEarrings")}
            copy={t("newEarringsCopy")}
            findMoreLabel={t("findMore")}
            className="aspect-[3/4] border border-gold-soft"
          />
        </div>
      </div>
    </section>
  );
}
