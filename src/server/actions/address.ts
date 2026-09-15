"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export type AddressData = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  apartment?: string;
  zip?: string;
};

export async function getMyAddress(): Promise<AddressData | null> {
  const session = await getSession();
  if (!session) return null;

  const address = await prisma.address.findFirst({
    where: { userId: session.userId, isDefault: true },
  });
  if (!address) return null;

  return {
    fullName: address.fullName,
    phone: address.phone,
    country: address.country,
    city: address.city,
    street: address.street,
    apartment: address.apartment ?? undefined,
    zip: address.zip ?? undefined,
  };
}

// Called automatically after a successful checkout so the address is ready
// to prefill next time, and directly from /account's edit form.
export async function saveMyAddress(userId: string, data: AddressData) {
  const existing = await prisma.address.findFirst({ where: { userId, isDefault: true } });

  if (existing) {
    await prisma.address.update({ where: { id: existing.id }, data });
  } else {
    await prisma.address.create({ data: { ...data, userId, isDefault: true } });
  }
}

export async function updateMyAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  await saveMyAddress(session.userId, {
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    street: String(formData.get("street") ?? ""),
    apartment: String(formData.get("apartment") ?? "") || undefined,
    zip: String(formData.get("zip") ?? "") || undefined,
  });

  revalidatePath("/account");
}
