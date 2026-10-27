"use client";

import Link from "next/link";
import { useEffect } from "react";

// Shown instead of a blank/black browser error page when an admin screen fails. It tells
// the user what happened in plain Hebrew and shows the technical detail so it can be
// sent to support with a screenshot.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin] screen error", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e8dcc0] bg-white p-6 text-center shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)]">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#b08d3c]">LADY DIAMOND</p>
        <h1 className="mt-3 text-lg font-semibold text-neutral-900">משהו השתבש בטעינת המסך</h1>
        <p className="mt-2 text-sm text-neutral-600">אפשר לנסות שוב. אם זה חוזר, שלחו צילום מסך של ההודעה הזו.</p>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={() => reset()} className="min-h-11 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            נסו שוב
          </button>
          <Link href="/admin" className="flex min-h-11 items-center justify-center rounded border border-neutral-300 px-4 py-2 text-sm">
            חזרה ללוח הבקרה
          </Link>
        </div>
        <div className="mt-5 rounded bg-neutral-50 p-3 text-start text-[11px] leading-relaxed text-neutral-500" dir="ltr">
          <p className="break-words">{error.message || "Unknown error"}</p>
          {error.digest && <p className="mt-1">Digest: {error.digest}</p>}
        </div>
      </div>
    </div>
  );
}
