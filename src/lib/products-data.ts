export type SampleProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  // Configurable product with no hand-entered price yet: shown as "price on request".
  priceOnRequest?: boolean;
  hasVariants?: boolean;
  badge?: "New" | "Sale" | "Sold";
  tag?: "NEW" | "BESTSELLER" | "LIMITED";
  blurb: string;
  imageUrl?: string;
  imageAlt?: string;
};
