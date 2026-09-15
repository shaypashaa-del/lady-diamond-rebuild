"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function markMessageRead(id: string, isRead: boolean) {
  await prisma.contactMessage.update({ where: { id }, data: { isRead } });
  revalidatePath("/admin/messages");
}
