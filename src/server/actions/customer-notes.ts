"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function addCustomerNote(userId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const session = await getSession();

  await prisma.customerNote.create({
    data: { userId, body, authorId: session?.userId },
  });

  revalidatePath(`/admin/customers/${userId}`);
}
