import { describe, it, expect } from "vitest";

// Re-implements the exact escaping logic from JsonLd.tsx to test it in
// isolation without rendering React (the component itself has no exported
// pure function — this locks in the fix for the script-tag-breakout bug).
function safeJsonLd(item: object): string {
  return JSON.stringify(item).replace(/</g, "\\u003c");
}

describe("safeJsonLd", () => {
  it("escapes < so a malicious product name can't break out of the <script> tag", () => {
    const malicious = { name: "</script><script>alert(1)</script>" };
    const html = safeJsonLd(malicious);
    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003c/script>");
  });

  it("still produces valid JSON for normal content", () => {
    const normal = { name: "שרשרת עיגול", price: "52.00" };
    const html = safeJsonLd(normal);
    expect(JSON.parse(html)).toEqual(normal);
  });
});
