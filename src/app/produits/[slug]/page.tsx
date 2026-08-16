import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product/product-detail-view";
import {
  getRoutineCompletionProducts,
  getSimilarProducts,
  products,
} from "@/lib/data/products";
import { fetchProductBySlug, fetchProductRating, fetchProductReviews, fetchProducts } from "@/lib/api/client";

const SITE_URL = "https://paratunisie.com";

function absoluteImageUrl(img?: string): string {
  if (!img) return `${SITE_URL}/assets/product-tube.webp`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${SITE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};

  // Admin SEO overrides (product-drawer's SEO editor) take priority over the
  // auto-generated fallback — this is the only thing that made setting them
  // in admin actually do anything on the live page.
  const title = product.seoTitle || `${product.name} — ${product.brand}`;
  const description = product.seoDescription || product.description;
  const fullImgUrl = absoluteImageUrl(product.image);

  return {
    title,
    description,
    alternates: { canonical: product.canonicalUrl || `/produits/${product.slug}` },
    robots: product.indexable === false ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: `/produits/${product.slug}`,
      images: [{ url: fullImgUrl, width: 1200, height: 1500, alt: `${product.name} de ${product.brand}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImgUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  /* Fetch all products for "similar" and "routine completion" rails */
  const allProducts = await fetchProducts();
  const routineCompletion = getRoutineCompletionProducts(product, 4, allProducts);
  const similar = getSimilarProducts(product, 4, allProducts);
  const [reviews, rating] = await Promise.all([
    fetchProductReviews(product.id),
    fetchProductRating(product.id),
  ]);

  const fullImgUrl = absoluteImageUrl(product.image);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: fullImgUrl,
    sku: product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produits/${product.slug}`,
      priceCurrency: "TND",
      price: (product.priceMillimes / 1000).toFixed(3),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(rating.count > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.average.toFixed(1),
        reviewCount: rating.count,
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/produits/${product.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailView
        product={product}
        routineCompletion={routineCompletion}
        similar={similar}
        reviews={reviews}
        rating={rating}
      />
    </>
  );
}
