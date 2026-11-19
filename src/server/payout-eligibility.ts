import { prisma } from "@/lib/prisma";
import { DEFAULT_PAYOUT_HOLD_DAYS, SETTINGS_KEYS, deliveredAtKey } from "@/lib/settings-keys";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getPayoutHoldDays(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: SETTINGS_KEYS.payoutHoldDays } });
  const n = Number(row?.value);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_PAYOUT_HOLD_DAYS;
}

// Map orderId -> date from which its commission may be paid, or null when the
// order has not been marked completed (delivered) yet.
export async function getEligibleFromDates(orderIds: string[], holdDays: number): Promise<Map<string, Date | null>> {
  const rows = orderIds.length
    ? await prisma.setting.findMany({ where: { key: { in: orderIds.map(deliveredAtKey) } } })
    : [];
  const delivered = new Map(rows.map((r) => [r.key, new Date(String(r.value))]));
  const out = new Map<string, Date | null>();
  for (const id of orderIds) {
    const d = delivered.get(deliveredAtKey(id));
    out.set(id, d && !Number.isNaN(d.getTime()) ? new Date(d.getTime() + holdDays * DAY_MS) : null);
  }
  return out;
}
