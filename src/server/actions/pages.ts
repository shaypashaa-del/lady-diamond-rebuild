"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

function localizedFromForm(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
}

export type PageSaveResult = { saved: true } | { error: string };

// The "about-us" page stores its body as { story, quote } (the public page
// reads exactly those two keys); every other page (policies, ...) stores a
// single localized body. Saving must keep each page's own shape, otherwise
// the public page loses its content.
export async function updatePage(id: string, formData: FormData): Promise<PageSaveResult> {
  await requireAdminSession();
  const page = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
  if (!page) return { error: "העמוד לא נמצא." };

  const title = localizedFromForm(formData, "title");
  if (!title.he.trim()) return { error: "יש למלא כותרת בעברית." };

  let body: object;
  if (page.slug === "about-us") {
    const story = localizedFromForm(formData, "story");
    const quote = localizedFromForm(formData, "quote");
    if (!story.he.trim()) return { error: "יש למלא את הסיפור בעברית." };
    body = { story, quote };
  } else {
    const text = localizedFromForm(formData, "body");
    if (!text.he.trim()) return { error: "יש למלא את התוכן בעברית." };
    body = text;
  }

  try {
    await prisma.page.update({ where: { id }, data: { title, body } });
  } catch (err) {
    console.error("[admin] updatePage failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return { saved: true };
}
