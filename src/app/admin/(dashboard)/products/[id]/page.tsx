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
  const [product, categories, allMedia, tags, otherProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        variants: true,
        tags: true,
        relatedTo: true,
        images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.tag.findMany({ orderBy: { slug: "asc" } }),
    prisma.product.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
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
        tags={tags.map((t) => ({ id: t.id, name: t.name as LocalizedText }))}
        relatedOptions={otherProducts.map((p) => ({ id: p.id, name: p.name as LocalizedText }))}
        submitLabel="שמירת שינויים"
        initial={{
          slug: product.slug,
          name: product.name as LocalizedText,
          shortDescription: product.shortDescription as LocalizedText | null,
          description: product.description as LocalizedText | null,
          seoTitle: product.seoTitle as LocalizedText | null,
          seoDescription: product.seoDescription as LocalizedText | null,
          basePrice: Number(product.basePrice),
          salePrice: product.salePrice != null ? Number(product.salePrice) : null,
          sku: product.sku,
          inventory: product.inventory,
          weightGrams: product.weightGrams,
          status: product.status,
          isFeatured: product.isFeatured,
          categoryId: product.categories[0]?.categoryId,
          tagIds: product.tags.map((t) => t.tagId),
          relatedIds: product.relatedTo.map((r) => r.relatedId),
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
