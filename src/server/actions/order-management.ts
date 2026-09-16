"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/auth/guards";
import { emailProvider } from "@/server/email/types";

export type OrderFulfillmentResult = { error: string } | { saved: true } | undefined;

const RETURNED_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED"];

export async function updateOrderFulfillment(
  id: string,
  _prevState: OrderFulfillmentResult,
  formData: FormData
): Promise<OrderFulfillmentResult> {
  await requireAdminSession();
  const status = String(formData.get("status")) as OrderStatus;
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "") || null;

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { items: true, commission: true },
  });
  if (!existing) return { error: "ההזמנה לא נמצאה." };

  const wasReturned = RETURNED_STATUSES.includes(existing.status);
  const isReturned = RETURNED_STATUSES.includes(status);

  try {
    await prisma.$transaction(async (tx) => {
      // Cancelling/refunding an order puts its stock back on the shelf — it
      // was decremented at checkout but never actually kept by the customer.
      // Reversing a cancellation (re-activating the order) re-decrements it,
      // guarded the same way checkout is, so it can't oversell stock that
      // was sold to someone else in the meantime.
      if (!wasReturned && isReturned) {
        for (const item of existing.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { inventory: { increment: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { inventory: { increment: item.quantity } },
            });
          }
        }
      } else if (wasReturned && !isReturned) {
        for (const item of existing.items) {
          if (item.variantId) {
            const result = await tx.productVariant.updateMany({
              where: { id: item.variantId, inventory: { gte: item.quantity } },
              data: { inventory: { decrement: item.quantity } },
            });
            if (result.count === 0) {
              throw new Error(`אין מספיק מלאי כדי להחזיר הזמנה זו לסטטוס פעיל: "${item.nameSnapshot}".`);
            }
          } else {
            const result = await tx.product.updateMany({
              where: { id: item.productId, inventory: { gte: item.quantity } },
              data: { inventory: { decrement: item.quantity } },
            });
            if (result.count === 0) {
              throw new Error(`אין מספיק מלאי כדי להחזיר הזמנה זו לסטטוס פעיל: "${item.nameSnapshot}".`);
            }
          }
        }
      }

      await tx.order.update({
        where: { id },
        data: { status, paymentStatus, trackingNumber },
      });

      // Mirror the same reversal for commission: cancelling/refunding rejects
      // a pending commission (spec: "Refund מבטל או מתאים Commission");
      // un-cancelling restores it so the affiliate isn't silently docked for
      // an admin's corrected mistake. A commission already APPROVED/PAID by
      // the time of a later refund is intentionally left untouched — money
      // already paid out can't be un-paid programmatically, and admins
      // should treat that as a manual reconciliation case (flagged in the UI).
      if (!wasReturned && isReturned) {
        await tx.commission.updateMany({
          where: { orderId: id, status: "PENDING" },
          data: { status: "REJECTED" },
        });
      } else if (wasReturned && !isReturned && existing.commission?.status === "REJECTED") {
        await tx.commission.update({
          where: { id: existing.commission.id },
          data: { status: "PENDING" },
        });
      }
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "אירעה שגיאה בעדכון ההזמנה." };
  }

  if (status !== existing.status && (status === "SHIPPED" || status === "COMPLETED")) {
    await emailProvider.send({
      to: existing.email,
      subject: `הזמנה ${existing.orderNumber} ${status === "SHIPPED" ? "נשלחה" : "הושלמה"} — ליידי דיאמונד`,
      text:
        status === "SHIPPED"
          ? `ההזמנה שלך ${existing.orderNumber} נשלחה בדרך אליך.${trackingNumber ? ` מספר מעקב: ${trackingNumber}` : ""}`
          : `ההזמנה שלך ${existing.orderNumber} הושלמה. תודה שקנית אצלנו!`,
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/commissions");
  return { saved: true };
}
