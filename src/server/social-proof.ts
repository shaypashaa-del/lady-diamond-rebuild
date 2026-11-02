import "server-only";
import { prisma } from "@/lib/prisma";
import { SETTINGS_KEYS } from "@/lib/settings-keys";
import { ttlMemo } from "@/lib/ttl-memo";

// Social proof built ONLY from real activity: live visitors are counted from actual
// browser heartbeats, and "recent purchase" notices come from real paid/handled orders.
// Nothing is invented; with no real activity nothing is shown. No customer names are
// ever shown (city and product only).

export type SocialProofSettings = { visitors: boolean; viewers: boolean; sales: boolean };
export const SOCIAL_PROOF_DEFAULTS: SocialProofSettings = { visitors: true, viewers: true, sales: true };

export const getSocialProofSettings = ttlMemo(
  "social-proof-settings",
  async (): Promise<SocialProofSettings> => {
    const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEYS.socialProof } });
    return { ...SOCIAL_PROOF_DEFAULTS, ...((row?.value as Partial<SocialProofSettings> | null) ?? {}) };
  },
  15_000
);

// ---- Live presence (per server process; the site runs as one process) ----
const ACTIVE_MS = 70_000;
type Presence = Map<string, { path: string; at: number }>;
const g = globalThis as unknown as { __presence?: Presence };
const presence: Presence = (g.__presence ??= new Map());

export function recordPresence(visitorId: string, path: string) {
  const now = Date.now();
  presence.set(visitorId, { path, at: now });
  if (presence.size > 5000) {
    for (const [id, v] of presence) if (now - v.at > ACTIVE_MS) presence.delete(id);
  }
}

export function presenceCounts(path: string, selfId: string) {
  const now = Date.now();
  let site = 0;
  let page = 0;
  for (const [id, v] of presence) {
    if (now - v.at > ACTIVE_MS) {
      presence.delete(id);
      continue;
    }
    site += 1;
    if (v.path === path && id !== selfId) page += 1;
  }
  return { site, othersOnPage: page };
}

// ---- Recent real purchases ----
export type RecentSale = { city: string; product: string; at: string };

export const getRecentSales = ttlMemo(
  "recent-sales",
  async (): Promise<RecentSale[]> => {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        // Only orders that are real: paid, or already being handled / shipped.
        OR: [{ paymentStatus: "PAID" }, { status: { in: ["PROCESSING", "SHIPPED", "COMPLETED"] } }],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { createdAt: true, billingAddress: true, items: { select: { nameSnapshot: true }, take: 1 } },
    });
    return orders
      .map((o) => {
        const city = String((o.billingAddress as { city?: string } | null)?.city ?? "").trim();
        const product = String(o.items[0]?.nameSnapshot ?? "").split(" — ")[0].trim();
        return { city, product, at: o.createdAt.toISOString() };
      })
      .filter((s) => s.city && s.product);
  },
  60_000,
  { swr: true }
);
