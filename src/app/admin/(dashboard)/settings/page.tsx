import { getSetting, updateSettings } from "@/server/actions/settings";
import { SETTINGS_KEYS } from "@/lib/settings-keys";

export default async function AdminSettingsPage() {
  const [globalCommissionPercent, attributionDays, autoApprove, preventSelfReferral] = await Promise.all([
    getSetting(SETTINGS_KEYS.globalCommissionPercent, 10),
    getSetting(SETTINGS_KEYS.attributionDays, 30),
    getSetting(SETTINGS_KEYS.autoApproveAffiliates, false),
    getSetting(SETTINGS_KEYS.preventSelfReferral, true),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">הגדרות</h1>

      <form action={updateSettings} className="max-w-xl space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
            תוכנית שותפים
          </h2>
          <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                אחוז עמלה כללי (ברירת מחדל לשותפים ללא עמלה מותאמת)
              </label>
              <input
                name="globalCommissionPercent"
                type="number"
                step="0.1"
                defaultValue={globalCommissionPercent}
                className="w-32 border border-neutral-300 px-3 py-2 text-sm"
              />
              <span className="ms-2 text-sm text-neutral-500">%</span>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                חלון ייחוס הפניה (ימים)
              </label>
              <input
                name="attributionDays"
                type="number"
                defaultValue={attributionDays}
                className="w-32 border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="autoApproveAffiliates" defaultChecked={autoApprove} />
              אישור אוטומטי לבקשות הצטרפות שותפים חדשים
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="preventSelfReferral" defaultChecked={preventSelfReferral} />
              מנע עמלה על רכישה עצמית של השותף (הזמנה מאותו חשבון משתמש)
            </label>
          </div>
        </div>

        <button type="submit" className="rounded bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
          שמירת הגדרות
        </button>
      </form>
    </div>
  );
}
