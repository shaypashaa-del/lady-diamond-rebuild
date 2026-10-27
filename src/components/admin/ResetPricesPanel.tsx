"use client";

import { useState } from "react";
import { resetAllPrices } from "@/server/actions/pricing";

// Danger zone: clears every hand-entered price (list and sale) in all products.
export function ResetPricesPanel() {
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await resetAllPrices(word);
      setMsg("error" in res ? { ok: false, text: res.error } : { ok: true, text: `✓ אופסו ${res.removed} מחירים. כל המוצרים מוצגים כעת "מחיר בפנייה" עד שתזין מחירים.` });
      if (!("error" in res)) setWord("");
    } catch {
      setMsg({ ok: false, text: "האיפוס נכשל. נסו שוב." });
    }
    setBusy(false);
  }

  return (
    <details className="mb-6 rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-rose-800">איפוס כל המחירים</summary>
      <p className="mt-2 text-xs text-neutral-700">
        מוחק את כל מחירי המחירון והמבצע שהוזנו, בכל המוצרים והאפשרויות. אחרי האיפוס האתר מציג &quot;מחיר בפנייה&quot; לכל המוצרים, ואי אפשר לקנות
        אותם עד שתזין מחיר לכל אפשרות חומר. אי אפשר לבטל את הפעולה.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder='הקלד "איפוס" לאישור'
          aria-label="אישור איפוס"
          className="rounded border border-neutral-300 px-3 py-2 text-xs"
        />
        <button
          type="button"
          onClick={run}
          disabled={busy || word.trim() !== "איפוס"}
          className="rounded bg-rose-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          {busy ? "מאפס…" : "אפס את כל המחירים"}
        </button>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-800" : "text-rose-700"}`}>{msg.text}</p>}
    </details>
  );
}
