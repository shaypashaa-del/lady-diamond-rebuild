import { prisma } from "@/lib/prisma";
import { markMessageRead } from "@/server/actions/contact-admin";

export default async function AdminMessagesPage() {
  const [messages, subscriberCount] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletterSubscriber.count(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">הודעות ופניות</h1>
        <p className="text-sm text-neutral-500">{subscriberCount} נרשמים לניוזלטר</p>
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border p-4 ${m.isRead ? "border-neutral-200 bg-white" : "border-neutral-900 bg-neutral-50"}`}
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="font-medium">
                {m.name} {m.subject ? `— ${m.subject}` : ""}
              </p>
              <form action={markMessageRead.bind(null, m.id, !m.isRead)}>
                <button type="submit" className="text-xs text-blue-600 hover:underline">
                  {m.isRead ? "סמן כלא נקרא" : "סמן כנקרא"}
                </button>
              </form>
            </div>
            <p className="text-xs text-neutral-400" dir="ltr">
              {m.email} {m.phone ? `· ${m.phone}` : ""}
            </p>
            <p className="mt-2 text-sm text-neutral-600">{m.message}</p>
            <p className="mt-2 text-xs text-neutral-400">{m.createdAt.toLocaleString("he-IL")}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">אין הודעות עדיין.</p>
        )}
      </div>
    </div>
  );
}
