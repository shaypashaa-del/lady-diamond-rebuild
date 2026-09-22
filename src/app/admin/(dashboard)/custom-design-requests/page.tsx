import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  NEW: "חדשה",
  IN_REVIEW: "בבדיקה",
  GENERATED: "הדמיה מוכנה",
  SENT_TO_FACTORY: "נשלחה למפעל",
  COMPLETED: "הושלמה",
  REJECTED: "נדחתה",
};

const JEWELRY_TYPE_LABEL: Record<string, string> = {
  RING: "טבעת",
  NECKLACE: "שרשרת",
  BRACELET: "צמיד",
  EARRINGS: "עגילים",
  OTHER: "אחר",
};

export default async function CustomDesignRequestsPage() {
  const requests = await prisma.customDesignRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { inspirationImage: true, sketchImage: true, generatedImage: true },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">בקשות עיצוב אישי</h1>
      <p className="mb-6 text-sm text-neutral-500">
        בקשות שהוגשו דרך עמוד &quot;עיצוב אישי&quot; באתר — תיאור, תמונת השראה ו/או שרטוט מהלקוח.
      </p>

      {requests.length === 0 ? (
        <p className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          עדיין לא הוגשו בקשות עיצוב אישי.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-start text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 text-start">תמונה</th>
                <th className="px-4 py-3 text-start">לקוח</th>
                <th className="px-4 py-3 text-start">סוג תכשיט</th>
                <th className="px-4 py-3 text-start">סטטוס</th>
                <th className="px-4 py-3 text-start">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const thumb = r.generatedImage?.url ?? r.inspirationImage?.url ?? r.sketchImage?.url;
                return (
                  <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-12 w-12 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-neutral-100" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/custom-design-requests/${r.id}`} className="font-medium text-neutral-900 hover:underline">
                        {r.customerName}
                      </Link>
                      <p className="text-xs text-neutral-400" dir="ltr">{r.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">{JEWELRY_TYPE_LABEL[r.jewelryType] ?? r.jewelryType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs">
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {r.createdAt.toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
