import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomDesignAdminForm, GeneratedImageUploadForm } from "@/components/admin/CustomDesignAdminForm";

const JEWELRY_TYPE_LABEL: Record<string, string> = {
  RING: "טבעת",
  NECKLACE: "שרשרת",
  BRACELET: "צמיד",
  EARRINGS: "עגילים",
  OTHER: "אחר",
};

function ImageCard({ title, url }: { title: string; url: string | undefined }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-neutral-500">{title}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={title} className="w-full rounded border border-neutral-200 object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center rounded border border-dashed border-neutral-300 text-xs text-neutral-400">
          לא צורף
        </div>
      )}
    </div>
  );
}

export default async function CustomDesignRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const req = await prisma.customDesignRequest.findUnique({
    where: { id },
    include: { inspirationImage: true, sketchImage: true, generatedImage: true, user: true },
  });
  if (!req) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">בקשת עיצוב — {req.customerName}</h1>
          <p className="text-sm text-neutral-500">
            {JEWELRY_TYPE_LABEL[req.jewelryType] ?? req.jewelryType} · {req.createdAt.toLocaleDateString("he-IL")}
          </p>
        </div>
        <a
          href={`/admin/custom-design-requests/${req.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white"
        >
          יצירת PDF ליציקה
        </a>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="space-y-6 sm:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">פרטי לקוח</h2>
            <p className="text-sm">{req.customerName}</p>
            <p className="text-sm text-neutral-500" dir="ltr">{req.customerEmail}</p>
            {req.customerPhone && <p className="text-sm text-neutral-500" dir="ltr">{req.customerPhone}</p>}
            {req.user && (
              <p className="mt-2 text-xs text-neutral-400">בעל חשבון רשום באתר</p>
            )}
          </div>

          {req.description && (
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">תיאור מהלקוח</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-neutral-700">{req.description}</p>
            </div>
          )}

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">תמונות</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ImageCard title="הדמיית עיצוב (AI/צוות)" url={req.generatedImage?.url} />
              <ImageCard title="תמונת השראה מהלקוח" url={req.inspirationImage?.url} />
              <ImageCard title="שרטוט מהלקוח" url={req.sketchImage?.url} />
            </div>
            <div className="mt-5 border-t border-neutral-200 pt-5">
              <p className="mb-2 text-xs font-medium text-neutral-500">
                העלאת הדמיית עיצוב (עד לחיבור מנוע AI אוטומטי, ההעלאה כאן היא ידנית)
              </p>
              <GeneratedImageUploadForm id={req.id} />
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">ניהול בקשה</h2>
            <CustomDesignAdminForm id={req.id} status={req.status} adminNotes={req.adminNotes} />
          </div>
        </div>
      </div>
    </div>
  );
}
