import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/server/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";
import type { LocalizedText } from "@/lib/i18n-content";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { categories: true, variants: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">עריכת מוצר</h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories.map((c) => ({ id: c.id, name: c.name as LocalizedText }))}
        submitLabel="שמירת שינויים"
        initial={{
          slug: product.slug,
          name: product.name as LocalizedText,
          shortDescription: product.shortDescription as LocalizedText | null,
          description: product.description as LocalizedText | null,
          basePrice: Number(product.basePrice),
          salePrice: product.salePrice != null ? Number(product.salePrice) : null,
          sku: product.sku,
          inventory: product.inventory,
          status: product.status,
          isFeatured: product.isFeatured,
          categoryId: product.categories[0]?.categoryId,
        }}
      />
      <VariantManager productId={product.id} variants={product.variants} />
    </div>
  );
}
