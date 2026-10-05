"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";

export async function approveCommission(id: string) {
  await requireAdminSession();
  // Only a PENDING commission can be approved (an already paid one must not be reopened).
  await prisma.commission.updateMany({ where: { id, status: "PENDING" }, data: { status: "APPROVED" } });
  revalidatePath("/admin/commissions");
}

export async function rejectCommission(id: string) {
  await requireAdminSession();
  await prisma.commission.updateMany({ where: { id, status: { in: ["PENDING", "APPROVED"] } }, data: { status: "REJECTED" } });
  revalidatePath("/admin/commissions");
}

// Marks every APPROVED (unpaid) commission for one affiliate as PAID and
// records a Payout row with their total — matches spec: "Admin יכול לסמן
// Commission כ-Paid... שמור Payment History".
export async function payoutAffiliate(affiliateId: string) {
  await requireAdminSession();
  // One transaction that claims the commissions first: a double click or two
  // admins paying at once cannot pay the same commission twice (the second
  // claim matches zero rows and creates no payout).
  await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: { affiliateId, amount: 0, status: "PAID", paidAt: new Date() },
    });
    const claimed = await tx.commission.updateMany({
      where: { affiliateId, status: "APPROVED", payoutId: null },
      data: { status: "PAID", payoutId: payout.id },
    });
    if (claimed.count === 0) {
      await tx.payout.delete({ where: { id: payout.id } });
      return;
    }
    const paid = await tx.commission.findMany({ where: { payoutId: payout.id }, select: { amount: true } });
    await tx.payout.update({
      where: { id: payout.id },
      data: { amount: paid.reduce((sum, c) => sum + Number(c.amount), 0) },
    });
  });

  revalidatePath("/admin/commissions");
}
