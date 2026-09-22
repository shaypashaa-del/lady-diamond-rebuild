import path from "path";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/guards";
import { CustomDesignBrief } from "@/server/pdf/CustomDesignBrief";

// MediaAsset.url is always a site-relative "/uploads/<file>" path (see
// server/actions/media.ts) — react-pdf's <Image> needs a real filesystem
// path or a fetchable URL, not a relative one, so resolve it against the
// same public/ directory Next serves it from.
function uploadUrlToAbsPath(url: string | undefined): string | null {
  if (!url || !url.startsWith("/uploads/")) return null;
  return path.join(process.cwd(), "public", url);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const req = await prisma.customDesignRequest.findUnique({
    where: { id },
    include: { inspirationImage: true, sketchImage: true, generatedImage: true },
  });
  if (!req) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <CustomDesignBrief
      data={{
        id: req.id,
        createdAt: req.createdAt,
        jewelryType: req.jewelryType,
        description: req.description,
        customerName: req.customerName,
        customerEmail: req.customerEmail,
        customerPhone: req.customerPhone,
        adminNotes: req.adminNotes,
        inspirationImageAbsPath: uploadUrlToAbsPath(req.inspirationImage?.url),
        sketchImageAbsPath: uploadUrlToAbsPath(req.sketchImage?.url),
        generatedImageAbsPath: uploadUrlToAbsPath(req.generatedImage?.url),
      }}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="custom-design-${req.id}.pdf"`,
    },
  });
}
