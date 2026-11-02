import { NextResponse } from "next/server";
import { getSocialProofSettings, presenceCounts, recordPresence } from "@/server/social-proof";

// Heartbeat from an open page: { v: anonymous visitor id, p: path }. Answers with the
// real number of people on the site and on the same page right now.
export async function POST(req: Request) {
  let body: { v?: unknown; p?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const v = typeof body.v === "string" && /^[a-z0-9-]{8,64}$/i.test(body.v) ? body.v : null;
  const p = typeof body.p === "string" && body.p.startsWith("/") && body.p.length < 300 ? body.p : null;
  if (!v || !p || p.startsWith("/admin")) return NextResponse.json({ error: "bad request" }, { status: 400 });

  recordPresence(v, p);
  const settings = await getSocialProofSettings();
  const counts = presenceCounts(p, v);
  return NextResponse.json(
    {
      site: settings.visitors ? counts.site : null,
      othersOnPage: settings.viewers ? counts.othersOnPage : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
