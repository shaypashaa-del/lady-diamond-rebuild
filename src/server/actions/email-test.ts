"use server";

import { requireAdminSession } from "@/lib/auth/guards";

// Admin-only diagnostic: sends one test mail through the configured SMTP
// mailbox and reports exactly what the mail server answered, so a delivery
// problem can be seen on screen instead of in server logs.
export async function sendTestEmail(
  _prev: { text: string; ok: boolean } | undefined,
  formData: FormData
): Promise<{ text: string; ok: boolean }> {
  await requireAdminSession();
  const to = String(formData.get("to") ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { ok: false, text: "כתובת אימייל לא תקינה." };

  const mode = process.env.RESEND_API_KEY ? "Resend" : process.env.SMTP_HOST ? "SMTP" : "none";
  if (mode === "Resend") return { ok: false, text: "מוגדר Resend. בדיקה זו מיועדת ל-SMTP." };
  if (mode === "none" || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return {
      ok: false,
      text: `לא מוגדר SMTP בשרת. חסר: ${["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]).join(", ")}`,
    };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  try {
    const { createTransport } = await import("nodemailer");
    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 15000,
      socketTimeout: 20000,
    });
    await transport.verify();
    const info = await transport.sendMail({
      from,
      to,
      subject: "בדיקת מייל — LADY DIAMOND",
      text: "זהו מייל בדיקה מהאתר. אם הוא הגיע, שליחת המיילים עובדת.",
    });
    return {
      ok: info.rejected.length === 0,
      text: `השרת קיבל את ההודעה. נמען מאושר: ${JSON.stringify(info.accepted)}; נדחה: ${JSON.stringify(info.rejected)}; תשובה: ${info.response}. נשלח מ: ${from}`,
    };
  } catch (err) {
    const e = err as { message?: string; code?: string; response?: string };
    return { ok: false, text: `השליחה נכשלה: ${e.code ?? ""} ${e.message ?? String(err)} ${e.response ?? ""}`.trim() };
  }
}
