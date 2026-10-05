"use client";

import { useActionState } from "react";

export type SaveResult = { saved: true } | { error: string } | undefined;

// A form for admin actions that report a result: shows a clear "saved" or
// error message under the button instead of leaving the admin to guess
// whether anything happened (plain <form action> with a void action gives no
// feedback at all).
export function SavableForm({
  action,
  className,
  children,
  submitLabel = "שמירה",
  buttonClassName = "rounded bg-neutral-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50",
}: {
  action: (formData: FormData) => Promise<SaveResult>;
  className?: string;
  children: React.ReactNode;
  submitLabel?: string;
  buttonClassName?: string;
}) {
  const [state, formAction, pending] = useActionState<SaveResult, FormData>(
    async (_prev, formData) => action(formData),
    undefined
  );
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClassName}>
          {pending ? "שומר…" : submitLabel}
        </button>
        {!pending && state && "saved" in state && (
          <span role="status" className="text-sm text-emerald-700">
            ✓ נשמר בהצלחה
          </span>
        )}
        {!pending && state && "error" in state && (
          <span role="alert" className="text-sm text-rose-600">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
