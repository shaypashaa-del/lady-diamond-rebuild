// In-memory sliding-window rate limiter for auth-sensitive actions (login,
// password-reset requests) and other unauthenticated, abuse-prone actions
// (contact form, newsletter signup, coupon preview). Deliberately simple and
// dependency-free — fine for a single-instance deployment (matches the same
// tradeoff already documented for local media storage in
// src/server/actions/media.ts); a multi-instance production deployment
// should replace this with a shared store (Redis, etc.) since counters here
// don't cross server processes.

import { headers } from "next/headers";

// Best-effort client IP for rate-limiting anonymous actions that have no
// user/email to key on yet. Untrusted (client-controllable behind a proxy
// that doesn't overwrite it), but raising the bar against casual scripted
// abuse doesn't require a trustworthy identifier — a determined attacker
// can rotate IPs regardless, same limitation as any IP-based limiter.
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  attempts.set(key, timestamps);
  return timestamps.length >= maxAttempts;
}

export function recordAttempt(key: string, windowMs: number = DEFAULT_WINDOW_MS): void {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  attempts.set(key, timestamps);
}
