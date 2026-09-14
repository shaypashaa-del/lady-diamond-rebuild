"use client";

import { useActionState } from "react";
import { loginAdmin, type AuthResult } from "@/server/actions/auth";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<AuthResult, FormData>(loginAdmin, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form action={action} className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8">
        <h1 className="mb-1 text-center text-lg font-semibold">ליידי דיאמונד</h1>
        <p className="mb-6 text-center text-xs text-neutral-400">כניסת ניהול</p>

        {state?.error && (
          <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-neutral-500">אימייל</label>
          <input
            name="email"
            type="email"
            required
            dir="ltr"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-neutral-500">סיסמה</label>
          <input
            name="password"
            type="password"
            required
            dir="ltr"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "מתחבר..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
