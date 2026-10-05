"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type RequestResetResult } from "@/server/actions/password-reset";

// Reuses the same requestPasswordReset action as the customer-facing flow
// (src/server/actions/password-reset.ts) — it looks a user up by email
// regardless of role, so an admin account works here exactly the same way.
// Only the page's styling is admin-specific, to match /admin/login instead
// of the public site's theme.
export default function AdminForgotPasswordPage() {
  const [state, action, pending] = useActionState<RequestResetResult | undefined, FormData>(
    requestPasswordReset,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8">
        <h1 className="mb-1 text-center text-lg font-semibold">LADY DIAMOND</h1>
        <p className="mb-6 text-center text-xs text-neutral-400">שחזור סיסמת ניהול</p>

        {state && "error" in state && (
          <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
        )}

        {state && "sent" in state ? (
          <div>
            <p className="mb-4 rounded bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
              אם קיים חשבון עם האימייל הזה, נשלח אליו קישור לאיפוס סיסמה (בתוקף לשעה אחת).
            </p>
            {state.resetLink && (
              <div className="mb-4 rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                <p className="mb-1 font-medium">מצב פיתוח בלבד — קישור ישיר:</p>
                <a href={state.resetLink} className="break-all text-blue-700 underline" dir="ltr">
                  {state.resetLink}
                </a>
              </div>
            )}
            <p className="text-xs text-neutral-400">
              לא הגיע מייל? בדקו בתיקיית הספאם. אם עדיין לא, ייתכן שהגדרות הדוא&quot;ל בשרת שגויות —
              שגיאת השליחה נרשמת בלוגים (hPanel → Runtime logs).
            </p>
          </div>
        ) : (
          <form action={action}>
            <div className="mb-6">
              <label className="mb-1 block text-xs font-medium text-neutral-500">אימייל</label>
              <input
                name="email"
                type="email"
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
              {pending ? "שולח..." : "שליחת קישור איפוס"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link href="/admin/login" className="font-medium text-neutral-900 hover:underline">
            חזרה לכניסה
          </Link>
        </p>
      </div>
    </div>
  );
}
