"use client";

import { useActionState } from "react";
import { createCoupon } from "@/server/actions/coupons";

type AffiliateOption = { id: string; code: string; user: { name: string } };

export function CreateCouponForm({ affiliates }: { affiliates: AffiliateOption[] }) {
  const [state, action, pending] = useActionState(createCoupon, undefined);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">קופון חדש</h2>
      {state && "error" in state && (
        <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "created" in state && (
        <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">הקופון נוצר בהצלחה.</p>
      )}
      <form action={action} className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        <input name="code" placeholder="קוד" required dir="ltr" className="border border-neutral-300 px-3 py-2 text-sm" />
        <select name="discountType" className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="PERCENTAGE">אחוז הנחה</option>
          <option value="FIXED">סכום קבוע</option>
        </select>
        <input name="discountValue" type="number" step="0.01" placeholder="ערך" required className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="usageLimit" type="number" placeholder="מגבלת שימושים" className="border border-neutral-300 px-3 py-2 text-sm" />
        <select name="affiliateId" className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="">— ללא שיוך לשותף —</option>
          {affiliates.map((a) => (
            <option key={a.id} value={a.id}>
              {a.user.name} ({a.code})
            </option>
          ))}
        </select>
        <input name="expiresAt" type="date" className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
        <button
          type="submit"
          disabled={pending}
          className="col-span-2 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "יוצר..." : "יצירת קופון"}
        </button>
      </form>
    </div>
  );
}
