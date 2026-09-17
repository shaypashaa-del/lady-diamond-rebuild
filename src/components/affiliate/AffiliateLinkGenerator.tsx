"use client";

import { useState } from "react";
import { t as localize, type LocalizedText } from "@/lib/i18n-content";

export function AffiliateLinkGenerator({
  code,
  products,
}: {
  code: string;
  products: { slug: string; name: unknown }[];
}) {
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const link = slug
    ? `https://ladydiamondjewels.com/product/${slug}?ref=${code}`
    : `https://ladydiamondjewels.com/?ref=${code}`;

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-lg border border-gold-soft p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/60">Link Generator</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="flex-1 border border-gold-soft px-3 py-2 text-sm"
        >
          <option value="">— Homepage —</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {localize(p.name as LocalizedText, "he")}
            </option>
          ))}
        </select>
        <button
          onClick={copy}
          className="border border-gold-bright px-4 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-gold-bright hover:text-ink"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
      <p className="mt-3 break-all text-xs text-ink/60" dir="ltr">
        {link}
      </p>
    </div>
  );
}
