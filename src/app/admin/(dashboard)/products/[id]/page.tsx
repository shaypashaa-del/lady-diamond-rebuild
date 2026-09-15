import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/server/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import type { LocalizedText } from "@/lib/i18n-content";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, allMedia] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        variants: true,
        images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!product) notFound();

  const usedMediaIds = new Set(product.images.map((img) => img.mediaId));
  const availableMedia = allMedia.filter((m) => !usedMediaIds.has(m.id));

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
      <ProductImagesManager
        productId={product.id}
        images={product.images.map((img) => ({
          id: img.id,
          media: { id: img.media.id, url: img.media.url, filename: img.media.filename },
        }))}
        availableMedia={availableMedia.map((m) => ({ id: m.id, filename: m.filename }))}
      />
      <VariantManager productId={product.id} variants={product.variants} />
    </div>
  );
}
