"use client";

// Tells the server about a real "added to cart" / "added to wishlist", for the honest
// interest counters. Fire-and-forget; never blocks the shopper.
export function visitorId(): string {
  try {
    const k = "ld_vid";
    let v = window.localStorage.getItem(k);
    if (!v) {
      v = (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`).toLowerCase();
      window.localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function trackActivity(kind: "cart" | "wish", slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    void fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ v: visitorId(), k: kind, s: slug }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // ignore
  }
}
