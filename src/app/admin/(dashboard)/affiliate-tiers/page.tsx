import { prisma } from "@/lib/prisma";
import { upsertTierRule } from "@/server/actions/tier-rules";

const TIERS = ["BRONZE", "SILVER", "GOLD", "DIAMOND"] as const;
const tierLabels: Record<string, string> = {
  BRONZE: "ברונזה",
  SILVER: "כסף",
  GOLD: "זהב",
  DIAMOND: "יהלום",
};

export default async function AdminAffiliateTiersPage() {
  const rules = await prisma.affiliateTierRule.findMany();
  const byTier = new Map(rules.map((r) => [r.tier, r]));

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">רמות שותפים (Affiliate Levels)</h1>
      <p className="mb-6 text-sm text-neutral-500">
        קובע את אחוז העמלה האוטומטי לפי רמת השותף. עמלה מותאמת אישית שנקבעה ידנית לשותף
        (בעמוד השותפים) גוברת על הגדרה זו. רמת השותף עצמה עדיין נקבעת ידנית בעמוד השותפים.
      </p>

      <div className="space-y-4">
        {TIERS.map((tier) => {
          const rule = byTier.get(tier);
          return (
            <form
              key={tier}
              action={upsertTierRule}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <input type="hidden" name="tier" value={tier} />
              <div className="w-20 text-sm font-semibold">{tierLabels[tier]}</div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">מכירות מינימום לחודש</label>
                <input
                  name="minSales"
                  type="number"
                  defaultValue={rule?.minSales ?? 0}
                  className="w-28 border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">אחוז עמלה</label>
                <input
                  name="commissionPercent"
                  type="number"
                  step="0.1"
                  defaultValue={rule ? Number(rule.commissionPercent) : 0}
                  className="w-24 border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">בונוס (₪)</label>
                <input
                  name="bonus"
                  type="number"
                  step="0.01"
                  defaultValue={rule?.bonus != null ? Number(rule.bonus) : undefined}
                  className="w-24 border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </div>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={rule?.isActive ?? true} />
                פעיל
              </label>
              <button type="submit" className="rounded bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800">
                שמירה
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
