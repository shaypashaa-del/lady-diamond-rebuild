"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function approveCommission(id: string) {
  await prisma.commission.update({ where: { id }, data: { status: "APPROVED" } });
  revalidatePath("/admin/commissions");
}

export async function rejectCommission(id: string) {
  await prisma.commission.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/commissions");
}

// Marks every APPROVED (unpaid) commission for one affiliate as PAID and
// records a Payout row with their total — matches spec: "Admin יכול לסמן
// Commission כ-Paid... שמור Payment History".
export async function payoutAffiliate(affiliateId: string) {
  const commissions = await prisma.commission.findMany({
    where: { affiliateId, status: "APPROVED", payoutId: null },
  });
  if (commissions.length === 0) return;

  const total = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

  const payout = await prisma.payout.create({
    data: {
      affiliateId,
      amount: total,
      status: "PAID",
      paidAt: new Date(),
    },
  });

  await prisma.commission.updateMany({
    where: { id: { in: commissions.map((c) => c.id) } },
    data: { status: "PAID", payoutId: payout.id },
  });

  revalidatePath("/admin/commissions");
}
