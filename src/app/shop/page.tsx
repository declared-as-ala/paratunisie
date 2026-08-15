import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopPage } from "@/components/shop/shop-page";
import { ShopSeoContent, SHOP_FAQ } from "@/components/shop/shop-seo-content";
import { fetchPaginatedProducts, fetchBrands, fetchCategories } from "@/lib/api/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SHOP_TITLE = "Parapharmacie en ligne Tunisie";
const SHOP_DESCRIPTION =
  "Découvrez les produits de parapharmacie ParaTunisie : visage, corps, cheveux, solaire, hygiène, bébé et compléments. Livraison en Tunisie.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  // Only the bare, unpaginated /shop collection is the canonical indexable URL —
  // any filter/sort/page combination stays crawlable (follow) but out of the index
  // (SEO.md faceted-navigation rule), so filter permutations never compete with it.
  const isFiltered = Object.keys(params).length > 0;
  return {
    title: SHOP_TITLE,
    description: SHOP_DESCRIPTION,
    alternates: { canonical: "/shop" },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${SHOP_TITLE} | ParaTunisie`,
      description: SHOP_DESCRIPTION,
      url: "/shop",
      images: [
        {
          url: "/assets/hero-cinematic-poster.webp",
          width: 1920,
          height: 1080,
          alt: "Le Shop ParaTunisie",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SHOP_TITLE} | ParaTunisie`,
      description: SHOP_DESCRIPTION,
      images: ["/assets/hero-cinematic-poster.webp"],
    },
  };
}

export default async function ShopRoute({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    brand?: string;
    brands?: string;
    category?: string;
    categories?: string;
    concern?: string;
    concerns?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 24;

  const brandQuery = params.brand || params.brands;
  const categoryQuery = params.category || params.categories;
  const concernQuery = params.concern || params.concerns;

  /* Fetch server-side paginated products directly from database via API */
  const [paginatedData, brands, categories] = await Promise.all([
    fetchPaginatedProducts({
      page,
      limit,
      search: params.q,
      brand: brandQuery,
      category: categoryQuery,
      concern: concernQuery,
      sort: params.sort,
    }),
    fetchBrands(),
    fetchCategories(),
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://paratunisie.com/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://paratunisie.com/shop" },
    ],
  };

  // CollectionPage + ItemList — built from the same paginatedData.products
  // that renders the grid below, so this can never drift from the visible
  // page (CLAUDE.md §6). No ratings/reviews here — that data lives on the
  // PDP, not fabricated at the collection level (CLAUDE.md §20).
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Le Shop | ParaTunisie",
    description: SHOP_DESCRIPTION,
    url: "https://paratunisie.com/shop",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: paginatedData.meta.total,
      itemListElement: paginatedData.products.map((product, index) => ({
        "@type": "ListItem",
        position: (page - 1) * limit + index + 1,
        url: `https://paratunisie.com/produits/${product.slug}`,
        name: `${product.brand} ${product.name}`,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SHOP_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
      <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-16 text-ink-muted">Chargement du Shop…</div>}>
        <ShopPage
          products={paginatedData.products}
          meta={paginatedData.meta}
          availableBrands={brands.map((b) => b.name)}
          availableCategories={categories.map((c) => c.name)}
        />
      </Suspense>
      <ShopSeoContent />
    </>
  );
}
