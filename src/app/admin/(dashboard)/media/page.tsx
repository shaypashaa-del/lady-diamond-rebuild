import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";
import { AdminPager } from "@/components/admin/AdminPager";

const PAGE_SIZE = 60;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const parsedPage = Number.parseInt(pageRaw ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [media, totalCount] = await Promise.all([
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.mediaAsset.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">מדיה</h1>
      <p className="mb-6 text-sm text-neutral-500">
        תמונות מועלות נשמרות מקומית בסביבת הפיתוח. בפריסה אמיתית יש להחליף באחסון קבצים
        אמיתי (S3, Cloudinary וכו&apos;).
      </p>

      <MediaUploadForm />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="relative aspect-square bg-neutral-100">
              <Image src={m.url} alt={m.altText ?? m.filename} fill sizes="200px" className="object-cover" />
            </div>
            <div className="p-2">
              <p className="truncate text-xs text-neutral-500">{m.filename}</p>
              <DeleteMediaButton id={m.id} />
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-neutral-400">אין תמונות עדיין.</p>
        )}
      </div>
      <AdminPager page={page} totalPages={totalPages} basePath="/admin/media" />
    </div>
  );
}
