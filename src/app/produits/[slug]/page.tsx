import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetailView } from "@/components/product/product-detail-view";
import { ProductRichText } from "@/components/product/product-rich-text";
import { WheyLandingPageView } from "@/components/landing/whey-landing-page";
import { WHEY_LANDING_SLUG } from "@/lib/landing";
import type { ProductSummary } from "@/lib/data/products";
import {
  getRoutineCompletionProducts,
  getSimilarProducts,
  products,
} from "@/lib/data/products";
import {
  fetchProductBySlug,
  fetchLandingProduct,
  type ProductRating,
  type PublicReview,
  fetchProductRating,
  fetchProductReviews,
  fetchPaginatedProducts,
  fetchSeoRedirect,
} from "@/lib/api/client";
import {
  buildProductMetadata,
  buildProductSchema,
  buildBreadcrumbsSchema,
} from "@/lib/seo";

function normalizedCopy(value?: string | null): string {
  return (value || "").replace(/[#*_`>\-]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function hasDistinctSeoContent(description: string, seoContent?: string | null): boolean {
  const descriptionText = normalizedCopy(description);
  const seoText = normalizedCopy(seoContent);
  return seoText.length >= 80 && !descriptionText.includes(seoText) && !seoText.includes(descriptionText);
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};

  return buildProductMetadata({
    ...product,
    name: product.name,
    slug: product.slug,
    brandName: product.brand,
    categoryName: product.category,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    image: product.ogImage || product.image,
    indexable: product.indexable,
    inStock: product.inStock,
  });
}

function productSchemas(product: ProductSummary, rating: ProductRating, reviews: PublicReview[] = []) {
  const productJsonLd = buildProductSchema({
    rating,
    reviews,
    name: product.name,
    slug: product.slug,
    image: product.image,
    description: product.description,
    brandName: product.brand,
    sku: product.sku || product.id,
    priceTnd: product.priceMillimes / 1000,
    inStock: Boolean(product.inStock),
    categoryName: product.category,
  });
  const categorySlug =
    product.categorySlug ||
    product.category
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-");
  const breadcrumbsJsonLd = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: product.category, url: `/${categorySlug}` },
    { name: product.name, url: `/produits/${product.slug}` },
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd).replace(/</g, "\u003c") }}
      />
    </>
  );
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

  /* Direct-order landing layout for the advertised product only. Same URL, same metadata, same schema. */
  if (slug === WHEY_LANDING_SLUG) {
    const [landing, reviews, rating] = await Promise.all([
      fetchLandingProduct(slug),
      fetchProductReviews(product.id),
      fetchProductRating(product.id),
    ]);
    if (landing) {
      return (
        <>
          {productSchemas(product, rating, reviews)}
          <WheyLandingPageView
            product={landing}
            reviews={reviews}
            rating={rating}
            seoSection={
              hasDistinctSeoContent(product.description, product.seoContent) ? (
                <section className="rounded-3xl border border-[var(--lp-line)] bg-white p-5 sm:p-7">
                  <h2 className="text-lg font-extrabold text-[var(--lp-deep)]">À propos de {product.name}</h2>
                  <ProductRichText content={product.seoContent!} className="mt-3 text-sm leading-7 text-[var(--lp-ink)]/80" />
                </section>
              ) : null
            }
          />
        </>
      );
    }
    // Landing data unavailable: fall through to the regular product page.
  }

  /* Fetch all products for "similar" and "routine completion" rails */
  const allProducts = (await fetchPaginatedProducts({ category: product.categorySlug, limit: 12 })).products;
  const routineCompletion = getRoutineCompletionProducts(product, 4, allProducts);
  const similar = getSimilarProducts(product, 4, allProducts);
  const [reviews, rating] = await Promise.all([
    fetchProductReviews(product.id),
    fetchProductRating(product.id),
  ]);

  return (
    <>
      {productSchemas(product, rating, reviews)}
      <ProductDetailView
        product={product}
        routineCompletion={routineCompletion}
        similar={similar}
        reviews={reviews}
        rating={rating}
      />
      {hasDistinctSeoContent(product.description, product.seoContent) && (
        <section className="mx-auto max-w-[1440px] px-4 pb-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-2xl bg-soft-nude/50 p-6">
            <h2 className="font-serif text-2xl text-ink">À propos de {product.name}</h2>
            <ProductRichText
              content={product.seoContent!}
              className="mt-3 text-sm leading-7 text-ink-muted"
            />
          </div>
        </section>
      )}
    </>
  );
}
