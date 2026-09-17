import Link from "next/link";

export function AdminPager({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="mt-4 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={`flex h-8 w-8 items-center justify-center rounded text-xs ${
            p === page
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 text-neutral-700 hover:border-neutral-900"
          }`}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
