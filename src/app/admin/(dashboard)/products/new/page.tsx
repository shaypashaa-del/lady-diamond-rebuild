import { prisma } from "@/lib/prisma";
import { createProduct } from "@/server/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import type { LocalizedText } from "@/lib/i18n-content";

export default async function NewProductPage() {
  const [categories, tags, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.tag.findMany({ orderBy: { slug: "asc" } }),
    prisma.product.findMany({ select: { id: true, name: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">מוצר חדש</h1>
      <ProductForm
        action={createProduct}
        categories={categories.map((c) => ({ id: c.id, name: c.name as LocalizedText }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name as LocalizedText }))}
        relatedOptions={products.map((p) => ({ id: p.id, name: p.name as LocalizedText }))}
        submitLabel="יצירת מוצר"
      />
    </div>
  );
}
