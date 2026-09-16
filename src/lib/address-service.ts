import { prisma } from "@/lib/prisma";

export type AddressData = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  apartment?: string;
  zip?: string;
};

// Plain (non "use server") module so this can only be called from trusted
// server code that already resolved `userId` itself (e.g. from a session) —
// never exported as a directly-invokable Server Action RPC, which would let
// a caller overwrite an arbitrary user's address by passing any userId.
export async function upsertAddress(userId: string, data: AddressData) {
  const existing = await prisma.address.findFirst({ where: { userId, isDefault: true } });

  if (existing) {
    await prisma.address.update({ where: { id: existing.id }, data });
  } else {
    await prisma.address.create({ data: { ...data, userId, isDefault: true } });
  }
}
