import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero({
  kicker,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
} = {}) {
  const t = useTranslations("Home");
  return (
    <section
      className="relative flex min-h-[78vh] flex-col items-center justify-center overflow-hidden text-center"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, var(--ivory-deep) 0%, var(--ivory) 55%, var(--ivory) 100%)",
      }}
    >
      {/* Signature motif: a slow-drawn continuous line, echoing the brand's
          own description of its pieces ("a ring that wraps the finger in
          one continuous line") — the one deliberate flourish on the page. */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 mx-auto h-full w-full max-w-4xl opacity-[0.35]"
      >
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="0.75"
          strokeDasharray="943"
          strokeDashoffset="943"
          style={{ animation: "draw-ring 2.4s ease-out 0.2s forwards" }}
        />
      </svg>

      <p className="relative text-xs uppercase tracking-[0.4em] text-stone">{kicker ?? t("heroKicker")}</p>
      <span className="gold-rule relative mt-4" />
      <h1 className="font-display relative mt-6 max-w-2xl px-4 text-4xl leading-[1.15] text-ink sm:text-6xl">
        {title ?? t("heroTitle")}
      </h1>
      <p className="relative mt-5 max-w-md px-4 text-sm leading-relaxed text-stone">
        {subtitle ?? t("heroSubtitle")}
      </p>
      <Link
        href={ctaHref ?? "/category/all"}
        className="link-underline relative mt-9 border border-ink px-10 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-ivory"
      >
        {ctaLabel ?? t("heroCta")}
      </Link>

      <style>{`
        @keyframes draw-ring {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          circle { animation: none !important; stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </section>
  );
}
