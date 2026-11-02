import { getSetting, updateSocialProofSettings } from "@/server/actions/settings";
import { SavableForm } from "@/components/admin/SavableForm";
import { SOCIAL_PROOF_DEFAULTS, type SocialProofSettings } from "@/server/social-proof";
import { SETTINGS_KEYS } from "@/lib/settings-keys";
import { EmailTestForm } from "@/components/admin/EmailTestForm";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const [globalCommissionPercent, attributionDays, autoApprove, preventSelfReferral] = await Promise.all([
    getSetting(SETTINGS_KEYS.globalCommissionPercent, 10),
    getSetting(SETTINGS_KEYS.attributionDays, 30),
    getSetting(SETTINGS_KEYS.autoApproveAffiliates, false),
    getSetting(SETTINGS_KEYS.preventSelfReferral, true),
  ]);
  const social = { ...SOCIAL_PROOF_DEFAULTS, ...(await getSetting<Partial<SocialProofSettings>>(SETTINGS_KEYS.socialProof, {})) };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">הגדרות</h1>
      <SettingsForm
        globalCommissionPercent={globalCommissionPercent}
        attributionDays={attributionDays}
        autoApprove={autoApprove}
        preventSelfReferral={preventSelfReferral}
      />
      <SavableForm
        action={updateSocialProofSettings}
        className="mt-8 max-w-xl space-y-3 rounded-lg border border-neutral-200 bg-white p-5"
        submitLabel="שמירה"
      >
        <h2 className="text-sm font-semibold">הוכחה חברתית באתר</h2>
        <p className="text-xs text-neutral-500">
          מבוסס רק על פעילות אמיתית: גולשים שמחוברים עכשיו ורכישות ששולמו או בטיפול. בלי שמות לקוחות (רק עיר ומוצר). כשאין פעילות, לא מוצג כלום.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="visitors" defaultChecked={social.visitors} /> מונה גולשים באתר עכשיו
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="viewers" defaultChecked={social.viewers} /> &quot;עוד X אנשים צופים במוצר הזה&quot; בדף מוצר
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sales" defaultChecked={social.sales} /> התראות על רכישות אחרונות (14 הימים האחרונים)
        </label>
      </SavableForm>
      <EmailTestForm />
    </div>
  );
}
