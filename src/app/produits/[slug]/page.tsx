import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetailView } from "@/components/product/product-detail-view";
import {
  getRoutineCompletionProducts,
  getSimilarProducts,
  products,
} from "@/lib/data/products";
import { fetchProductBySlug, fetchProductRating, fetchProductReviews, fetchProducts, fetchSeoRedirect } from "@/lib/api/client";

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
  const title = product.seoTitle || `${product.name} en Tunisie | ParaTunisie`;
  const description = product.seoDescription || product.description || `Découvrez ${product.name} de ${product.brand}, disponible en Tunisie sur ParaTunisie.`;
  const fullImgUrl = absoluteImageUrl(product.ogImage || product.image);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: product.canonicalUrl || `/produits/${product.slug}` },
    keywords: product.seoKeywords,
    robots: { index: product.indexable !== false, follow: product.followLinks !== false },
    openGraph: {
      type: "website",
      title: product.ogTitle || title,
      description: product.ogDescription || description,
      url: product.canonicalUrl || `/produits/${product.slug}`,
      images: [{ url: fullImgUrl, alt: product.imageAlt || `${product.name} de ${product.brand}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.ogTitle || title,
      description: product.ogDescription || description,
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
  if (!product) {
    const redirect = await fetchSeoRedirect(`/produits/${slug}`);
    if (redirect) permanentRedirect(redirect);
    notFound();
  }

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
    sku: product.sku || product.id,
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
      { "@type": "ListItem", position: 3, name: product.category, item: `${SITE_URL}/${product.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}` },
      { "@type": "ListItem", position: 4, name: product.name, item: `${SITE_URL}/produits/${product.slug}` },
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
      {product.seoContent && <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-8"><div className="max-w-3xl rounded-2xl bg-soft-nude/50 p-6"><h2 className="font-serif text-2xl text-ink">À propos de {product.name}</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-muted">{product.seoContent}</p></div></section>}
    </>
  );
}
