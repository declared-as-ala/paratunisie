import type { Metadata } from "next";
import { fetchPaginatedProducts } from "@/lib/api/client";
import { CategoryCatalogView } from "@/components/category/category-catalog-view";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { ProductSummary } from "@/lib/data/products";

export const dynamic = "force-dynamic";

type Query = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<Query> };

const scalar = (value: Query[string]) => (typeof value === "string" ? value : "");
const pageNumber = (query: Query) => Math.max(1, Math.floor(Number(scalar(query.page)) || 1));

export const metadata: Metadata = {
  title: "Bien-être, Sommeil & Anti-Stress en Tunisie | Ashwagandha & Magnésium | ParaTunisie",
  description:
    "Achetez vos compléments de bien-être en Tunisie : Ashwagandha BioTechUSA, Magnésium marin et bisglycinate pour soulager le stress, l'anxiété et retrouver un sommeil réparateur.",
  alternates: {
    canonical: buildCanonicalUrl("/bien-etre"),
  },
};

export default async function BienEtrePage({ searchParams }: Props) {
  const query = await searchParams;
  const page = pageNumber(query);
  const activeTab = scalar(query.tab) || "all"; // 'all' | 'ashwagandha' | 'magnesium'
  const searchFilter = scalar(query.q);
  const brandFilter = scalar(query.brand);
  const sortFilter = scalar(query.sort);
  const priceFilter = scalar(query.price);
  const stockFilter = scalar(query.in_stock);

  // Fetch products from Ashwagandha, Magnesium, and Sommeil-Stress
  const [resAshwagandha, resMagnesium, resSommeil] = await Promise.all([
    fetchPaginatedProducts({ category: "ashwagandha", limit: 40 }),
    fetchPaginatedProducts({ category: "magnesium", limit: 40 }),
    fetchPaginatedProducts({ category: "sommeil-stress", limit: 40 }).catch(() => ({
      products: [] as ProductSummary[],
      meta: { total: 0, totalPages: 1 },
    })),
  ]);

  // Combine products without duplicates, pinning Ashwagandha BioTechUSA first
  const allMap = new Map<string, ProductSummary>();
  [...resAshwagandha.products, ...resMagnesium.products, ...(resSommeil.products || [])].forEach(
    (p) => {
      allMap.set(p.id, p);
    }
  );
  const allProducts = Array.from(allMap.values());

  const ashwagandhaCount = allProducts.filter(
    (p) => p.name.toLowerCase().includes("ashwagandha") || p.categorySlug === "ashwagandha"
  ).length;
  const magnesiumCount = allProducts.filter(
    (p) => p.name.toLowerCase().includes("magn") || p.categorySlug === "magnesium"
  ).length;

  // Facet counts across the current tab
  let combined = [...allProducts];
  if (activeTab === "ashwagandha") {
    combined = combined.filter(
      (p) => p.name.toLowerCase().includes("ashwagandha") || p.categorySlug === "ashwagandha"
    );
  } else if (activeTab === "magnesium") {
    combined = combined.filter(
      (p) => p.name.toLowerCase().includes("magn") || p.categorySlug === "magnesium"
    );
  }

  // Compute sidebar facet counts from tab products
  const brandCountMap = new Map<string, number>();
  let inStockCount = 0;
  let under60Count = 0;
  let between60And120Count = 0;
  let above120Count = 0;

  for (const p of combined) {
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

  // Apply search, brand, price, stock filters
  if (searchFilter) {
    const s = searchFilter.toLowerCase();
    combined = combined.filter(
      (p) => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s)
    );
  }
  if (brandFilter) {
    combined = combined.filter((p) => p.brand.toLowerCase() === brandFilter.toLowerCase());
  }
  if (priceFilter === "under_60") {
    combined = combined.filter((p) => p.priceMillimes < 60000);
  } else if (priceFilter === "60_120") {
    combined = combined.filter((p) => p.priceMillimes >= 60000 && p.priceMillimes <= 120000);
  } else if (priceFilter === "above_120") {
    combined = combined.filter((p) => p.priceMillimes > 120000);
  }
  if (stockFilter === "in_stock") {
    combined = combined.filter((p) => p.inStock !== false);
  }

  // Sort (default pins BioTechUSA Ashwagandha first)
  const pinnedProduct = combined.find((p) => p.slug === "ashwagandha-60-gelules-biotech-usa");
  if (sortFilter === "price_asc") {
    combined.sort((a, b) => a.priceMillimes - b.priceMillimes);
  } else if (sortFilter === "price_desc") {
    combined.sort((a, b) => b.priceMillimes - a.priceMillimes);
  } else if (sortFilter === "name") {
    combined.sort((a, b) => a.name.localeCompare(b.name));
  } else if (pinnedProduct) {
    combined = [pinnedProduct, ...combined.filter((p) => p.id !== pinnedProduct.id)];
  }

  // Pagination (24 per page)
  const pageSize = 24;
  const total = combined.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedProducts = combined.slice((page - 1) * pageSize, page * pageSize);

  const tabUrl = (tab: string) => {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    if (sortFilter) params.set("sort", sortFilter);
    const qs = params.toString();
    return `/bien-etre${qs ? `?${qs}` : ""}`;
  };

  return (
    <CategoryCatalogView
      title="Compléments Bien-être, Sommeil & Anti-Stress"
      categoryName="Bien-être & Sommeil"
      categorySlug="bien-etre"
      description="Sélection complète d'Ashwagandha et de Magnésium en Tunisie pour réduire le stress, abaisser le cortisol et retrouver un sommeil réparateur."
      crumbs={[
        { name: "Accueil", url: "/" },
        { name: "Compléments alimentaires", url: "/complements-alimentaires" },
        { name: "Bien-être & Sommeil", url: "/bien-etre" },
      ]}
      products={paginatedProducts}
      totalCount={total}
      page={page}
      totalPages={totalPages}
      pageSize={pageSize}
      pinnedProductId={pinnedProduct?.id}
      availableBrands={availableBrands}
      inStockCount={inStockCount}
      priceCounts={{
        under_60: under60Count,
        between_60_120: between60And120Count,
        above_120: above120Count,
      }}
      currentQuery={{
        tab: activeTab,
        q: searchFilter,
        brand: brandFilter,
        price: priceFilter,
        in_stock: stockFilter,
        sort: sortFilter,
      }}
      subcategoryTabs={[
        {
          key: "all",
          label: "Tous les compléments",
          href: tabUrl("all"),
          active: activeTab === "all",
          count: allProducts.length,
        },
        {
          key: "ashwagandha",
          label: "🌿 Ashwagandha",
          href: tabUrl("ashwagandha"),
          active: activeTab === "ashwagandha",
          count: ashwagandhaCount,
        },
        {
          key: "magnesium",
          label: "⚡ Magnésium",
          href: tabUrl("magnesium"),
          active: activeTab === "magnesium",
          count: magnesiumCount,
        },
      ]}
    />
  );
}
