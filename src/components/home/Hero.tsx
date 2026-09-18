import Image from "next/image";
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
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink text-paper">
      <Image
        src="/brand/collection/v2-lifestyle-model-instore-heart-pendant.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="rise-in object-cover opacity-70"
        style={{ animationDuration: "1.4s" }}
      />
      <div className="hero-scrim absolute inset-0" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-8">
        <div className="max-w-lg">
          <p className="rise-in text-xs uppercase tracking-[0.4em] text-gold-bright" style={{ animationDelay: "0.1s" }}>
            {kicker ?? t("heroKicker")}
          </p>
          <span className="gold-rule-start rise-in mt-4" style={{ animationDelay: "0.2s" }} />
          <h1
            className="rise-in mt-6 text-4xl font-semibold leading-[1.1] sm:text-6xl"
            style={{ animationDelay: "0.3s" }}
          >
            {title ?? t("heroTitle")}
          </h1>
          <p className="rise-in mt-5 max-w-md text-sm leading-relaxed text-paper/80" style={{ animationDelay: "0.4s" }}>
            {subtitle ?? t("heroSubtitle")}
          </p>
          <Link
            href={ctaHref ?? "/category/all"}
            className="rise-in link-underline mt-9 inline-block border border-gold-bright px-10 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-gold-bright hover:text-ink"
            style={{ animationDelay: "0.5s" }}
          >
            {ctaLabel ?? t("heroCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
