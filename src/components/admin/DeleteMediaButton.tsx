"use client";

import { useActionState } from "react";
import { deleteMedia } from "@/server/actions/media";

export function DeleteMediaButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(() => deleteMedia(id), undefined);

  return (
    <form action={formAction}>
      <button type="submit" disabled={pending} className="mt-1 text-xs text-rose-600 hover:underline disabled:opacity-50">
        {pending ? "מוחק..." : "מחיקה"}
      </button>
      {state && "error" in state && <p className="mt-1 text-[10px] text-rose-600">{state.error}</p>}
    </form>
  );
}
