import { fetchCategoryBySlug, fetchPaginatedProducts } from "@/lib/api/client";
import type { ProductSummary } from "@/lib/data/products";
import { type Cluster } from "./governorates";

/** Real categories each cluster highlights; a category is shown only if it exists and has in-stock products today. */
export const CLUSTER_CATEGORIES: Record<Cluster, string[]> = {
  parapharmacie: ["vitamines", "magnesium", "omega-3", "zinc", "ashwagandha", "collagene"],
  proteine: ["whey-proteine", "creatine", "whey-isolate", "gainers-proteines", "pre-workout", "bcaa", "eaa", "acides-amines"],
};

export type LocalCategory = { slug: string; name: string; inStock: number; total: number };
export type LocalPageData = { categories: LocalCategory[]; products: ProductSummary[]; inStockTotal: number; brands: string[] };

const PRODUCTS_PER_CATEGORY = 8;
const SHOWN_PRODUCTS = 8;

/**
 * Loads live catalogue data for a regional page. Nothing is invented: categories, stock, prices and brands come from the API.
 * Failures degrade to an empty selection (the quality gate in the page then marks it noindex).
 */
const CACHE_TTL_MS = 120_000;
const cache = new Map<Cluster, { at: number; value: Promise<LocalPageData> }>();

/**
 * Catalogue data is identical for all 24 governorates of a cluster, so it is loaded once and reused for 2 minutes
 * (shared across requests and in-flight loads). This only caches public catalogue data: cart, checkout and prices
 * charged at order time are always validated server-side. Stock shown on a page can lag by at most the TTL.
 */
export function loadLocalPageData(cluster: Cluster): Promise<LocalPageData> {
  const hit = cache.get(cluster);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  const value = loadUncached(cluster).then((data) => {
    if (data.categories.length === 0) cache.delete(cluster); // never keep an empty result from a failed load
    return data;
  }, (error) => { cache.delete(cluster); throw error; });
  cache.set(cluster, { at: Date.now(), value });
  return value;
}

async function loadUncached(cluster: Cluster): Promise<LocalPageData> {
  const slugs = CLUSTER_CATEGORIES[cluster];
  const rows = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const [category, result] = await Promise.all([fetchCategoryBySlug(slug), fetchPaginatedProducts({ category: slug, limit: PRODUCTS_PER_CATEGORY })]);
        if (!category) return null;
        const inStock = result.products.filter((p) => p.inStock !== false);
        return { slug, name: category.name, inStock, total: result.meta.total };
      } catch {
        return null;
      }
    }),
  );
  const present = rows.filter((r): r is NonNullable<typeof r> => Boolean(r) && r!.inStock.length > 0);
  const categories: LocalCategory[] = present.map((r) => ({ slug: r.slug, name: r.name, inStock: r.inStock.length, total: r.total }));

  // One product per category first (variety), then fill with the next available ones.
  const picked: ProductSummary[] = [];
  const seen = new Set<string>();
  for (let round = 0; picked.length < SHOWN_PRODUCTS && round < PRODUCTS_PER_CATEGORY; round++) {
    for (const r of present) {
      const p = r.inStock[round];
      if (p && !seen.has(p.id) && picked.length < SHOWN_PRODUCTS) {
        seen.add(p.id);
        picked.push(p);
      }
    }
  }
  const brands = Array.from(new Set(present.flatMap((r) => r.inStock.map((p) => p.brand)).filter((b): b is string => Boolean(b) && !/paratunisie|non renseign/i.test(b)))).slice(0, 8);
  const inStockTotal = present.reduce((sum, r) => sum + r.inStock.length, 0);
  return { categories, products: picked, inStockTotal, brands };
}

/** Minimum real content required before a regional page may be indexed (checked together with the pilot list). */
export function passesQualityGate(data: LocalPageData): boolean {
  return data.categories.length >= 3 && data.products.length >= 6;
}
