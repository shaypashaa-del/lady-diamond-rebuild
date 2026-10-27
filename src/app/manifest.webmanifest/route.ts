import { SITE_NAME } from "@/lib/site-config";

// Lets the shop be "added to home screen" as an installable web app, using the brand's
// diamond icon. (A route handler rather than the app/manifest file convention, so the
// admin can link its own manifest instead.)
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: SITE_NAME,
    short_name: "Lady Diamond",
    description: "High-quality, elegant fine jewelry featuring diamonds and precious materials.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#141414",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
