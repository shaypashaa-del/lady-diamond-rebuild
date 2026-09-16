import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// A bcrypt hash of an unguessable, never-used password — not a secret, just
// a fixed comparison target so `verifyPasswordSafe` always does real bcrypt
// work even when no user record exists.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8h6anytm9wCurotB0oQyGGXQ0.HmT.";

// Login checks normally short-circuit on `!user ||`, skipping bcrypt entirely
// when the email doesn't exist — a lookup-only request returns almost
// instantly while a real user gets the full bcrypt-compare delay, letting an
// attacker enumerate registered emails purely from response timing. Always
// running a real bcrypt compare (against a dummy hash when there's no real
// one) keeps the timing the same either way.
export async function verifyPasswordSafe(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) {
    await bcrypt.compare(plain, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(plain, hash);
}
