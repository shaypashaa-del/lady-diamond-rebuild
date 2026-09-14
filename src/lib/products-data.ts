// Placeholder catalog data until Phase 3 wires this to Prisma/Postgres.
// Copy is written fresh (no Lorem Ipsum), inspired by the brand's own
// "since 2010" fine-jewelry positioning.

export type SampleProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  hasVariants?: boolean;
  badge?: "New" | "Sale" | "Sold";
  blurb: string;
};

export const featuredProducts: SampleProduct[] = [
  {
    slug: "circle-necklace",
    name: "Circle Necklace",
    category: "Necklaces",
    price: 52,
    hasVariants: true,
    blurb: "A slim circle pendant in gold or silver, made for everyday layering.",
  },
  {
    slug: "small-earrings",
    name: "Small Earrings",
    category: "Earrings",
    price: 46,
    blurb: "Understated studs that catch the light without saying too much.",
  },
  {
    slug: "circle-earrings",
    name: "Circle Earrings",
    category: "Earrings",
    price: 56,
    hasVariants: true,
    blurb: "The circle pendant's matching pair, sold in gold or silver.",
  },
  {
    slug: "heart-bracelet",
    name: "Heart Bracelet",
    category: "Bracelets",
    price: 62,
    blurb: "A fine chain bracelet with a single heart charm.",
  },
];

export const newArrivals: SampleProduct[] = [
  {
    slug: "spiral-ring",
    name: "Spiral Ring",
    category: "Rings",
    price: 53,
    badge: "New",
    blurb: "A ring that wraps the finger in one continuous line.",
  },
  {
    slug: "nouvates-earrings",
    name: "Nouvates Earrings",
    category: "Earrings",
    price: 79,
    salePrice: 88,
    badge: "Sale",
    blurb: "Gold-plated drops with a soft, rounded silhouette.",
  },
  {
    slug: "mix-necklaces",
    name: "Mix Necklaces",
    category: "Necklaces",
    price: 82,
    hasVariants: true,
    blurb: "Two fine chains worn together, sold as a set.",
  },
  {
    slug: "circle-ring",
    name: "Circle Ring",
    category: "Rings",
    price: 56,
    hasVariants: true,
    badge: "Sold",
    blurb: "925 silver band with the same circle motif as the necklace.",
  },
];
