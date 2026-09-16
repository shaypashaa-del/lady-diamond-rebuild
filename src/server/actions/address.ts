"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { upsertAddress, type AddressData } from "@/lib/address-service";

export type { AddressData };

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

export async function updateMyAddressAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  await upsertAddress(session.userId, {
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
