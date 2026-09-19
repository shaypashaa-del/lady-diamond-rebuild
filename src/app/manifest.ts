import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site-config";

// Lets the site be "added to home screen" on iOS/Android as an installable
// web app, using the real brand's diamond icon (not a generic browser icon)
// as the app icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
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
}
