import { NextResponse } from "next/server";
import { getClientIp, isRateLimited, recordAttempt } from "@/lib/auth/rate-limit";
import { recordActivity } from "@/server/activity";

// A real "added to cart" / "added to wishlist" from the shop: { v: visitor id, k: kind, s: slug }.
export async function POST(req: Request) {
  let body: { v?: unknown; k?: unknown; s?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const v = typeof body.v === "string" && /^[a-z0-9-]{8,64}$/i.test(body.v) ? body.v : null;
  const k = body.k === "cart" || body.k === "wish" ? body.k : null;
  const s = typeof body.s === "string" && /^[a-z0-9-]{1,120}$/i.test(body.s) ? body.s : null;
  if (!v || !k || !s) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const key = `activity:${await getClientIp()}`;
  if (isRateLimited(key, 60, 60_000)) return NextResponse.json({ ok: false }, { status: 429 });
  recordAttempt(key, 60_000);
  await recordActivity(k, v, s);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
