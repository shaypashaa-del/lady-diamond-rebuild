"use client";

import { useState } from "react";
import { freezeAutoPricesToManual } from "@/server/actions/pricing";

// One click: every material option without a hand-entered price gets the price the shop
// shows now as its manual price. The site's prices stay exactly as they are.
export function FreezePricesPanel() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [summary, setSummary] = useState<{ frozen: number; skipped: number; failed: string[] } | null>(null);
  const [error, setError] = useState("");

  async function run() {
    if (!window.confirm("לקבוע את כל המחירים הנוכחיים כמחירים ידניים? המחירים באתר לא ישתנו. מכאן והלאה הם ישתנו רק כשתערוך אותם.")) return;
    setRunning(true);
    setError("");
    setSummary(null);
    let offset = 0;
    let frozen = 0;
    let skipped = 0;
    const failed: string[] = [];
    try {
      for (;;) {
        const res = await freezeAutoPricesToManual(offset);
        if ("error" in res) {
          setError(res.error);
          break;
        }
        frozen += res.frozen;
        skipped += res.skipped;
        failed.push(...res.failed);
        setProgress(`${res.processed} / ${res.total} מוצרים`);
        if (res.processed >= res.total) break;
        offset = res.processed;
      }
      setSummary({ frozen, skipped, failed });
    } catch {
      setError("הפעולה נעצרה באמצע. אפשר להפעיל שוב: מה שכבר נקבע לא ייפגע.");
    }
    setRunning(false);
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
      <p className="font-semibold">מעבר לתמחור ידני בכל המוצרים</p>
      <p className="mt-1 text-xs text-neutral-600">
        הלחיצה שומרת לכל אפשרות חומר (בכל הקטגוריות) את המחיר שמוצג היום באתר, ככתיבה ידנית. אחר כך כל מחיר משתנה רק
        כשאתה עורך אותו בעריכת המוצר. בטוח להפעיל שוב: מחירים ידניים קיימים לא נוגעים.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="mt-3 rounded bg-neutral-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {running ? `עובד… ${progress}` : "קבע את כל המחירים לידניים"}
      </button>
      {error && <p className="mt-3 text-xs text-rose-700">{error}</p>}
      {summary && (
        <div className="mt-3 text-xs">
          <p className="text-emerald-800">
            ✓ הסתיים: {summary.frozen} מחירים נקבעו, {summary.skipped} כבר היו ידניים.
          </p>
          {summary.failed.length > 0 && (
            <div className="mt-2 text-rose-700">
              <p>לא ניתן היה לקבוע מחיר ל-{summary.failed.length} אפשרויות (חסר מידע לחישוב). יש להזין להן מחיר ידנית בעריכת המוצר:</p>
              <ul className="mt-1 list-inside list-disc">
                {summary.failed.slice(0, 20).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
