"use client";

import { useActionState } from "react";
import { uploadMedia } from "@/server/actions/media";

type UploadResult = { error: string } | { uploaded: true } | undefined;

export function MediaUploadForm() {
  const [state, action, pending] = useActionState<UploadResult, FormData>(
    async (_prev, formData) => uploadMedia(formData),
    undefined
  );

  return (
    <form action={action} className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">קובץ תמונה</label>
        <input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">טקסט חלופי (alt)</label>
        <div className="flex gap-2">
          {(["he", "en", "ru"] as const).map((locale) => (
            <div key={locale}>
              <span className="mb-1 block text-[10px] uppercase text-neutral-400">{locale}</span>
              <input
                name={`altText_${locale}`}
                className="w-36 border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "מעלה..." : "העלאה"}
      </button>
      {state && "error" in state && <p className="w-full text-sm text-rose-600">{state.error}</p>}
      {state && "uploaded" in state && (
        <p className="w-full text-sm text-emerald-700">התמונה הועלתה בהצלחה.</p>
      )}
    </form>
  );
}
