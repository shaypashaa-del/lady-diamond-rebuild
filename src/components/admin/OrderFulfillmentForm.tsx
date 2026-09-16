"use client";

import { useActionState } from "react";
import { updateOrderFulfillment } from "@/server/actions/order-management";

export function OrderFulfillmentForm({
  orderId,
  status,
  paymentStatus,
  trackingNumber,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
}) {
  const action = updateOrderFulfillment.bind(null, orderId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}
      {state && "saved" in state && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">ההזמנה עודכנה בהצלחה.</p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">סטטוס הזמנה</label>
        <select name="status" defaultValue={status} className="w-full border border-neutral-300 px-3 py-2 text-sm">
          <option value="PENDING">ממתינה</option>
          <option value="PROCESSING">בטיפול</option>
          <option value="SHIPPED">נשלחה</option>
          <option value="COMPLETED">הושלמה</option>
          <option value="CANCELLED">בוטלה</option>
          <option value="REFUNDED">זוכתה</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">סטטוס תשלום</label>
        <select name="paymentStatus" defaultValue={paymentStatus} className="w-full border border-neutral-300 px-3 py-2 text-sm">
          <option value="PENDING">ממתין</option>
          <option value="PAID">שולם</option>
          <option value="FAILED">נכשל</option>
          <option value="REFUNDED">זוכה</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">מספר מעקב משלוח</label>
        <input
          name="trackingNumber"
          defaultValue={trackingNumber ?? ""}
          dir="ltr"
          className="w-full border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "שומר..." : "שמירת עדכון"}
      </button>
    </form>
  );
}
