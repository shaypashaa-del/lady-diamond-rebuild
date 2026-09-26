"use client";

import { useState } from "react";
import { ProductDetail, type VariantView, type ProductImageView } from "./ProductDetail";
import { ConfigurablePriceSelector, type MaterialOption, type DiamondOption } from "./ConfigurablePriceSelector";

// Product pages compose ProductDetail (the image gallery + buy box) and
// ConfigurablePriceSelector (the material/diamond picker) as siblings, but a
// color swap needs to change what ProductDetail's gallery shows — this
// wrapper is the one place both can share that bit of state, since a server
// component parent can't hold it itself.
export function ProductPageInteractive({
  productId,
  showConfigurable,
  materialOptions,
  diamondOptions,
  ...detailProps
}: {
  productId: string;
  showConfigurable: boolean;
  materialOptions: MaterialOption[];
  diamondOptions: DiamondOption[];
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  inventory: number;
  sku?: string;
  weightGrams?: number | null;
  categoryName: string;
  categorySlug?: string;
  shippingPrice?: number;
  variants: VariantView[];
  images?: ProductImageView[];
}) {
  const [colorImageUrl, setColorImageUrl] = useState<string | null>(null);

  return (
    <>
      <ProductDetail productId={productId} {...detailProps} colorImageOverride={colorImageUrl} />
      {showConfigurable && (
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <ConfigurablePriceSelector
            productId={productId}
            materialOptions={materialOptions}
            diamondOptions={diamondOptions}
            onMaterialImageChange={setColorImageUrl}
          />
        </div>
      )}
    </>
  );
}
