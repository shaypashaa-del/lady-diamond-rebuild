// In-memory sliding-window rate limiter for auth-sensitive actions (login,
// password-reset requests). Deliberately simple and dependency-free — fine
// for a single-instance deployment (matches the same tradeoff already
// documented for local media storage in src/server/actions/media.ts); a
// multi-instance production deployment should replace this with a shared
// store (Redis, etc.) since counters here don't cross server processes.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  attempts.set(key, timestamps);
  return timestamps.length >= MAX_ATTEMPTS;
}

export function recordAttempt(key: string): void {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  attempts.set(key, timestamps);
}
