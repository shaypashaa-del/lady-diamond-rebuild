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
import { getClientIp, isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";
import { emailProvider } from "@/server/email/types";
import { SITE_URL } from "@/lib/site-config";
import { isValidEmail, truncate } from "@/lib/validation";
import type { AuthResult } from "@/server/actions/auth";

const REF_COOKIE = "ld_ref";
const VISITOR_COOKIE = "ld_visitor";
const DEFAULT_ATTRIBUTION_DAYS = 30;
const OWNER_EMAIL = process.env.EMAIL_REPLY_TO || "diana@ladydiamondjewels.com";

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

  const values = { name, email, phone: phone ?? "", website: website ?? "", socialInstagram: socialInstagram ?? "", socialTiktok: socialTiktok ?? "", socialFacebook: socialFacebook ?? "", promotionMethod: promotionMethod ?? "" };
  if (!name || !email || password.length < 8) {
    return { values, error: "נא למלא שם, אימייל וסיסמה בת 8 תווים לפחות." };
  }
  if (!isValidEmail(email)) {
    return { values, error: "כתובת אימייל לא תקינה." };
  }

  const ipKey = `affiliate-apply-ip:${await getClientIp()}`;
  if (isRateLimited(ipKey, 10)) {
    return { values, error: "יותר מדי ניסיונות. יש לנסות שוב בעוד כמה דקות." };
  }
  recordAttempt(ipKey);

  const existing = await prisma.user.findUnique({ where: { email }, include: { affiliate: true } });
  // Someone who already has a shop account (role CUSTOMER) may become an affiliate with
  // the same email, but only by proving it is theirs with the existing password.
  const upgradeable = !!existing && existing.role === "CUSTOMER" && !existing.affiliate;
  if (existing && !(upgradeable && (await verifyPasswordSafe(password, existing.passwordHash)))) {
    return {
      values,
      error: upgradeable
        ? "כתובת האימייל כבר רשומה כלקוח. כדי להצטרף כשותף עם אותו אימייל, הזינו את הסיסמה הקיימת שלכם."
        : "כתובת האימייל כבר רשומה במערכת.",
    };
  }

  const code = await generateAffiliateCode();
  const autoApproveSetting = await prisma.setting.findUnique({ where: { key: "affiliate_auto_approve" } });
  const autoApprove = autoApproveSetting?.value === true;
  const affiliateData = {
    code,
    website,
    socialInstagram,
    socialTiktok,
    socialFacebook,
    socialYoutube,
    promotionMethod,
    status: autoApprove ? ("APPROVED" as const) : ("PENDING" as const),
    approvedAt: autoApprove ? new Date() : null,
  };

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { role: "AFFILIATE", phone: existing.phone ?? phone, affiliate: { create: affiliateData } },
      })
    : await prisma.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash: await hashPassword(password),
          role: "AFFILIATE",
          affiliate: { create: affiliateData },
        },
      });

  // Email failures are logged by the provider and never block the signup.
  await emailProvider.send({
    to: OWNER_EMAIL,
    subject: `בקשת שותפות חדשה — ${name}`,
    text: [
      `התקבלה בקשת הצטרפות לתוכנית השותפים${autoApprove ? " (אושרה אוטומטית)" : " וממתינה לאישור"}.`,
      "",
      `שם: ${name}`,
      `אימייל: ${email}`,
      phone ? `טלפון: ${phone}` : "",
      website ? `אתר: ${website}` : "",
      socialInstagram ? `אינסטגרם: ${socialInstagram}` : "",
      socialTiktok ? `טיקטוק: ${socialTiktok}` : "",
      socialFacebook ? `פייסבוק: ${socialFacebook}` : "",
      promotionMethod ? `איך יקדמו: ${promotionMethod}` : "",
      "",
      `לאישור: ${SITE_URL}/admin/affiliates`,
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n"),
  });
  await emailProvider.send({
    to: email,
    subject: autoApprove ? "ברוכים הבאים לתוכנית השותפים של Lady Diamond" : "קיבלנו את בקשת השותפות שלך",
    text: autoApprove
      ? `היי ${name},\n\nהצטרפת לתוכנית השותפים. הקישור האישי שלך:\n${SITE_URL}/?ref=${code}\n\nלאזור האישי: ${SITE_URL}/affiliate/login`
      : `היי ${name},\n\nקיבלנו את הבקשה שלך. נעבור עליה ונעדכן אותך במייל ברגע שתאושר.\n\nLady Diamond`,
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
  const ipKey = `login-ip:${await getClientIp()}`;
  const values = { email };
  if (isRateLimited(rateLimitKey) || isRateLimited(ipKey, 20)) {
    return { values, error: "יותר מדי ניסיונות התחברות. יש לנסות שוב בעוד כמה דקות." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const roleOk = !!user && user.role === "AFFILIATE";
  const passwordOk = await verifyPasswordSafe(password, user?.passwordHash);
  if (!user || !roleOk || !passwordOk) {
    recordAttempt(rateLimitKey);
    recordAttempt(ipKey);
    return { values, error: "אימייל או סיסמה שגויים." };
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
  const before = await prisma.affiliate.findUnique({ where: { id }, select: { status: true } });
  const updated = await prisma.affiliate.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
    include: { user: { select: { email: true, name: true } } },
  });
  // Tell the applicant (the signup page promised an email). Not repeated if it was
  // already approved, and a send failure never blocks the approval.
  if (before?.status !== "APPROVED") {
    await emailProvider.send({
      to: updated.user.email,
      subject: "בקשת השותפות שלך אושרה — Lady Diamond",
      text: `היי ${updated.user.name},\n\nהבקשה שלך לתוכנית השותפים אושרה.\n\nהקישור האישי שלך:\n${SITE_URL}/?ref=${updated.code}\n\nלאזור האישי (סטטיסטיקות, עמלות ופרטי תשלום):\n${SITE_URL}/affiliate/login\n\nLady Diamond`,
    });
  }
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
