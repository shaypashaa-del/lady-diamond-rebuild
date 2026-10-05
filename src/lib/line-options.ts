export type LineOptions = { size?: string; engraving?: string; giftWrap?: boolean };

// Short human text for the chosen personalisation (cart, checkout, order).
export function describeOptions(o: LineOptions | undefined): string {
  if (!o) return "";
  return [o.size ? `מידה ${o.size}` : "", o.engraving ? `חריטה: "${o.engraving}"` : "", o.giftWrap ? "עטיפת מתנה" : ""]
    .filter(Boolean)
    .join(" · ");
}
