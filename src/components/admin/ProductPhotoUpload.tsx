"use client";

import { useRef, useState } from "react";
import { uploadProductPhotos } from "@/server/actions/product-images";
import { shrinkImage } from "@/lib/resize-image";

// Pick (or shoot) photos on the phone and add them to this product in one step.
export function ProductPhotoUpload({ productId }: { productId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onChange() {
    const files = Array.from(input.current?.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      for (const f of files) fd.append("file", await shrinkImage(f));
      const res = await uploadProductPhotos(productId, fd);
      setMsg("error" in res ? { ok: false, text: res.error } : { ok: true, text: `✓ נוספו ${res.count} תמונות למוצר.` });
    } catch {
      setMsg({ ok: false, text: "ההעלאה נכשלה. נסו שוב, אולי עם פחות תמונות." });
    }
    if (input.current) input.current.value = "";
    setBusy(false);
  }

  return (
    <div className="mb-4 rounded border border-gold-soft bg-amber-50 p-3">
      <label className="flex min-h-11 cursor-pointer items-center justify-center rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
        {busy ? "מעלה…" : "📷 הוספת תמונות מהטלפון"}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={onChange}
          className="sr-only"
        />
      </label>
      <p className="mt-2 text-[11px] text-neutral-500">בוחרים תמונה מהגלריה או מצלמים. התמונות מוקטנות אוטומטית והמוצר מתעדכן מיד.</p>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-emerald-800" : "text-rose-700"}`}>{msg.text}</p>}
    </div>
  );
}
