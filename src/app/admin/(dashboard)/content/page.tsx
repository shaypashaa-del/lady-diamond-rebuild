import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";
import { getContentBlock, type AnnouncementBarContent, type HeroContent } from "@/server/actions/content-blocks";
import { CONTENT_KEYS } from "@/lib/content-keys";
import { AnnouncementBarForm, HomepageHeroForm } from "@/components/admin/ContentBlockForms";

const STANDALONE_SLUGS = new Set(["about-us", "contact-us"]);

export default async function AdminContentPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });
  const announcement = await getContentBlock<AnnouncementBarContent>(CONTENT_KEYS.announcementBar);
  const hero = await getContentBlock<HeroContent>(CONTENT_KEYS.homepageHero);

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">תוכן ועמודים סטטיים</h1>
      <p className="mb-6 text-sm text-neutral-500">
        עריכת פס ההודעה ובאנר עמוד הבית, וכן עמודי המדיניות/תקנון הניתנים לעריכה.
      </p>

      <div className="mb-8 space-y-6">
        <AnnouncementBarForm initial={announcement} />
        <HomepageHeroForm initial={hero} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">כותרת</th>
              <th className="px-4 py-3 font-medium">כתובת URL</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{localize(p.title as LocalizedText, "he")}</td>
                <td className="px-4 py-3 text-neutral-500" dir="ltr">
                  {STANDALONE_SLUGS.has(p.slug) ? `/${p.slug}` : `/policies/${p.slug}`}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${p.id}`} className="text-xs text-blue-600 hover:underline">
                    עריכה
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
