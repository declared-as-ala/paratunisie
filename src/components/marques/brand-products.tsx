"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/data/products";

const PAGE = 24;

type Sort = "relevance" | "price-asc" | "price-desc" | "name";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Default order: purchasable first, then pages Google can index, then alphabetical. */
function relevance(a: ProductSummary, b: ProductSummary): number {
  const stock = Number(b.inStock !== false) - Number(a.inStock !== false);
  if (stock) return stock;
  const index = Number(b.indexable !== false) - Number(a.indexable !== false);
  if (index) return index;
  return a.name.localeCompare(b.name, "fr");
}

export function BrandProducts({ brandName, products }: { brandName: string; products: ProductSummary[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");
  const [visible, setVisible] = useState(PAGE);

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const p of products) {
      const key = p.categorySlug || p.category;
      const entry = map.get(key) ?? { name: p.category, count: 0 };
      entry.count += 1;
      map.set(key, entry);
    }
    return [...map.entries()].map(([slug, v]) => ({ slug, ...v })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
  }, [products]);

  const inStockCount = useMemo(() => products.filter((p) => p.inStock !== false).length, [products]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const rows = products.filter((p) => {
      if (category && (p.categorySlug || p.category) !== category) return false;
      if (inStockOnly && p.inStock === false) return false;
      if (!q) return true;
      return normalize(p.name).includes(q) || normalize(p.benefit).includes(q) || normalize(p.category).includes(q);
    });
    const sorted = [...rows];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceMillimes - b.priceMillimes || relevance(a, b));
    else if (sort === "price-desc") sorted.sort((a, b) => b.priceMillimes - a.priceMillimes || relevance(a, b));
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    else sorted.sort(relevance);
    return sorted;
  }, [products, query, category, inStockOnly, sort]);

  const shown = filtered.slice(0, visible);
  const filtersActive = Boolean(query.trim() || category || inStockOnly);
  const reset = () => { setQuery(""); setCategory(null); setInStockOnly(false); setVisible(PAGE); };
  const chip = (active: boolean) =>
    `min-h-9 shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
      active ? "bg-primary text-primary-foreground shadow-sm" : "bg-white text-ink-muted ring-1 ring-border/70 hover:text-primary"
    }`;

  return (
    <section className="mt-10" aria-label={`Produits ${brandName}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="font-serif text-xl font-medium text-ink sm:text-2xl">Nos produits {brandName}</h2>
        {products.length > 1 && (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                placeholder={`Filtrer les produits ${brandName}…`}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setVisible(PAGE); }}
                aria-label={`Filtrer les produits ${brandName}`}
                className="h-11 w-full rounded-lg border border-border bg-card ps-9 pe-9 text-sm text-ink placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Effacer le filtre" className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <label className="sr-only" htmlFor="brand-sort">Trier les produits</label>
            <select
              id="brand-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-ink focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
            >
              <option value="relevance">En stock d&apos;abord</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A–Z</option>
            </select>
          </div>
        )}
      </div>

      {products.length > 1 && (categories.length > 1 || (inStockCount > 0 && inStockCount < products.length)) && (
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filtres">
          <button type="button" aria-pressed={category === null} onClick={() => { setCategory(null); setVisible(PAGE); }} className={chip(category === null)}>
            Toutes les catégories
          </button>
          {categories.slice(0, 12).map((c) => (
            <button key={c.slug} type="button" aria-pressed={category === c.slug} onClick={() => { setCategory(category === c.slug ? null : c.slug); setVisible(PAGE); }} className={chip(category === c.slug)}>
              {c.name} ({c.count})
            </button>
          ))}
          {inStockCount > 0 && inStockCount < products.length && (
            <button type="button" aria-pressed={inStockOnly} onClick={() => { setInStockOnly(!inStockOnly); setVisible(PAGE); }} className={chip(inStockOnly)}>
              En stock ({inStockCount})
            </button>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-muted" role="status" aria-live="polite">
        {filtered.length} produit{filtered.length > 1 ? "s" : ""}{filtersActive ? " correspondant aux filtres" : ""}
      </p>

      {filtered.length > 0 ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} variant="shop" />
            ))}
          </div>
          {filtered.length > shown.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="inline-flex h-11 items-center rounded-full border border-border bg-white px-6 text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Voir plus de produits ({filtered.length - shown.length} restants)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">Aucun produit ne correspond à ces filtres</p>
          <button type="button" onClick={reset} className="mt-3 text-sm text-primary hover:underline">
            Voir tous les produits {brandName}
          </button>
        </div>
      )}
    </section>
  );
}
