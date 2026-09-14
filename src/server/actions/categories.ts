"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function localizedFromForm(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
}

export async function createCategory(formData: FormData) {
  const slug = String(formData.get("slug"));
  const name = localizedFromForm(formData, "name");
  const description = localizedFromForm(formData, "description");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  await prisma.category.create({
    data: { slug, name, description, sortOrder },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const slug = String(formData.get("slug"));
  const name = localizedFromForm(formData, "name");
  const description = localizedFromForm(formData, "description");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  await prisma.category.update({
    where: { id },
    data: { slug, name, description, sortOrder },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
