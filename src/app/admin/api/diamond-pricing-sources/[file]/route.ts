import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guards";

// Admin-only download of the raw spreadsheets the CalculatorDiamondPrice
// table was seeded from (see scripts/seed-calculator-diamond-prices.mjs and
// data/diamond-pricing-sources/) — kept out of `public/` on purpose so
// these are never web-accessible without an admin session.
const ALLOWED_FILES: Record<string, string> = {
  "natural-diamond-calculator.xlsx": "Lady_Diamond_Natural_Diamond_Calculator_Sep_2026.xlsx",
  "cvd-calculator.xlsx": "Lady_Diamond_CVD_Calculator_Google_Sheets.xlsx",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  await requireAdminSession();
  const { file } = await params;
  const filename = ALLOWED_FILES[file];
  if (!filename) return NextResponse.json({ error: "Unknown file" }, { status: 404 });

  const buffer = await readFile(path.join(process.cwd(), "data", "diamond-pricing-sources", filename));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
