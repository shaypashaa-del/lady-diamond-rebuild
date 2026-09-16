"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { generateAffiliateCode } from "@/lib/affiliate-code";
import { requireAffiliateSession, requireAdminSession } from "@/lib/auth/guards";
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
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const website = String(formData.get("website") ?? "").trim() || undefined;
  const socialInstagram = String(formData.get("socialInstagram") ?? "").trim() || undefined;
  const socialTiktok = String(formData.get("socialTiktok") ?? "").trim() || undefined;
  const socialFacebook = String(formData.get("socialFacebook") ?? "").trim() || undefined;
  const socialYoutube = String(formData.get("socialYoutube") ?? "").trim() || undefined;
  const promotionMethod = String(formData.get("promotionMethod") ?? "").trim() || undefined;

  if (!name || !email || password.length < 8) {
    return { error: "נא למלא שם, אימייל וסיסמה בת 8 תווים לפחות." };
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "AFFILIATE" || !(await verifyPassword(password, user.passwordHash))) {
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

  await prisma.affiliate.update({
    where: { id },
    data: {
      commissionOverride: commissionOverrideRaw ? Number(commissionOverrideRaw) : null,
      fixedCommission: fixedCommissionRaw ? Number(fixedCommissionRaw) : null,
      tier: tier as "BRONZE" | "SILVER" | "GOLD" | "DIAMOND",
    },
  });
  revalidatePath("/admin/affiliates");
}
