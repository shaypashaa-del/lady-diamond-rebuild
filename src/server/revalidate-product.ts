import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

// The public product page is cached (see `revalidate` in
// product/[slug]/page.tsx) so it doesn't hit Supabase on every visit. Admin
// edits that change what that page shows must bust the cache immediately —
// otherwise a price/stock/option change could sit stale for the full cache
// window, which the owner has repeatedly said must never happen silently.
export function revalidateProductPage(slug: string) {
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(`${prefix}/product/${slug}`);
  }
}
