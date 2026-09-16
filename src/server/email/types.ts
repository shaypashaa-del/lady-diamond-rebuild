// Email abstraction: the app never talks to a specific mail provider
// directly. No real provider (Resend, SendGrid, SES, etc.) is wired up yet —
// see README "Known gaps" — so the only implementation today just logs what
// would have been sent, and email links (password reset) fall back to
// showing the link inline in a dev-only response instead. A real provider
// can be added later by implementing this same interface; nothing in
// checkout/auth code needs to change — swap the `emailProvider` export.

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

export const emailProvider: EmailProvider = consoleEmailProvider;
