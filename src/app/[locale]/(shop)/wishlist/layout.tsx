import type { Metadata } from "next";

// The wishlist page is a "use client" component (it reads localStorage-backed
// state), so it can't export generateMetadata itself — this layout carries
// the noindex instead. Per-visitor, empty-by-default content with no SEO
// value; `robots.txt` also disallows it, but a robots.txt disallow only stops
// crawling, not indexing of a URL discovered via an external link, so the
// meta tag is the belt-and-suspenders fix for that gap.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
