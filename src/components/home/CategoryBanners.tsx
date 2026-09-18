import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CategoryBanners() {
  const t = useTranslations("Home");
  const banners = [
    {
      title: t("sophisticatedTitle"),
      copy: t("sophisticatedCopy"),
      href: "/category/necklaces",
      image: "/brand/products/necklace-heart-rosegold-halo-box.jpeg",
    },
    {
      title: t("beautyBraceletsTitle"),
      copy: t("beautyBraceletsCopy"),
      href: "/category/bracelets",
      image: "/brand/products/bracelet-tennis-trio.jpeg",
    },
  ];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:px-8">
      {banners.map((b) => (
        <Link
          key={b.title}
          href={b.href}
          className="zoom-on-hover-trigger relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden border border-gold-soft text-center transition-shadow duration-500 hover:shadow-[0_0_0_1px_var(--gold)]"
        >
          <Image
            src={b.image}
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="zoom-on-hover object-cover"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="relative px-6 text-paper">
            <h3 className="text-lg font-semibold uppercase tracking-[0.2em]">{b.title}</h3>
            <span className="gold-rule mt-3" />
            <p className="mt-3 max-w-xs text-sm text-paper/80">{b.copy}</p>
            <span className="link-underline mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-gold-bright">
              {t("findMore")}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
