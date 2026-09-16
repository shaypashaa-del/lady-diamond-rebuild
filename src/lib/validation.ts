// Shared input-validation helpers for customer-facing forms. Kept simple —
// not a full schema-validation layer (no Zod), just the two protections that
// matter most for public-facing Server Actions: rejecting obviously-invalid
// emails (so bad addresses don't pollute customer/subscriber records or
// break future "send email" features) and capping text length (so a
// malformed or malicious submission can't bloat the DB or make the admin
// panel expensive to render).

// Deliberately simple (not RFC 5322-exact) — good enough to reject garbage
// like "a@" or "no-at-sign" without rejecting real addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
