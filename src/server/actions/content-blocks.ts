"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { LocalizedText } from "@/lib/i18n-content";
import { CONTENT_KEYS } from "@/lib/content-keys";
import { requireAdminSession } from "@/lib/auth/guards";

export type ContentSaveResult = { saved: true } | { error: string };

// A link target must be a site path, an anchor, or an http(s) URL.
function cleanHref(raw: string, fallback: string): string | null {
  const v = raw.trim() || fallback;
  return /^(\/|#|https?:\/\/)/.test(v) ? v : null;
}

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
  // Slide photos (site paths). Empty/missing = the built-in brand photos.
  images?: string[];
};

export type BannerTile = { href: string; image: string; title: LocalizedText; copy: LocalizedText };
// Slots: 0 = tall left tile, 1 = right top, 2 = right bottom.
export type HomepageBannersContent = { tiles: (BannerTile | null)[] };

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

export async function updateAnnouncementBar(formData: FormData): Promise<ContentSaveResult> {
  await requireAdminSession();
  const text = localizedFromForm(formData, "text");
  if (!text.he.trim()) return { error: "יש למלא את הטקסט בעברית." };
  const linkHref = cleanHref(String(formData.get("linkHref") ?? ""), "#");
  if (!linkHref) return { error: "הקישור חייב להתחיל ב-/ או # או https://" };
  const data: AnnouncementBarContent = {
    text,
    linkText: localizedFromForm(formData, "linkText"),
    linkHref,
  };

  try {
    await prisma.contentBlock.upsert({
      where: { key: CONTENT_KEYS.announcementBar },
      update: { data },
      create: { key: CONTENT_KEYS.announcementBar, data },
    });
  } catch (err) {
    console.error("[admin] updateAnnouncementBar failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { saved: true };
}

export async function updateHomepageHero(formData: FormData): Promise<ContentSaveResult> {
  await requireAdminSession();
  const title = localizedFromForm(formData, "title");
  if (!title.he.trim()) return { error: "יש למלא כותרת ראשית בעברית." };
  const ctaHref = cleanHref(String(formData.get("ctaHref") ?? ""), "/category/all");
  if (!ctaHref) return { error: "הקישור חייב להתחיל ב-/ או # או https://" };
  const data: HeroContent = {
    kicker: localizedFromForm(formData, "kicker"),
    title,
    subtitle: localizedFromForm(formData, "subtitle"),
    ctaLabel: localizedFromForm(formData, "ctaLabel"),
    ctaHref,
    images: formData
      .getAll("images")
      .map(String)
      .filter((u) => /^\/(brand\/[\w.-]+|api\/media\/[0-9a-f-]{36})$/.test(u))
      .slice(0, 8),
  };

  try {
    await prisma.contentBlock.upsert({
      where: { key: CONTENT_KEYS.homepageHero },
      update: { data },
      create: { key: CONTENT_KEYS.homepageHero, data },
    });
  } catch (err) {
    console.error("[admin] updateHomepageHero failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { saved: true };
}

export async function updateHomepageBanners(formData: FormData): Promise<ContentSaveResult> {
  await requireAdminSession();
  const tiles: (BannerTile | null)[] = [];
  for (let i = 0; i < 3; i++) {
    const title = localizedFromForm(formData, `title${i}`);
    const image = String(formData.get(`image${i}`) ?? "");
    const hrefRaw = String(formData.get(`href${i}`) ?? "").trim();
    // An untouched slot (no title, no image, no link) keeps the built-in tile.
    if (!title.he.trim() && !image && !hrefRaw) {
      tiles.push(null);
      continue;
    }
    if (!title.he.trim()) return { error: `באנר ${i + 1}: יש למלא כותרת בעברית.` };
    if (image && !/^\/(brand\/[\w./-]+|api\/media\/[0-9a-f-]{36})$/.test(image)) {
      return { error: `באנר ${i + 1}: תמונה לא תקינה.` };
    }
    if (!image) return { error: `באנר ${i + 1}: יש לבחור תמונה.` };
    const href = cleanHref(hrefRaw, "/category/all");
    if (!href) return { error: `באנר ${i + 1}: הקישור חייב להתחיל ב-/ או https://` };
    tiles.push({ href, image, title, copy: localizedFromForm(formData, `copy${i}`) });
  }
  const data: HomepageBannersContent = { tiles };
  try {
    await prisma.contentBlock.upsert({
      where: { key: CONTENT_KEYS.homepageBanners },
      update: { data },
      create: { key: CONTENT_KEYS.homepageBanners, data },
    });
  } catch (err) {
    console.error("[admin] updateHomepageBanners failed", err);
    return { error: "השמירה נכשלה. נסו שוב, ואם זה חוזר פנו אלינו." };
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { saved: true };
}
