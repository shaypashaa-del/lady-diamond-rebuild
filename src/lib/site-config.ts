// Central place for site-wide constants used in metadata/structured data.
// Override SITE_URL via env once a production domain is confirmed.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ladydiamondjewels.com";
export const SITE_NAME = "Lady Diamond Jewels";

// The shop's public business phone (shown on the site). Bit and PayBox payments
// are sent to this number unless BIT_PHONE / PAYBOX_PHONE override it on the server.
export const BUSINESS_PHONE = "050-3781589";
