import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CategoryBanners() {
  const t = useTranslations("Home");
  const banners = [
    { title: t("sophisticatedTitle"), copy: t("sophisticatedCopy"), href: "/category/necklaces" },
    { title: t("beautyBraceletsTitle"), copy: t("beautyBraceletsCopy"), href: "/category/bracelets" },
  ];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:px-8">
      {banners.map((b) => (
        <div key={b.title} className="relative flex aspect-[4/3] flex-col items-center justify-center border border-gold-soft bg-paper-soft text-center">
          <h3 className="text-lg font-semibold uppercase tracking-[0.2em]">{b.title}</h3>
          <p className="mt-2 max-w-xs px-6 text-sm text-neutral-500">{b.copy}</p>
          <Link href={b.href} className="mt-4 text-xs font-semibold uppercase tracking-wide underline underline-offset-4">
            {t("findMore")}
          </Link>
        </div>
      ))}
    </section>
  );
}
