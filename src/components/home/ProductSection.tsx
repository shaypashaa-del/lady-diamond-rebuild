import { ProductCard } from "@/components/product/ProductCard";
import type { SampleProduct } from "@/lib/products-data";

export function ProductSection({
  title,
  products,
}: {
  title: string;
  products: SampleProduct[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-8">
      <h2 className="mb-8 text-center text-xl font-semibold uppercase tracking-[0.2em]">{title}</h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
