import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CustomDesignAdminForm,
  GeneratedImageUploadForm,
  RenderViewUploadSlot,
  CastingSpecForm,
} from "@/components/admin/CustomDesignAdminForm";
import { deleteCustomDesignRequestAndRedirect } from "@/server/actions/custom-design-admin";
import { ConfirmDeleteForm } from "@/components/admin/ConfirmDeleteForm";

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

  const hasAnyTechnicalDetails =
    req.renderImages.length > 0 || req.gems.length > 0 || req.modelNumber || req.metalType;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">בקשת עיצוב — {req.customerName}</h1>
        <p className="text-sm text-neutral-500">
          {JEWELRY_TYPE_LABEL[req.jewelryType] ?? req.jewelryType} · {req.createdAt.toLocaleDateString("he-IL")}
        </p>
      </div>

      {/* The one thing this page needs to make easy: one click produces a
          clean, ready-to-send PDF from whatever the customer already sent —
          no fields to fill in first. Everything below this is optional
          extra detail for when a real CAD design exists. */}
      <a
        href={`/admin/custom-design-requests/${req.id}/pdf`}
        target="_blank"
        rel="noreferrer"
        className="mb-8 flex items-center justify-between border border-gold-bright bg-ink px-6 py-5 text-paper transition-colors hover:bg-gold-bright hover:text-ink"
      >
        <span>
          <span className="block text-base font-semibold uppercase tracking-wide">יצירת סקיצה מפורטת</span>
          <span className="mt-1 block text-xs opacity-80">
            מסמך PDF מקצועי עם כל פרטי הבקשה, מוכן לשליחה למפעל — בלחיצה אחת
          </span>
        </span>
        <span aria-hidden="true" className="text-2xl">←</span>
      </a>

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
              <ImageCard title="תמונת השראה מהלקוח" url={req.inspirationImage?.url} />
              <ImageCard title="שרטוט מהלקוח" url={req.sketchImage?.url} />
              <ImageCard title="הדמיה שצורפה" url={req.generatedImage?.url} />
            </div>
          </div>

          {/* Collapsed by default — this whole block is only relevant once
              a real design/CAD file exists, which won't be true for most
              requests right after they come in. */}
          <details className="rounded-lg border border-neutral-200 bg-white p-5 [&_summary]:cursor-pointer">
            <summary className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
              {hasAnyTechnicalDetails ? "פרטים טכניים מהמעצב" : "הוספת פרטים טכניים מהמעצב (אופציונלי)"}
            </summary>
            <p className="mb-4 mt-2 text-xs text-neutral-500">
              יש למלא רק אם יש כבר עיצוב סופי — תמונות מתוכנת CAD, משקל זהב מדויק, פירוט אבנים. אם עדיין אין, אפשר
              לדלג ולהפיק את הסקיצה למעלה כמו שהיא.
            </p>

            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
              העלאת הדמיית עיצוב
            </h3>
            <p className="mb-2 text-xs text-neutral-400">
              תמונה בודדת שתופיע כהדמיית העיצוב (ידני כרגע, עד לחיבור מנוע AI אוטומטי)
            </p>
            <GeneratedImageUploadForm id={req.id} />

            <h3 className="mb-1 mt-6 text-xs font-medium uppercase tracking-wide text-neutral-500">
              תצוגות מתוכנת CAD
            </h3>
            <p className="mb-3 text-xs text-neutral-400">
              4 זוויות תצוגה סטנדרטיות (Rhino/Matrix או דומה) — יופיעו יחד בעמוד הראשון של הסקיצה.
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

            <h3 className="mb-1 mt-6 text-xs font-medium uppercase tracking-wide text-neutral-500">
              מספר דגם, משקל זהב ואבנים
            </h3>
            <p className="mb-3 text-xs text-neutral-400">כפי שמופיעים בתוכנת ה-CAD.</p>
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
          </details>
        </div>

        <div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">ניהול בקשה</h2>
            <CustomDesignAdminForm id={req.id} status={req.status} adminNotes={req.adminNotes} />
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <ConfirmDeleteForm
                action={async () => {
                  "use server";
                  await deleteCustomDesignRequestAndRedirect(req.id);
                }}
                confirmMessage={`למחוק את בקשת העיצוב של ${req.customerName}? הפעולה לא ניתנת לביטול.`}
                label="מחיקת בקשה"
                className="text-sm text-rose-600 hover:underline"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
