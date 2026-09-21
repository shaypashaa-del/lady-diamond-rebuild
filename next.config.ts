import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// The only third-party origins this site actually talks to: PayPal's SDK
// script/iframe and its REST API (called server-side, but listed here too
// for completeness). Next.js's own inline bootstrap/hydration scripts and
// styles require 'unsafe-inline' — a stricter nonce-based CSP would need
// custom middleware wiring, which is out of scope for this pass.
// React's dev-mode tooling (Fast Refresh, error overlay stack remapping)
// calls eval() directly — only needed under `next dev`, never in a
// production build, so it's gated on NODE_ENV rather than always allowed.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://www.paypal.com",
  "https://www.sandbox.paypal.com",
  ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
].join(" ");

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.paypalobjects.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api-m.paypal.com https://api-m.sandbox.paypal.com https://www.paypal.com https://www.sandbox.paypal.com",
  "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // The local Postgres dev server (`prisma dev`) accepts far fewer concurrent
  // connections than a real deployment target; capping build worker count keeps
  // total Prisma pool connections (workers × adapter `max`) under that ceiling.
  experimental: {
    cpus: 2,
  },
  // Hides the "N" dev-mode build/route indicator badge during local
  // development (it never appears in production regardless).
  devIndicators: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
