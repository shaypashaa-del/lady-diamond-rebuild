"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export type TagFormResult = { error: string } | { created: true } | undefined;

export async function createTag(
  _prevState: TagFormResult,
  formData: FormData
): Promise<TagFormResult> {
  await requireAdminSession();
  const nameHe = String(formData.get("name_he") ?? "").trim();
  if (!nameHe) return { error: "יש להזין שם בעברית." };

  try {
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
  } catch {
    return { error: "תגית עם שם דומה כבר קיימת." };
  }

  revalidatePath("/admin/tags");
  return { created: true };
}

export async function deleteTag(id: string) {
  await requireAdminSession();
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}
