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

export default async function Home() {
  const locale = (await getLocale()) as Locale;
  const featured = await getFeaturedProducts();
  const cards = featured.map((p) => toCardProduct(p, locale));

  return <HomeView cards={cards} />;
}

function HomeView({ cards }: { cards: ReturnType<typeof toCardProduct>[] }) {
  const t = useTranslations("Home");
  const half = Math.ceil(cards.length / 2);

  return (
    <>
      <Hero />
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
