import { prisma } from "@/lib/prisma";

// Generates a unique code like "LD482913" (matches the pattern implied by the
// project spec's example "LD123"), retrying on the rare collision.
export async function generateAffiliateCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `LD${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = await prisma.affiliate.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique affiliate code");
}
