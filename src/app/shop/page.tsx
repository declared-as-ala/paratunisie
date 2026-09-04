import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopPage } from "@/components/shop/shop-page";
import { ShopSeoContent, SHOP_FAQ } from "@/components/shop/shop-seo-content";
import { fetchPaginatedProducts, fetchBrands, fetchCategories } from "@/lib/api/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { buildShopMetadata, buildBreadcrumbsSchema, buildItemListSchema, buildFaqSchema } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const hasFilters = Object.keys(params).some((k) => k !== "page" && Boolean(params[k]));
  return buildShopMetadata({ page, hasFilters });
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

  const breadcrumbJsonLd = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: "Shop", url: "/shop" },
  ]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Boutique en Ligne | ParaTunisie",
    description: "Catalogue complet de parapharmacie et nutrition sportive en Tunisie.",
    url: "https://paratunisie.com/shop",
    mainEntity: buildItemListSchema(
      paginatedData.products.map((product, index) => ({
        name: `${product.brand} ${product.name}`,
        url: `/produits/${product.slug}`,
        position: (page - 1) * limit + index + 1,
      })),
      "Catalogue ParaTunisie"
    ),
  };

  const faqJsonLd = buildFaqSchema(SHOP_FAQ);

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
