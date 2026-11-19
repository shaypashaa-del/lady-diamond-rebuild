export const SETTINGS_KEYS = {
  globalCommissionPercent: "global_commission_percent",
  attributionDays: "affiliate_attribution_days",
  autoApproveAffiliates: "affiliate_auto_approve",
  preventSelfReferral: "affiliate_prevent_self_referral",
  socialProof: "social_proof",
  payoutHoldDays: "affiliate_payout_hold_days",
} as const;

export const DEFAULT_PAYOUT_HOLD_DAYS = 30;
// Delivery date of an order (ISO string), stored as a Setting so no schema change is needed.
export const deliveredAtKey = (orderId: string) => `order_delivered_at:${orderId}`;
