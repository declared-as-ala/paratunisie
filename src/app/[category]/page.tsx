import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  fetchCategoryBySlug,
  fetchFeaturedProduct,
  fetchPaginatedProducts,
  fetchSeoRedirect,
} from "@/lib/api/client";
import { CategoryCatalogView } from "@/components/category/category-catalog-view";
import {
  buildCategoryMetadata,
  buildBreadcrumbsSchema,
  buildItemListSchema,
  buildFaqSchema,
} from "@/lib/seo";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

export const dynamic = "force-dynamic";

type Query = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ category: string }>; searchParams: Promise<Query> };

const scalar = (value: Query[string]) => (typeof value === "string" ? value : "");
const pageNumber = (query: Query) => Math.max(1, Math.floor(Number(scalar(query.page)) || 1));
const filtered = (query: Query) =>
  ["q", "brand", "sort", "price", "in_stock"].some((key) => Boolean(scalar(query[key])));

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) return { robots: { index: false, follow: true } };
  const query = await searchParams;
  const result = await fetchPaginatedProducts({ category: slug, limit: 1 });
  return buildCategoryMetadata({
    ...category,
    name: category.name,
    slug,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription || category.seoIntro || category.description,
    indexable: category.indexable !== false && result.meta.total > 0,
    page: pageNumber(query),
    hasFilters: filtered(query),
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = await fetchCategoryBySlug(slug);
  if (!category) {
    const target = await fetchSeoRedirect(`/${slug}`);
    if (target) permanentRedirect(target);
    notFound();
  }

  const query = await searchParams;
  const page = pageNumber(query);
  const search = scalar(query.q);
  const brand = scalar(query.brand);
  const sort = scalar(query.sort);
  const price = scalar(query.price);
  const inStock = scalar(query.in_stock);

  // Fetch both the current paginated slice AND a larger slice to compute sidebar facet counts
  const [{ products: listed, meta }, { products: allCategoryProducts }] = await Promise.all([
    fetchPaginatedProducts({
      category: category.slug,
      page,
      limit: 24,
      search,
      brand,
      sort,
    }),
    fetchPaginatedProducts({
      category: category.slug,
      page: 1,
      limit: 100,
    }),
  ]);

  if (page > meta.totalPages && meta.totalPages > 0) notFound();

  // Pin the featured product first in its own category (default listing only)
  const featured = !filtered(query) ? (await fetchFeaturedProduct())?.product : undefined;
  const pinned =
    featured && featured.inStock !== false && featured.categorySlug === category.slug
      ? featured
      : undefined;

  let products = pinned
    ? page === 1
      ? [pinned, ...listed.filter((p) => p.id !== pinned.id)]
      : listed.filter((p) => p.id !== pinned.id)
    : listed;

  // Apply price & stock filters
  if (price === "under_60") {
    products = products.filter((p) => p.priceMillimes < 60000);
  } else if (price === "60_120") {
    products = products.filter((p) => p.priceMillimes >= 60000 && p.priceMillimes <= 120000);
  } else if (price === "above_120") {
    products = products.filter((p) => p.priceMillimes > 120000);
  }

  if (inStock === "in_stock") {
    products = products.filter((p) => p.inStock !== false);
  }

  // Compute facet counts from allCategoryProducts
  const baseForCounts = allCategoryProducts.length > 0 ? allCategoryProducts : listed;
  const brandCountMap = new Map<string, number>();
  let inStockCount = 0;
  let under60Count = 0;
  let between60And120Count = 0;
  let above120Count = 0;

  for (const p of baseForCounts) {
    if (p.brand) {
      brandCountMap.set(p.brand, (brandCountMap.get(p.brand) || 0) + 1);
    }
    if (p.inStock !== false) inStockCount++;
    if (p.priceMillimes < 60000) under60Count++;
    else if (p.priceMillimes <= 120000) between60And120Count++;
    else above120Count++;
  }

  const availableBrands = Array.from(brandCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const crumbs = [
    { name: "Accueil", url: "/" },
    ...(category.parent ? [{ name: category.parent.name, url: `/${category.parent.slug}` }] : []),
    { name: category.name, url: `/${category.slug}` },
  ];

  const subcategoryTabs = category.children?.length
    ? category.children.map((child) => ({
        key: child.slug,
        label: child.name,
        href: `/${child.slug}`,
      }))
    : undefined;

  const schemas = [
    buildBreadcrumbsSchema(crumbs),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.seoH1 || category.name,
      description: category.seoIntro || category.shortDescription || category.name,
      url: buildCanonicalUrl(`/${slug}`, { page, allowPagination: true }),
    },
    buildItemListSchema(
      products.map((product, index) => ({
        name: product.name,
        url: `/produits/${product.slug}`,
        position: (page - 1) * 24 + index + 1,
      })),
      category.name
    ),
  ];

  const faqText = category.seoContent?.split("## Questions fréquentes\n")[1];
  const faqs = faqText
    ? Array.from(faqText.matchAll(/### ([^\n]+)\n\n([\s\S]*?)(?=\n\n### |$)/g), (match) => ({
        question: match[1],
        answer: match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim(),
      }))
    : [];

  return (
    <>
      {page === 1 && !filtered(query) && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildFaqSchema(faqs)).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}

      <CategoryCatalogView
        title={category.seoH1 || `${category.name} en Tunisie`}
        categoryName={category.name}
        categorySlug={category.slug}
        description={category.seoIntro || category.shortDescription || category.description}
        crumbs={crumbs}
        products={products}
        totalCount={price || inStock ? products.length : meta.total}
        page={page}
        totalPages={price || inStock ? 1 : meta.totalPages}
        pageSize={24}
        pinnedProductId={pinned?.id}
        availableBrands={availableBrands}
        inStockCount={inStockCount}
        priceCounts={{
          under_60: under60Count,
          between_60_120: between60And120Count,
          above_120: above120Count,
        }}
        currentQuery={{
          q: search,
          brand,
          price,
          in_stock: inStock,
          sort,
        }}
        subcategoryTabs={subcategoryTabs}
        seoContent={page === 1 && !filtered(query) ? category.seoContent : null}
        faqs={faqs}
      />
    </>
  );
}
