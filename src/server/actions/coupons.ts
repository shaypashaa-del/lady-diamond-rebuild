"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@/generated/prisma/enums";

export type CouponFormResult = { error: string } | { created: true } | undefined;

export async function createCoupon(
  _prevState: CouponFormResult,
  formData: FormData
): Promise<CouponFormResult> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discountType")) as DiscountType;
  const discountValue = Number(formData.get("discountValue"));
  const usageLimitRaw = formData.get("usageLimit");
  const expiresAtRaw = formData.get("expiresAt");
  const affiliateId = String(formData.get("affiliateId") ?? "") || null;

  if (!code) return { error: "יש להזין קוד קופון." };

  try {
    await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
        expiresAt: expiresAtRaw ? new Date(String(expiresAtRaw)) : null,
        affiliateId,
      },
    });
  } catch {
    return { error: `קוד הקופון "${code}" כבר קיים.` };
  }

  revalidatePath("/admin/coupons");
  return { created: true };
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
