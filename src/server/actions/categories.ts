"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

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

export type CategoryFormResult = { error: string } | void;

export async function createCategory(
  _prevState: CategoryFormResult,
  formData: FormData
): Promise<CategoryFormResult> {
  await requireAdminSession();
  const slug = String(formData.get("slug"));
  const name = localizedFromForm(formData, "name");
  const description = localizedFromForm(formData, "description");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const imageId = String(formData.get("imageId") ?? "") || null;
  const seoTitle = optionalLocalizedFromForm(formData, "seoTitle");
  const seoDescription = optionalLocalizedFromForm(formData, "seoDescription");

  try {
    await prisma.category.create({
      data: { slug, name, description, sortOrder, imageId, seoTitle, seoDescription },
    });
  } catch {
    return { error: `קטגוריה עם הכתובת (slug) "${slug}" כבר קיימת.` };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormResult,
  formData: FormData
): Promise<CategoryFormResult> {
  await requireAdminSession();
  const slug = String(formData.get("slug"));
  const name = localizedFromForm(formData, "name");
  const description = localizedFromForm(formData, "description");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const imageId = String(formData.get("imageId") ?? "") || null;
  const seoTitle = optionalLocalizedFromForm(formData, "seoTitle");
  const seoDescription = optionalLocalizedFromForm(formData, "seoDescription");

  try {
    await prisma.category.update({
      where: { id },
      data: { slug, name, description, sortOrder, imageId, seoTitle, seoDescription },
    });
  } catch {
    return { error: `קטגוריה עם הכתובת (slug) "${slug}" כבר קיימת.` };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdminSession();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
