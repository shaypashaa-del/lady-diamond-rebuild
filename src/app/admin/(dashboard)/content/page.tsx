import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";

const STANDALONE_SLUGS = new Set(["about-us", "contact-us"]);

export default async function AdminContentPage() {
  const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">תוכן ועמודים סטטיים</h1>
      <p className="mb-6 text-sm text-neutral-500">
        עריכת עמוד הבית ובאנרים תתבסס בהמשך על מודל ה-ContentBlock. להלן עמודי המדיניות/תקנון
        הניתנים לעריכה כבר עכשיו.
      </p>

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
