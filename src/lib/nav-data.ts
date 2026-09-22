export type NavCategory = { key: string; href: string };

// Clean category taxonomy replacing the messy tag soup found on the live site
// (Accessories / Beauty bracelests / 925 Silver / Gold Plating were attribute-like
// tags, not a real category tree — see AUDIT.md section 2).
// Labels are resolved via the Nav.* translation namespace at render time.
// Per-product child links (as seen on the live site's mega-menu) will be
// generated from the real catalog once Phase 3 wires this to the database.
export const shopMegaMenu: NavCategory[] = [
  { key: "earrings", href: "/category/earrings" },
  { key: "rings", href: "/category/rings" },
  { key: "bracelets", href: "/category/bracelets" },
  { key: "necklaces", href: "/category/necklaces" },
];

export const primaryNav = [
  { key: "home", href: "/" },
  { key: "shop", href: "/category/all", mega: shopMegaMenu },
  { key: "aboutUs", href: "/about-us" },
  { key: "customDesign", href: "/custom-design" },
  { key: "calculators", href: "/calculators" },
  { key: "affiliateProgram", href: "/affiliate" },
  { key: "contactUs", href: "/contact-us" },
] as const;

export const footerColumns = [
  {
    titleKey: "general",
    links: [
      { key: "home", href: "/" },
      { key: "shop", href: "/category/all" },
      { key: "contactUs", href: "/contact-us" },
      { key: "trackOrder", href: "/account" },
    ],
  },
  {
    titleKey: "about",
    links: [
      { key: "ourStory", href: "/about-us" },
      { key: "becomeAffiliate", href: "/affiliate" },
      { key: "shipping", href: "/policies/shipping" },
      { key: "terms", href: "/policies/terms" },
      { key: "privacy", href: "/policies/privacy" },
      { key: "cookies", href: "/policies/cookies" },
      { key: "accessibility", href: "/policies/accessibility" },
    ],
  },
  {
    titleKey: "categories",
    links: [
      { key: "earrings", href: "/category/earrings" },
      { key: "rings", href: "/category/rings" },
      { key: "bracelets", href: "/category/bracelets" },
      { key: "necklaces", href: "/category/necklaces" },
    ],
  },
] as const;
