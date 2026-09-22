import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CustomDesignAdminForm,
  GeneratedImageUploadForm,
  RenderViewUploadSlot,
  CastingSpecForm,
} from "@/components/admin/CustomDesignAdminForm";

const CAD_VIEW_LABELS = ["Perspective", "Front", "Top", "Right"] as const;

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
    include: {
      inspirationImage: true,
      sketchImage: true,
      generatedImage: true,
      user: true,
      renderImages: { include: { media: true } },
      gems: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!req) notFound();

  const renderByView = new Map(req.renderImages.map((r) => [r.viewLabel, r]));

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
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">תמונות מהלקוח</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ImageCard title="הדמיית עיצוב (ידני / AI בעתיד)" url={req.generatedImage?.url} />
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

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide">תצוגות CAD ליציקה</h2>
            <p className="mb-3 text-xs text-neutral-500">
              4 זוויות התצוגה הסטנדרטיות מתוכנת ה-CAD (Rhino/Matrix או דומה) — יופיעו יחד בעמוד הראשון של ה-PDF.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CAD_VIEW_LABELS.map((label) => {
                const render = renderByView.get(label);
                return (
                  <RenderViewUploadSlot
                    key={label}
                    requestId={req.id}
                    viewLabel={label}
                    imageUrl={render?.media.url}
                    renderImageId={render?.id}
                  />
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide">פרטים טכניים ליציקה</h2>
            <p className="mb-3 text-xs text-neutral-500">
              מספר דגם, משקל מתכת וטבלת אבנים — כפי שמופיעים בפועל בתוכנת ה-CAD (Metal Weights / Gem Reporter).
            </p>
            <CastingSpecForm
              id={req.id}
              modelNumber={req.modelNumber}
              metalType={req.metalType}
              metalWeightGrams={req.metalWeightGrams ? Number(req.metalWeightGrams) : null}
              metalWeightDwt={req.metalWeightDwt ? Number(req.metalWeightDwt) : null}
              initialGems={req.gems.map((g) => ({
                shape: g.shape,
                dimensionsMm: g.dimensionsMm,
                count: g.count,
                caratWeight: Number(g.caratWeight),
              }))}
            />
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
