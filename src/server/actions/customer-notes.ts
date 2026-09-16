"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requireAdminSession } from "@/lib/auth/guards";

export async function addCustomerNote(userId: string, formData: FormData) {
  await requireAdminSession();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const session = await getSession();

  await prisma.customerNote.create({
    data: { userId, body, authorId: session?.userId },
  });

  revalidatePath(`/admin/customers/${userId}`);
}
