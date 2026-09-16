import { getSetting } from "@/server/actions/settings";
import { SETTINGS_KEYS } from "@/lib/settings-keys";
import { SettingsForm } from "@/components/admin/SettingsForm";

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
      <SettingsForm
        globalCommissionPercent={globalCommissionPercent}
        attributionDays={attributionDays}
        autoApprove={autoApprove}
        preventSelfReferral={preventSelfReferral}
      />
    </div>
  );
}
