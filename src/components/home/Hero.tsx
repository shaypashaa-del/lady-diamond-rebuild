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
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center bg-neutral-100 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">{kicker ?? t("heroKicker")}</p>
      <h1 className="mt-4 max-w-2xl px-4 text-3xl font-semibold uppercase tracking-[0.15em] sm:text-5xl">
        {title ?? t("heroTitle")}
      </h1>
      <p className="mt-4 max-w-md px-4 text-sm text-neutral-500">{subtitle ?? t("heroSubtitle")}</p>
      <Link
        href={ctaHref ?? "/category/all"}
        className="mt-8 border border-neutral-900 px-10 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-neutral-900 hover:text-white"
      >
        {ctaLabel ?? t("heroCta")}
      </Link>
    </section>
  );
}
