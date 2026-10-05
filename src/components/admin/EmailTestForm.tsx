"use client";

import { useActionState } from "react";
import { sendTestEmail } from "@/server/actions/email-test";

export function EmailTestForm() {
  const [state, action, pending] = useActionState(sendTestEmail, undefined);
  return (
    <form action={action} className="mt-8 max-w-xl rounded-lg border border-neutral-200 bg-white p-6">
      <h2 className="mb-1 text-sm font-semibold">בדיקת שליחת מייל</h2>
      <p className="mb-4 text-xs text-neutral-500">שולח מייל בדיקה ומציג בדיוק מה ענה שרת הדואר.</p>
      <div className="flex gap-2">
        <input
          name="to"
          type="email"
          dir="ltr"
          required
          placeholder="you@example.com"
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <button disabled={pending} className="rounded bg-neutral-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {pending ? "שולח…" : "שלח בדיקה"}
        </button>
      </div>
      {state && (
        <p
          role="status"
          dir="auto"
          className={`mt-3 break-words rounded px-3 py-2 text-xs ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}
        >
          {state.text}
        </p>
      )}
    </form>
  );
}
