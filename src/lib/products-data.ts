export type SampleProduct = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  hasVariants?: boolean;
  badge?: "New" | "Sale" | "Sold";
  blurb: string;
  imageUrl?: string;
  imageAlt?: string;
};
