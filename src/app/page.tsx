import { Hero } from "@/components/home/Hero";
import { ProductSection } from "@/components/home/ProductSection";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { NewCollection, EuphoriaSpotlight } from "@/components/home/NewCollection";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramSection } from "@/components/home/InstagramSection";
import { featuredProducts, newArrivals } from "@/lib/products-data";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductSection title="Latest Beauty" products={featuredProducts} />
      <CategoryBanners />
      <ProductSection title="New Earrings" products={newArrivals} />
      <NewCollection />
      <EuphoriaSpotlight />
      <PartnersStrip />
      <Testimonials />
      <InstagramSection />
    </>
  );
}
