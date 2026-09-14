import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productSchema(product: {
  name: string;
  description: string;
  sku?: string | null;
  price: number;
  currency?: string;
  url: string;
  availability: "InStock" | "OutOfStock";
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku ?? undefined,
    image: product.image,
    offers: {
      "@type": "Offer",
      url: product.url,
      priceCurrency: product.currency ?? "ILS",
      price: product.price.toFixed(2),
      availability: `https://schema.org/${product.availability}`,
    },
  };
}
