export type NavChild = { name: string; href: string };
export type NavCategory = { name: string; href: string; children: NavChild[] };

// Clean category taxonomy replacing the messy tag soup found on the live site
// (Accessories / Beauty bracelests / 925 Silver / Gold Plating were attribute-like
// tags, not a real category tree — see AUDIT.md section 2).
export const shopMegaMenu: NavCategory[] = [
  {
    name: "Earrings",
    href: "/category/earrings",
    children: [
      { name: "Pearl Earrings", href: "/product/pearl-earrings" },
      { name: "Line Earrings", href: "/product/line-earrings" },
      { name: "Elegant Earrings", href: "/product/elegant-earrings" },
      { name: "Nouvates Earrings", href: "/product/nouvates-earrings" },
    ],
  },
  {
    name: "Rings",
    href: "/category/rings",
    children: [
      { name: "Simple Ring", href: "/product/simple-ring" },
      { name: "Wedding Ring", href: "/product/wedding-ring" },
      { name: "Circle Ring", href: "/product/circle-ring" },
      { name: "Spiral Ring", href: "/product/spiral-ring" },
    ],
  },
  {
    name: "Bracelets",
    href: "/category/bracelets",
    children: [
      { name: "Heart Bracelet", href: "/product/heart-bracelet" },
      { name: "Small Bracelet", href: "/product/small-bracelet" },
      { name: "Big Bracelet", href: "/product/big-bracelet" },
    ],
  },
  {
    name: "Necklaces",
    href: "/category/necklaces",
    children: [
      { name: "Necklace Pearl", href: "/product/necklace-pearl" },
      { name: "Circle Necklace", href: "/product/circle-necklace" },
      { name: "Mix Necklaces", href: "/product/mix-necklaces" },
    ],
  },
];

export const primaryNav = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/category/all", mega: shopMegaMenu },
  { name: "About Us", href: "/about-us" },
  { name: "Contact Us", href: "/contact-us" },
];

export const footerColumns = [
  {
    title: "General",
    links: [
      { name: "Home", href: "/" },
      { name: "Shop", href: "/category/all" },
      { name: "Contact Us", href: "/contact-us" },
      { name: "Track Your Order", href: "/account/orders" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "Our Story", href: "/about-us" },
      { name: "Become an Affiliate", href: "/affiliate" },
      { name: "Shipping & Returns", href: "/policies/shipping" },
      { name: "Privacy Policy", href: "/policies/privacy" },
    ],
  },
  {
    title: "Categories",
    links: [
      { name: "Earrings", href: "/category/earrings" },
      { name: "Rings", href: "/category/rings" },
      { name: "Bracelets", href: "/category/bracelets" },
      { name: "Necklaces", href: "/category/necklaces" },
    ],
  },
];
