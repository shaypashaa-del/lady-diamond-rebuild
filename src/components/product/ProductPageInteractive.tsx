"use client";

import { useState } from "react";
import { ProductDetail, type VariantView, type ProductImageView } from "./ProductDetail";
import {
  ConfigurablePriceSelector,
  type MaterialOption,
  type DiamondOption,
  type ConfiguredPriceState,
} from "./ConfigurablePriceSelector";

// Product pages compose ProductDetail (the image gallery + buy box) and
// ConfigurablePriceSelector (the material/diamond picker) as siblings, but a
// color swap needs to change what ProductDetail's gallery shows, and (for a
// CONFIGURABLE product) the selector's live price/selection needs to reach
// ProductDetail's single price display and its add-to-cart button — this
// wrapper is the one place both can share that state, since a server
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
  const [configured, setConfigured] = useState<ConfiguredPriceState | null>(
    showConfigurable ? { status: "pending" } : null
  );

  return (
    <>
      <ProductDetail
        productId={productId}
        {...detailProps}
        colorImageOverride={colorImageUrl}
        configurable={showConfigurable}
        configuredPrice={configured}
      />
      {showConfigurable && (
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <ConfigurablePriceSelector
            productId={productId}
            materialOptions={materialOptions}
            diamondOptions={diamondOptions}
            onMaterialImageChange={setColorImageUrl}
            onConfiguredChange={setConfigured}
          />
        </div>
      )}
    </>
  );
}
