"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function localizedFromForm(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
}

export async function updatePage(id: string, formData: FormData) {
  await prisma.page.update({
    where: { id },
    data: {
      title: localizedFromForm(formData, "title"),
      body: localizedFromForm(formData, "body"),
    },
  });
  revalidatePath("/admin/pages");
}
