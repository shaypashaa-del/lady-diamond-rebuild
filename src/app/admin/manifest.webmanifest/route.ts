// Installable "LADY DIAMOND ניהול" app for the owner's phone: add /admin to the home screen
// and it opens straight into the admin as its own app (separate from the shop and the card).
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: "LADY DIAMOND · ניהול",
    short_name: "ניהול",
    description: "ניהול החנות של LADY DIAMOND",
    lang: "he",
    dir: "rtl",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d0d0d",
    theme_color: "#0d0d0d",
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
