"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export type OrderFulfillmentResult = { error: string } | { saved: true } | undefined;

export async function updateOrderFulfillment(
  id: string,
  _prevState: OrderFulfillmentResult,
  formData: FormData
): Promise<OrderFulfillmentResult> {
  const status = String(formData.get("status")) as OrderStatus;
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "") || null;

  await prisma.order.update({
    where: { id },
    data: { status, paymentStatus, trackingNumber },
  });

  // If an order tied to an affiliate gets cancelled/refunded, reject its
  // pending commission rather than leaving it payable (spec: "Refund מבטל
  // או מתאים Commission").
  if (status === "CANCELLED" || status === "REFUNDED") {
    await prisma.commission.updateMany({
      where: { orderId: id, status: "PENDING" },
      data: { status: "REJECTED" },
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { saved: true };
}
