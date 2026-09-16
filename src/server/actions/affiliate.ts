"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPasswordSafe } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { generateAffiliateCode } from "@/lib/affiliate-code";
import { requireAffiliateSession, requireAdminSession } from "@/lib/auth/guards";
import { isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";
import { isValidEmail, truncate } from "@/lib/validation";
import type { AuthResult } from "@/server/actions/auth";

const REF_COOKIE = "ld_ref";
const VISITOR_COOKIE = "ld_visitor";
const DEFAULT_ATTRIBUTION_DAYS = 30;

export type AffiliatePaymentDetails = {
  method: "bank_transfer" | "paypal" | "bit";
  accountOwner?: string;
  bankName?: string;
  branchNumber?: string;
  accountNumber?: string;
  paypalEmail?: string;
  bitPhone?: string;
};

export async function getAttributionWindowDays(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "affiliate_attribution_days" } });
  const value = setting?.value;
  return typeof value === "number" ? value : DEFAULT_ATTRIBUTION_DAYS;
}

export async function applyAsAffiliate(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const name = truncate(String(formData.get("name") ?? "").trim(), 200);
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = truncate(String(formData.get("phone") ?? "").trim(), 50) || null;
  const password = String(formData.get("password") ?? "");
  const website = truncate(String(formData.get("website") ?? "").trim(), 300) || undefined;
  const socialInstagram = truncate(String(formData.get("socialInstagram") ?? "").trim(), 200) || undefined;
  const socialTiktok = truncate(String(formData.get("socialTiktok") ?? "").trim(), 200) || undefined;
  const socialFacebook = truncate(String(formData.get("socialFacebook") ?? "").trim(), 200) || undefined;
  const socialYoutube = truncate(String(formData.get("socialYoutube") ?? "").trim(), 200) || undefined;
  const promotionMethod = truncate(String(formData.get("promotionMethod") ?? "").trim(), 2000) || undefined;

  if (!name || !email || password.length < 8) {
    return { error: "נא למלא שם, אימייל וסיסמה בת 8 תווים לפחות." };
  }
  if (!isValidEmail(email)) {
    return { error: "כתובת אימייל לא תקינה." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "כתובת האימייל כבר רשומה במערכת." };
  }

  const code = await generateAffiliateCode();
  const autoApproveSetting = await prisma.setting.findUnique({ where: { key: "affiliate_auto_approve" } });
  const autoApprove = autoApproveSetting?.value === true;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "AFFILIATE",
      affiliate: {
        create: {
          code,
          website,
          socialInstagram,
          socialTiktok,
          socialFacebook,
          socialYoutube,
          promotionMethod,
          status: autoApprove ? "APPROVED" : "PENDING",
          approvedAt: autoApprove ? new Date() : null,
        },
      },
    },
  });

  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect("/affiliate/dashboard");
}

export async function loginAffiliate(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const rateLimitKey = `login:${email}`;
  if (isRateLimited(rateLimitKey)) {
    return { error: "יותר מדי ניסיונות התחברות. יש לנסות שוב בעוד כמה דקות." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const roleOk = !!user && user.role === "AFFILIATE";
  const passwordOk = await verifyPasswordSafe(password, user?.passwordHash);
  if (!user || !roleOk || !passwordOk) {
    recordAttempt(rateLimitKey);
    return { error: "אימייל או סיסמה שגויים." };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect("/affiliate/dashboard");
}

// Called client-side (via ReferralCapture) when a page loads with ?ref=CODE.
// Records a click (deduped per visitor per day) and sets the attribution cookie.
export async function trackReferral(code: string, landingPage: string, utm: Record<string, string | null>) {
  const affiliate = await prisma.affiliate.findUnique({ where: { code } });
  if (!affiliate || affiliate.status !== "APPROVED") return;

  const store = await cookies();
  let visitorId = store.get(VISITOR_COOKIE)?.value;
  if (!visitorId) {
    visitorId = randomUUID();
    store.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  const attributionDays = await getAttributionWindowDays();
  store.set(REF_COOKIE, affiliate.code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * attributionDays,
  });

  const recentClick = await prisma.affiliateClick.findFirst({
    where: { affiliateId: affiliate.id, sessionId: visitorId },
    orderBy: { createdAt: "desc" },
  });
  const isNewSession =
    !recentClick || Date.now() - recentClick.createdAt.getTime() > 1000 * 60 * 30; // 30 min dedup window

  if (isNewSession) {
    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        landingPage,
        sessionId: visitorId,
        utmSource: utm.utm_source ?? null,
        utmMedium: utm.utm_medium ?? null,
        utmCampaign: utm.utm_campaign ?? null,
      },
    });
  }
}

// --- Admin actions ---

export async function approveAffiliate(id: string) {
  await requireAdminSession();
  await prisma.affiliate.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date() } });
  revalidatePath("/admin/affiliates");
}

export async function rejectAffiliate(id: string) {
  await requireAdminSession();
  await prisma.affiliate.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/affiliates");
}

export async function suspendAffiliate(id: string) {
  await requireAdminSession();
  await prisma.affiliate.update({ where: { id }, data: { status: "SUSPENDED" } });
  revalidatePath("/admin/affiliates");
}

export async function reactivateAffiliate(id: string) {
  await requireAdminSession();
  await prisma.affiliate.update({ where: { id }, data: { status: "APPROVED" } });
  revalidatePath("/admin/affiliates");
}

export async function updateMyPaymentDetails(formData: FormData) {
  const session = await requireAffiliateSession();
  const method = String(formData.get("method") ?? "bank_transfer") as AffiliatePaymentDetails["method"];

  const details: AffiliatePaymentDetails = {
    method,
    accountOwner: String(formData.get("accountOwner") ?? "").trim() || undefined,
    bankName: String(formData.get("bankName") ?? "").trim() || undefined,
    branchNumber: String(formData.get("branchNumber") ?? "").trim() || undefined,
    accountNumber: String(formData.get("accountNumber") ?? "").trim() || undefined,
    paypalEmail: String(formData.get("paypalEmail") ?? "").trim() || undefined,
    bitPhone: String(formData.get("bitPhone") ?? "").trim() || undefined,
  };

  await prisma.affiliate.update({
    where: { userId: session.userId },
    data: { paymentDetails: details },
  });

  revalidatePath("/affiliate/dashboard");
}

export async function updateAffiliateCommission(id: string, formData: FormData) {
  await requireAdminSession();
  const commissionOverrideRaw = formData.get("commissionOverride");
  const fixedCommissionRaw = formData.get("fixedCommission");
  const tier = String(formData.get("tier") ?? "BRONZE");

  // A negative override/fixed amount would make calculateCommission return a
  // negative commission, corrupting payout totals — clamp to zero rather
  // than trust the raw input.
  const commissionOverride = commissionOverrideRaw ? Math.max(0, Number(commissionOverrideRaw)) : null;
  const fixedCommission = fixedCommissionRaw ? Math.max(0, Number(fixedCommissionRaw)) : null;

  await prisma.affiliate.update({
    where: { id },
    data: {
      commissionOverride,
      fixedCommission,
      tier: tier as "BRONZE" | "SILVER" | "GOLD" | "DIAMOND",
    },
  });
  revalidatePath("/admin/affiliates");
}
