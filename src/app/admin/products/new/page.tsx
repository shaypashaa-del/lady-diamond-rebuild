import { prisma } from "@/lib/prisma";
import { createProduct } from "@/server/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import type { LocalizedText } from "@/lib/i18n-content";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">מוצר חדש</h1>
      <ProductForm
        action={createProduct}
        categories={categories.map((c) => ({ id: c.id, name: c.name as LocalizedText }))}
        submitLabel="יצירת מוצר"
      />
    </div>
  );
}
