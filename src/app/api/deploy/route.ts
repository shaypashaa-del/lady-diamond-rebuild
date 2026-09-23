import { spawn } from "node:child_process";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

// GitHub webhook target: Settings → Webhooks → Add webhook, payload URL
// https://<domain>/api/deploy, content type application/json, secret =
// DEPLOY_WEBHOOK_SECRET, event = "Just the push event". On a verified push
// to main, spawns `npm run deploy` (git pull + npm ci + npm run build) as a
// detached process so this request can respond before the build (which may
// restart this very server) finishes, then touches tmp/restart.txt — the
// file Phusion Passenger watches to recycle the app.
export async function POST(req: Request) {
  const secret = process.env.DEPLOY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "DEPLOY_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const signatureHeader = req.headers.get("x-hub-signature-256");
  const rawBody = await req.text();

  if (!signatureHeader || !verifySignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  if (event === "ping") {
    return NextResponse.json({ ok: true, message: "pong" });
  }
  if (event !== "push") {
    return NextResponse.json({ ok: true, message: `ignored event: ${event}` });
  }

  let payload: { ref?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid JSON payload" }, { status: 400 });
  }

  if (payload.ref !== "refs/heads/main") {
    return NextResponse.json({ ok: true, message: `ignored ref: ${payload.ref}` });
  }

  const child = spawn("sh", ["-c", "npm run deploy && mkdir -p tmp && touch tmp/restart.txt"], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  return NextResponse.json({ ok: true, message: "deploy started" }, { status: 202 });
}

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
