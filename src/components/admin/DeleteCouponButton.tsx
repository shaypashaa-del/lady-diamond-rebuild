"use client";

import { useActionState } from "react";
import { deleteCoupon } from "@/server/actions/coupons";

export function DeleteCouponButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(() => deleteCoupon(id), undefined);

  return (
    <form action={formAction}>
      <button type="submit" disabled={pending} className="text-xs text-rose-600 hover:underline disabled:opacity-50">
        {pending ? "מוחק..." : "מחיקה"}
      </button>
      {state && "error" in state && <p className="mt-1 max-w-[160px] text-[10px] text-rose-600">{state.error}</p>}
    </form>
  );
}
