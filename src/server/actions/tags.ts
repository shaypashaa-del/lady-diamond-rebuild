"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createTag(formData: FormData) {
  const nameHe = String(formData.get("name_he") ?? "").trim();
  if (!nameHe) return;

  await prisma.tag.create({
    data: {
      name: {
        he: nameHe,
        en: String(formData.get("name_en") ?? "") || undefined,
        ru: String(formData.get("name_ru") ?? "") || undefined,
      },
      slug: slugify(nameHe) || `tag-${Date.now()}`,
    },
  });

  revalidatePath("/admin/tags");
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}
