// Email abstraction: the app never talks to a specific mail provider
// directly. When RESEND_API_KEY is set, mail goes out through Resend;
// otherwise (local dev, or a deployment without a key) it only logs what
// would have been sent. Nothing in checkout/auth code depends on which one
// is active — they all call `emailProvider.send`.

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export const consoleEmailProvider: EmailProvider = {
  async send(message) {
    console.log(`[email] to=${message.to} subject="${message.subject}"\n${message.text}`);
  },
};

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Plain text -> a small, right-to-left HTML mail (the store's mail is Hebrew),
// with bare links made clickable. The text part is sent as well.
function toHtml(text: string) {
  const body = escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#8a6a2c">$1</a>')
    .replace(/\n/g, "<br>");
  return `<div dir="rtl" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#141414;max-width:560px;margin:0 auto;padding:24px"><div style="font-size:20px;letter-spacing:.2em;color:#8a6a2c;margin-bottom:18px">LADY DIAMOND</div>${body}</div>`;
}

// Sends through Resend's REST API (no extra dependency). A mail failure is
// logged but never thrown: it must not break an order or a sign-in flow.
export const resendEmailProvider: EmailProvider = {
  async send(message) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "LADY DIAMOND <diana@ladydiamondjewels.com>";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [message.to],
          reply_to: process.env.EMAIL_REPLY_TO || "diana@ladydiamondjewels.com",
          subject: message.subject,
          text: message.text,
          html: toHtml(message.text),
        }),
      });
      if (!res.ok) {
        console.error(`[email] Resend rejected the message to=${message.to} status=${res.status} ${await res.text()}`);
      }
    } catch (err) {
      console.error(`[email] sending failed to=${message.to}`, err);
    }
  },
};

// Sends through any SMTP mailbox (e.g. the hosting provider's own
// diana@ladydiamondjewels.com mailbox) — no third-party account needed.
// Like Resend above: a failure is logged, never thrown.
export const smtpEmailProvider: EmailProvider = {
  async send(message) {
    try {
      const { createTransport } = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT || 465);
      const transport = createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const info = await transport.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: message.to,
        replyTo: process.env.EMAIL_REPLY_TO || "diana@ladydiamondjewels.com",
        subject: message.subject,
        text: message.text,
        html: toHtml(message.text),
      });
      console.log(`[email] SMTP sent to=${message.to} subject="${message.subject}" accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} response="${info.response}"`);
    } catch (err) {
      console.error(`[email] SMTP sending failed to=${message.to}`, err);
    }
  },
};

// Resend if its key is set, else SMTP if configured, else just log.
export const emailProvider: EmailProvider = process.env.RESEND_API_KEY
  ? resendEmailProvider
  : process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? smtpEmailProvider
    : consoleEmailProvider;
