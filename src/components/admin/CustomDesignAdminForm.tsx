"use client";

import { useActionState } from "react";
import { updateCustomDesignRequest, uploadGeneratedImage } from "@/server/actions/custom-design-admin";

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
