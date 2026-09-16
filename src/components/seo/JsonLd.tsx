// Renders one or more JSON-LD blocks. `data` is server-built schema.org
// objects (see src/lib/schema.ts), but string fields inside it (product
// name/description) are admin-entered content, not literal trusted markup —
// a name containing `</script><script>...` would otherwise break out of the
// script tag and execute. Escaping `<` as its JSON unicode escape is the
// standard JSON-LD hardening (safe because `<` never appears in valid JSON
// syntax itself, only inside string values).
function safeJsonLd(item: object): string {
  return JSON.stringify(item).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(item) }} />
      ))}
    </>
  );
}
