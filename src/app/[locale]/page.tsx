import { useTranslations } from "next-intl";
import { getLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { ProductSection } from "@/components/home/ProductSection";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { NewCollection, EuphoriaSpotlight } from "@/components/home/NewCollection";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramSection } from "@/components/home/InstagramSection";
import { getFeaturedProducts } from "@/server/repositories/catalog";
import { toCardProduct } from "@/lib/catalog-view";
import type { Locale } from "@/i18n/routing";
import { getContentBlock, type HeroContent } from "@/server/actions/content-blocks";
import { CONTENT_KEYS } from "@/lib/content-keys";
import { t as tContent } from "@/lib/i18n-content";

export default async function Home() {
  const locale = (await getLocale()) as Locale;
  const featured = await getFeaturedProducts();
  const cards = featured.map((p) => toCardProduct(p, locale));
  const hero = await getContentBlock<HeroContent>(CONTENT_KEYS.homepageHero);

  return <HomeView cards={cards} hero={hero} locale={locale} />;
}

function HomeView({
  cards,
  hero,
  locale,
}: {
  cards: ReturnType<typeof toCardProduct>[];
  hero: HeroContent | null;
  locale: Locale;
}) {
  const t = useTranslations("Home");
  const half = Math.ceil(cards.length / 2);

  return (
    <>
      <Hero
        kicker={hero ? tContent(hero.kicker, locale) : undefined}
        title={hero ? tContent(hero.title, locale) : undefined}
        subtitle={hero ? tContent(hero.subtitle, locale) : undefined}
        ctaLabel={hero ? tContent(hero.ctaLabel, locale) : undefined}
        ctaHref={hero?.ctaHref}
      />
      <ProductSection title={t("latestBeauty")} products={cards.slice(0, half)} />
      <CategoryBanners />
      <ProductSection title={t("newEarrings")} products={cards.slice(half)} />
      <NewCollection />
      <EuphoriaSpotlight />
      <PartnersStrip />
      <Testimonials />
      <InstagramSection />
    </>
  );
}
