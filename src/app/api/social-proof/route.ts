import { NextResponse } from "next/server";
import { getRecentSales, getSocialProofSettings } from "@/server/social-proof";

// Recent real purchases for the "recent sales" notices (city + product, no names).
export async function GET() {
  const settings = await getSocialProofSettings();
  const sales = settings.sales ? await getRecentSales() : [];
  return NextResponse.json({ sales }, { headers: { "Cache-Control": "public, max-age=60" } });
}
