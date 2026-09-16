"use client";

import { useActionState } from "react";
import { createTag } from "@/server/actions/tags";

export function CreateTagForm() {
  const [state, action, pending] = useActionState(createTag, undefined);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">תגית חדשה</h2>
      {state && "error" in state && (
        <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "created" in state && (
        <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">התגית נוצרה בהצלחה.</p>
      )}
      <form action={action} className="grid max-w-xl grid-cols-3 gap-3">
        <input name="name_he" placeholder="עברית" required className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="name_en" placeholder="English" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="name_ru" placeholder="Русский" className="border border-neutral-300 px-3 py-2 text-sm" />
        <button
          type="submit"
          disabled={pending}
          className="col-span-3 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "יוצר..." : "יצירת תגית"}
        </button>
      </form>
    </div>
  );
}
