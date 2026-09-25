"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/auth/guards";
import { revalidateProductPage } from "@/server/revalidate-product";
import { notifyPriceDropSubscribers } from "@/server/actions/price-drop";

function localizedFromForm(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
}

function optionalLocalizedFromForm(formData: FormData, prefix: string) {
  const value = localizedFromForm(formData, prefix);
  return value.he || value.en || value.ru ? value : undefined;
}

function readProductForm(formData: FormData) {
  const basePrice = Math.max(0, Number(formData.get("basePrice")));
  const salePriceRaw = formData.get("salePrice");
  const salePrice = salePriceRaw ? Math.max(0, Number(salePriceRaw)) : null;
  const inventory = Math.max(0, Number(formData.get("inventory") ?? 0));
  const weightGramsRaw = formData.get("weightGrams");
  const weightGrams = weightGramsRaw ? Math.max(0, Number(weightGramsRaw)) : null;
  const status = String(formData.get("status")) as ProductStatus;
  const isFeatured = formData.get("isFeatured") === "on";
  const sku = String(formData.get("sku") ?? "") || null;
  const categoryId = String(formData.get("categoryId") ?? "");
  const slug = String(formData.get("slug"));
  const tagIds = formData.getAll("tagIds").map(String);
  const relatedIds = formData.getAll("relatedIds").map(String);

  return {
    slug,
    name: localizedFromForm(formData, "name"),
    shortDescription: localizedFromForm(formData, "shortDescription"),
    description: localizedFromForm(formData, "description"),
    seoTitle: optionalLocalizedFromForm(formData, "seoTitle"),
    seoDescription: optionalLocalizedFromForm(formData, "seoDescription"),
    basePrice,
    salePrice,
    sku,
    inventory,
    weightGrams,
    status,
    isFeatured,
    categoryId,
    tagIds,
    relatedIds,
  };
}

async function syncTagsAndRelated(productId: string, tagIds: string[], relatedIds: string[]) {
  await prisma.productTag.deleteMany({ where: { productId } });
  if (tagIds.length > 0) {
    await prisma.productTag.createMany({
      data: tagIds.map((tagId) => ({ productId, tagId })),
    });
  }

  await prisma.productRelation.deleteMany({ where: { productId } });
  if (relatedIds.length > 0) {
    await prisma.productRelation.createMany({
      data: relatedIds.map((relatedId) => ({ productId, relatedId })),
    });
  }
}

export type ProductFormResult = { error: string } | void;

export async function createProduct(
  _prevState: ProductFormResult,
  formData: FormData
): Promise<ProductFormResult> {
  await requireAdminSession();
  const data = readProductForm(formData);

  let product;
  try {
    product = await prisma.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        sku: data.sku,
        inventory: data.inventory,
        weightGrams: data.weightGrams,
        status: data.status,
        isFeatured: data.isFeatured,
      },
    });
  } catch {
    return { error: `מוצר עם הכתובת (slug) "${data.slug}" כבר קיים.` };
  }

  if (data.categoryId) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId: data.categoryId },
    });
  }

  await syncTagsAndRelated(product.id, data.tagIds, data.relatedIds);

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormResult,
  formData: FormData
): Promise<ProductFormResult> {
  await requireAdminSession();
  const data = readProductForm(formData);

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, basePrice: true, salePrice: true },
  });

  try {
    await prisma.product.update({
      where: { id },
      data: {
        slug: data.slug,
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        sku: data.sku,
        inventory: data.inventory,
        weightGrams: data.weightGrams,
        status: data.status,
        isFeatured: data.isFeatured,
      },
    });
  } catch {
    return { error: `מוצר עם הכתובת (slug) "${data.slug}" כבר קיים.` };
  }

  if (existing) {
    const oldDisplayPrice = Number(existing.salePrice ?? existing.basePrice);
    const newDisplayPrice = data.salePrice ?? data.basePrice;
    if (newDisplayPrice < oldDisplayPrice) {
      await notifyPriceDropSubscribers(id, newDisplayPrice);
    }
  }

  if (data.categoryId) {
    await prisma.productCategory.deleteMany({ where: { productId: id } });
    await prisma.productCategory.create({
      data: { productId: id, categoryId: data.categoryId },
    });
  }

  await syncTagsAndRelated(id, data.tagIds, data.relatedIds);

  revalidatePath("/admin/products");
  revalidateProductPage(data.slug);
  if (existing && existing.slug !== data.slug) revalidateProductPage(existing.slug);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdminSession();
  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  if (existing) revalidateProductPage(existing.slug);
}

export async function duplicateProduct(id: string) {
  await requireAdminSession();
  const original = await prisma.product.findUniqueOrThrow({
    where: { id },
    include: { categories: true, tags: true, variants: true, images: true },
  });

  const copy = await prisma.product.create({
    data: {
      slug: `${original.slug}-copy-${Date.now()}`,
      name: original.name as object,
      shortDescription: original.shortDescription as object | undefined,
      description: original.description as object | undefined,
      seoTitle: original.seoTitle as object | undefined,
      seoDescription: original.seoDescription as object | undefined,
      basePrice: original.basePrice,
      salePrice: original.salePrice,
      inventory: original.inventory,
      weightGrams: original.weightGrams,
      status: ProductStatus.DRAFT,
      isFeatured: false,
    },
  });

  for (const c of original.categories) {
    await prisma.productCategory.create({
      data: { productId: copy.id, categoryId: c.categoryId },
    });
  }

  for (const t of original.tags) {
    await prisma.productTag.create({ data: { productId: copy.id, tagId: t.tagId } });
  }

  for (const v of original.variants) {
    await prisma.productVariant.create({
      data: {
        productId: copy.id,
        attributes: v.attributes as object,
        price: v.price,
        salePrice: v.salePrice,
        inventory: v.inventory,
        imageId: v.imageId,
        isDefault: v.isDefault,
        // sku is unique — the copy can't reuse the original's SKU.
      },
    });
  }

  for (const img of original.images) {
    await prisma.productImage.create({
      data: { productId: copy.id, mediaId: img.mediaId, sortOrder: img.sortOrder, altText: img.altText },
    });
  }

  revalidatePath("/admin/products");
}
