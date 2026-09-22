"use client";

import { useActionState, useState } from "react";
import {
  updateCustomDesignRequest,
  uploadGeneratedImage,
  uploadRenderImage,
  deleteRenderImage,
  saveCastingSpec,
} from "@/server/actions/custom-design-admin";

const STATUS_OPTIONS = [
  { value: "NEW", label: "חדשה" },
  { value: "IN_REVIEW", label: "בבדיקה" },
  { value: "GENERATED", label: "הדמיה מוכנה" },
  { value: "SENT_TO_FACTORY", label: "נשלחה למפעל" },
  { value: "COMPLETED", label: "הושלמה" },
  { value: "REJECTED", label: "נדחתה" },
];

export function CustomDesignAdminForm({
  id,
  status,
  adminNotes,
}: {
  id: string;
  status: string;
  adminNotes: string | null;
}) {
  const action = updateCustomDesignRequest.bind(null, id);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "saved" in state && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">העדכון נשמר.</p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">סטטוס</label>
        <select name="status" defaultValue={status} className="w-full border border-neutral-300 px-3 py-2 text-sm">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">הערות פנימיות (למפעל/ליציקה)</label>
        <textarea
          name="adminNotes"
          defaultValue={adminNotes ?? ""}
          rows={4}
          placeholder="למשל: משקל זהב מבוקש, מידת טבעת, הערות יציקה..."
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "שומר..." : "שמירת עדכון"}
      </button>
    </form>
  );
}

export function GeneratedImageUploadForm({ id }: { id: string }) {
  const action = uploadGeneratedImage.bind(null, id);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3">
      {state && "error" in state && (
        <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "uploaded" in state && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">התמונה הועלתה ושויכה לבקשה.</p>
      )}
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        required
        className="block w-full text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded border border-neutral-900 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-50"
      >
        {pending ? "מעלה..." : "העלאת הדמיית עיצוב"}
      </button>
    </form>
  );
}

const VIEW_LABEL_HE: Record<string, string> = {
  Perspective: "פרספקטיבה",
  Front: "חזית",
  Top: "מלמעלה",
  Right: "צד",
};

// One of the 4 standard CAD viewport angles (Perspective / Front / Top /
// Right) — a jeweler's CAD software (Rhino/Matrix) exports exactly this
// 4-view layout, so the casting brief mirrors it instead of showing one
// arbitrary render.
export function RenderViewUploadSlot({
  requestId,
  viewLabel,
  imageUrl,
  renderImageId,
}: {
  requestId: string;
  viewLabel: string;
  imageUrl: string | undefined;
  renderImageId: string | undefined;
}) {
  const uploadAction = uploadRenderImage.bind(null, requestId, viewLabel);
  const [state, formAction, pending] = useActionState(uploadAction, undefined);
  const deleteAction = renderImageId ? deleteRenderImage.bind(null, requestId, renderImageId) : undefined;

  return (
    <div className="border border-neutral-200 p-2">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        {VIEW_LABEL_HE[viewLabel] ?? viewLabel}
      </p>
      {imageUrl ? (
        <div className="space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={viewLabel} className="aspect-square w-full rounded object-cover" />
          {deleteAction && (
            <form action={deleteAction}>
              <button type="submit" className="w-full text-[11px] text-rose-600 hover:underline">
                הסרה
              </button>
            </form>
          )}
        </div>
      ) : (
        <form action={formAction} className="space-y-1.5">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            className="block w-full text-[11px]"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full border border-neutral-300 py-1 text-[11px] text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
          >
            {pending ? "מעלה..." : "העלאה"}
          </button>
        </form>
      )}
      {state && "error" in state && <p className="mt-1 text-[11px] text-rose-600">{state.error}</p>}
    </div>
  );
}

const GEM_SHAPES = [
  "Round",
  "Marquise",
  "Oval",
  "Pear",
  "Princess",
  "Cushion",
  "Emerald",
  "Radiant",
  "Heart",
];

const METAL_TYPES = [
  "Yellow Gold 9K",
  "Yellow Gold 10K",
  "Yellow Gold 14K",
  "Yellow Gold 18K",
  "Yellow Gold 22K",
  "White Gold 9K",
  "White Gold 10K",
  "White Gold 14K",
  "White Gold 18K",
  "Rose Gold 14K",
  "Rose Gold 18K",
  "Platinum 950",
  "Silver 925",
];

// 1 pennyweight (dwt) = 1.55517384 grams — the standard jewelry-trade
// conversion, used the same way the reference CAD software's own "Metal
// Weights" panel shows both units side by side.
const GRAMS_PER_DWT = 1.55517384;

type GemRow = { shape: string; dimensionsMm: string; count: number; caratWeight: number };

export function CastingSpecForm({
  id,
  modelNumber,
  metalType,
  metalWeightGrams,
  metalWeightDwt,
  initialGems,
}: {
  id: string;
  modelNumber: string | null;
  metalType: string | null;
  metalWeightGrams: number | null;
  metalWeightDwt: number | null;
  initialGems: GemRow[];
}) {
  const action = saveCastingSpec.bind(null, id);
  const [state, formAction, pending] = useActionState(action, undefined);

  const [grams, setGrams] = useState(metalWeightGrams != null ? String(metalWeightGrams) : "");
  const [dwt, setDwt] = useState(metalWeightDwt != null ? String(metalWeightDwt) : "");
  const [gems, setGems] = useState<GemRow[]>(
    initialGems.length > 0 ? initialGems : [{ shape: "Round", dimensionsMm: "", count: 1, caratWeight: 0 }]
  );

  function handleGramsChange(value: string) {
    setGrams(value);
    const n = Number(value);
    if (value && !Number.isNaN(n)) setDwt((n / GRAMS_PER_DWT).toFixed(2));
  }

  function updateGem(index: number, patch: Partial<GemRow>) {
    setGems((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addGemRow() {
    setGems((rows) => [...rows, { shape: "Round", dimensionsMm: "", count: 1, caratWeight: 0 }]);
  }

  function removeGemRow(index: number) {
    setGems((rows) => rows.filter((_, i) => i !== index));
  }

  const totalGemCount = gems.reduce((sum, g) => sum + (Number(g.count) || 0), 0);
  const totalGemWeight = gems.reduce((sum, g) => sum + (Number(g.caratWeight) || 0), 0);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "saved" in state && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">הפרטים הטכניים נשמרו.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">מספר דגם</label>
          <input
            key={modelNumber}
            name="modelNumber"
            defaultValue={modelNumber ?? ""}
            dir="ltr"
            placeholder="VN8066"
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">סוג מתכת</label>
          <select
            key={metalType}
            name="metalType"
            defaultValue={metalType ?? ""}
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">— לא נבחר —</option>
            {METAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">משקל מתכת (גרם)</label>
          <input
            name="metalWeightGrams"
            type="number"
            step="0.01"
            min="0"
            value={grams}
            onChange={(e) => handleGramsChange(e.target.value)}
            dir="ltr"
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">משקל מתכת (DWT)</label>
          <input
            name="metalWeightDwt"
            type="number"
            step="0.01"
            min="0"
            value={dwt}
            onChange={(e) => setDwt(e.target.value)}
            dir="ltr"
            className="w-full border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-500">טבלת אבנים (Gem Reporter)</label>
          <button type="button" onClick={addGemRow} className="text-xs text-neutral-600 underline hover:text-neutral-900">
            + הוספת אבן
          </button>
        </div>
        <div className="space-y-2">
          {gems.map((gem, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_70px_80px_24px] gap-2">
              <select
                value={gem.shape}
                onChange={(e) => updateGem(i, { shape: e.target.value })}
                className="border border-neutral-300 px-2 py-1.5 text-xs"
              >
                {GEM_SHAPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                value={gem.dimensionsMm}
                onChange={(e) => updateGem(i, { dimensionsMm: e.target.value })}
                placeholder="13.27 X 6.58"
                dir="ltr"
                className="border border-neutral-300 px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                min="1"
                value={gem.count}
                onChange={(e) => updateGem(i, { count: Number(e.target.value) })}
                dir="ltr"
                className="border border-neutral-300 px-2 py-1.5 text-xs"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={gem.caratWeight}
                onChange={(e) => updateGem(i, { caratWeight: Number(e.target.value) })}
                placeholder="ct"
                dir="ltr"
                className="border border-neutral-300 px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => removeGemRow(i)}
                aria-label="הסרת שורה"
                className="text-neutral-400 hover:text-rose-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          סה&quot;כ {totalGemCount} אבנים · {totalGemWeight.toFixed(2)} קראט
        </p>
      </div>

      <input type="hidden" name="gems" value={JSON.stringify(gems)} />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "שומר..." : "שמירת פרטים טכניים"}
      </button>
    </form>
  );
}
