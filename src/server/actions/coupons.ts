"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/auth/guards";

export type CouponFormResult = { error: string } | { created: true } | undefined;

export async function createCoupon(
  _prevState: CouponFormResult,
  formData: FormData
): Promise<CouponFormResult> {
  await requireAdminSession();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discountType")) as DiscountType;
  const discountValue = Number(formData.get("discountValue"));
  const usageLimitRaw = formData.get("usageLimit");
  const expiresAtRaw = formData.get("expiresAt");
  const affiliateId = String(formData.get("affiliateId") ?? "") || null;

  if (!code) return { error: "יש להזין קוד קופון." };
  if (discountValue < 0) return { error: "ערך ההנחה לא יכול להיות שלילי." };
  if (discountType === "PERCENTAGE" && discountValue > 100) {
    return { error: "אחוז הנחה לא יכול להיות מעל 100%." };
  }

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
  await requireAdminSession();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export type DeleteCouponResult = { error: string } | undefined;

export async function deleteCoupon(id: string): Promise<DeleteCouponResult> {
  await requireAdminSession();

  // Order.couponId is a nullable FK with no onDelete set (defaults to
  // SetNull) — deleting a coupon that's already attached to past orders
  // would silently null out that reference, corrupting the historical
  // "coupon used" record on those orders' detail/report pages with no
  // warning. Deactivating (toggleCoupon) is the safe way to retire a used
  // coupon; deletion is only for coupons that were never actually used.
  const coupon = await prisma.coupon.findUnique({ where: { id }, select: { usageCount: true } });
  if (coupon && coupon.usageCount > 0) {
    return {
      error: `אי אפשר למחוק קופון שכבר נעשה בו שימוש (${coupon.usageCount} פעמים) — יש לכבות אותו במקום.`,
    };
  }

  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
