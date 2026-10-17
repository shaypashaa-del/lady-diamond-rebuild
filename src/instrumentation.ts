// Runs once when the Next.js server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PHASE === "phase-production-build") return;
  // Warm the in-memory caches in the background; never block or fail startup.
  void (async () => {
    try {
      const { getListingPrices } = await import("@/server/pricing/listing-prices");
      await getListingPrices();
      const { warmProductCache } = await import("@/server/repositories/catalog");
      await warmProductCache();
    } catch (err) {
      console.error("[warmup] failed", err);
    }
  })();
}
