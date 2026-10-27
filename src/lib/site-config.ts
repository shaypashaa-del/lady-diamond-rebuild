// Central place for site-wide constants used in metadata/structured data.
// Override SITE_URL via env once a production domain is confirmed.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ladydiamondjewels.com";
export const SITE_NAME = "Lady Diamond Jewels";

// The shop's public business phone (shown on the site). Bit and PayBox payments
// are sent to this number unless BIT_PHONE / PAYBOX_PHONE override it on the server.
export const BUSINESS_PHONE = "050-3781589";

// Bank account customers transfer to (shown at checkout and in the order mail). Given by
// the owner; BANK_HOLDER / BANK_NAME / BANK_BRANCH / BANK_ACCOUNT in the server env override it.
export const BANK_DETAILS = {
  holder: "דיאנה",
  bank: "בנק לאומי",
  branch: "851",
  account: "35498488",
} as const;

// PayPal account customers pay to directly (shown at checkout and in the order mail).
// PAYPAL_EMAIL in the server env overrides it.
export const PAYPAL_EMAIL = "diana.isra777@gmail.com";
