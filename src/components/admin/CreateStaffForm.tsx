"use client";

import { useActionState } from "react";
import { createStaffUser, type CreateStaffResult } from "@/server/actions/staff";

export function CreateStaffForm() {
  const [state, action, pending] = useActionState<CreateStaffResult | undefined, FormData>(
    createStaffUser,
    undefined
  );

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">
        הוספת איש צוות
      </h2>
      {state && "error" in state && (
        <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "created" in state && (
        <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">נוצר בהצלחה.</p>
      )}
      <form action={action} className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
        <input name="name" placeholder="שם מלא" required className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="email" type="email" placeholder="אימייל" required dir="ltr" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="password" type="password" placeholder="סיסמה" required minLength={8} className="border border-neutral-300 px-3 py-2 text-sm" />
        <select name="role" defaultValue="ADMIN" className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="SUPER_ADMIN">מנהל על</option>
          <option value="ADMIN">מנהל</option>
          <option value="STORE_MANAGER">מנהל חנות</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="col-span-2 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 sm:col-span-4"
        >
          {pending ? "יוצר..." : "יצירת משתמש"}
        </button>
      </form>
    </div>
  );
}
