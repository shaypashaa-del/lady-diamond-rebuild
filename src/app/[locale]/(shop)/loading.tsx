// Shown immediately while a shop page (product, category, search) renders on the
// server, so clicking a product gives instant feedback instead of a frozen screen.
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8" aria-busy="true" aria-live="polite">
      <div className="mb-4 h-3 w-40 animate-pulse rounded bg-ink/10" />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded bg-ink/10" />
        <div className="space-y-4">
          <div className="h-3 w-20 animate-pulse rounded bg-ink/10" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-ink/10" />
          <div className="h-6 w-32 animate-pulse rounded bg-ink/10" />
          <div className="h-16 w-full animate-pulse rounded bg-ink/10" />
          <div className="h-12 w-full animate-pulse rounded bg-ink/10" />
        </div>
      </div>
    </div>
  );
}
