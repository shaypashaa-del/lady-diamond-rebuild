"use client";

import { useActionState } from "react";
import { createShippingRule } from "@/server/actions/shipping";

export function CreateShippingRuleForm() {
  const [state, action, pending] = useActionState(createShippingRule, undefined);

  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-700">כלל חדש</h2>
      {state && "error" in state && (
        <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "created" in state && (
        <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">כלל המשלוח נוצר בהצלחה.</p>
      )}
      <form action={action} className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-5">
        <input name="name" placeholder="שם" required className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
        <select name="type" className="border border-neutral-300 px-3 py-2 text-sm">
          <option value="FREE">משלוח חינם</option>
          <option value="FLAT_RATE">תעריף אחיד</option>
          <option value="BY_COUNTRY">לפי מדינה</option>
          <option value="BY_ORDER_VALUE">לפי סכום הזמנה</option>
        </select>
        <input name="country" placeholder="מדינה (אם רלוונטי)" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="minOrderValue" type="number" placeholder="סכום מינימלי" className="border border-neutral-300 px-3 py-2 text-sm" />
        <input name="price" type="number" step="0.01" placeholder="מחיר" className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
        <button
          type="submit"
          disabled={pending}
          className="col-span-2 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "מוסיף..." : "הוספת כלל"}
        </button>
      </form>
    </div>
  );
}
