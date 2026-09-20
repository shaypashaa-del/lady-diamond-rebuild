"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/lib/i18n-content";
import { CONTENT_KEYS } from "@/lib/content-keys";
import { requireAdminSession } from "@/lib/auth/guards";

export type AnnouncementBarContent = {
  text: LocalizedText;
  linkText: LocalizedText;
  linkHref: string;
};

export type HeroContent = {
  kicker: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
};

// This one query runs on every single page render (the root layout calls it
// for the announcement bar), so it's the most likely place to observe a
// transient dropped connection under load — e.g. `next build`'s parallel
// static-generation workers racing against the local dev database's small
// connection pool. A couple of quick retries absorb that without failing
// the whole page.
export async function getContentBlock<T>(key: string): Promise<T | null> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const row = await prisma.contentBlock.findUnique({ where: { key } });
      return row ? (row.data as T) : null;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
    }
  }
  throw lastError;
}

function localizedFromForm(formData: FormData, prefix: string): LocalizedText {
  return {
    he: String(formData.get(`${prefix}_he`) ?? ""),
    en: String(formData.get(`${prefix}_en`) ?? "") || undefined,
    ru: String(formData.get(`${prefix}_ru`) ?? "") || undefined,
  };
}

export async function updateAnnouncementBar(formData: FormData) {
  await requireAdminSession();
  const data: AnnouncementBarContent = {
    text: localizedFromForm(formData, "text"),
    linkText: localizedFromForm(formData, "linkText"),
    linkHref: String(formData.get("linkHref") ?? "#"),
  };

  await prisma.contentBlock.upsert({
    where: { key: CONTENT_KEYS.announcementBar },
    update: { data },
    create: { key: CONTENT_KEYS.announcementBar, data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

export async function updateHomepageHero(formData: FormData) {
  await requireAdminSession();
  const data: HeroContent = {
    kicker: localizedFromForm(formData, "kicker"),
    title: localizedFromForm(formData, "title"),
    subtitle: localizedFromForm(formData, "subtitle"),
    ctaLabel: localizedFromForm(formData, "ctaLabel"),
    ctaHref: String(formData.get("ctaHref") ?? "/category/all"),
  };

  await prisma.contentBlock.upsert({
    where: { key: CONTENT_KEYS.homepageHero },
    update: { data },
    create: { key: CONTENT_KEYS.homepageHero, data },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
}
