"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { type ProductSummary } from "@/lib/data/products";
import type { PaginationMeta } from "@/lib/api/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ─── Types ──────────────────────────────────────────────────────── */

type CategoryData = {
  slug: string;
  name: string;
  h1?: string;
  eyebrow?: string;
  description: string;
  subcategories: Array<{ slug: string; name: string }>;
  concerns: Array<{ slug: string; name: string }>;
};

/* ─── Helpers ────────────────────────────────────────────────────── */

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function extractUnique(list: ProductSummary[], key: "brand" | "skinTypes"): string[] {
  const set = new Set<string>();
  for (const p of list) {
    if (key === "brand") set.add(p.brand);
    else p.skinTypes.forEach((st) => set.add(st));
  }
  return [...set].sort();
}

type SortKey = "pertinence" | "prix-croissant" | "prix-descroissant";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-croissant", label: "Prix croissant" },
  { value: "prix-descroissant", label: "Prix décroissant" },
];

type FilterState = {
  brands: string[];
  concerns: string[];
  skinTypes: string[];
  maxPrice: number;
};

const EMPTY_FILTERS: FilterState = { brands: [], concerns: [], skinTypes: [], maxPrice: 1000 };

/* ─── Subcategory Chips ──────────────────────────────────────────── */

function SubcategoryChips({
  subcategories,
  active,
  onSelect,
}: {
  subcategories: CategoryData["subcategories"];
  active: string | null;
  onSelect: (slug: string | null) => void;
}) {
  if (subcategories.length === 0) return null;
  return (
    <nav aria-label="Sous-catégories" className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button type="button" onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${active === null ? "border-primary bg-primary text-primary-foreground" : "border-border text-ink hover:border-primary/40 hover:text-primary"}`}>
        Tous
      </button>
      {subcategories.map((sub) => (
        <button key={sub.slug} type="button" onClick={() => onSelect(sub.slug)}
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${active === sub.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-ink hover:border-primary/40 hover:text-primary"}`}>
          {sub.name}
        </button>
      ))}
    </nav>
  );
}

/* ─── Concern Chips ──────────────────────────────────────────────── */

function ConcernChips({
  concerns,
  active,
  onSelect,
}: {
  concerns: CategoryData["concerns"];
  active: string | null;
  onSelect: (slug: string | null) => void;
}) {
  if (concerns.length === 0) return null;
  return (
    <section aria-label="Choisir selon votre besoin">
      <h2 className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">Choisir selon votre besoin</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {concerns.map((c) => (
          <button key={c.slug} type="button" onClick={() => onSelect(active === c.slug ? null : c.slug)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active === c.slug ? "border-primary bg-primary/10 text-primary" : "border-border text-ink hover:border-primary/40 hover:text-primary"}`}>
            {c.name}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── Active Filter Chips ────────────────────────────────────────── */

function ActiveFilters({
  filters, onRemove, onClear,
}: {
  filters: FilterState;
  onRemove: (key: keyof FilterState, value: string) => void;
  onClear: () => void;
}) {
  const chips: Array<{ key: keyof FilterState; label: string; value: string }> = [];
  filters.brands.forEach((b) => chips.push({ key: "brands", label: b, value: b }));
  filters.concerns.forEach((c) => chips.push({ key: "concerns", label: c, value: c }));
  filters.skinTypes.forEach((s) => chips.push({ key: "skinTypes", label: s, value: s }));
  if (filters.maxPrice < 1000) chips.push({ key: "maxPrice", label: `Max ${filters.maxPrice} DT`, value: String(filters.maxPrice) });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span key={`${chip.key}-${chip.value}`} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {chip.label}
          <button type="button" onClick={() => onRemove(chip.key, chip.value)} aria-label={`Retirer ${chip.label}`} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"><X className="size-3" /></button>
        </span>
      ))}
      <button type="button" onClick={onClear} className="text-xs text-muted-foreground hover:text-ink">Réinitialiser</button>
    </div>
  );
}

/* ─── Filter Panel ───────────────────────────────────────────────── */

function FilterPanel({
  filters, brands, concernNames, skinTypes, onToggle, onMaxPriceChange,
}: {
  filters: FilterState;
  brands: string[];
  concernNames: string[];
  skinTypes: string[];
  onToggle: (key: "brands" | "concerns" | "skinTypes", value: string) => void;
  onMaxPriceChange: (value: number) => void;
}) {
  return (
    <div>
      {brands.length > 0 && (
        <fieldset className="border-b border-border py-5 first:pt-0">
          <legend className="mb-3 text-sm font-semibold text-ink">Marque</legend>
          <div className="space-y-0.5">
            {brands.map((brand) => (
              <label key={brand} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-ink hover:bg-soft-nude">
                <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => onToggle("brands", brand)} className="size-4 accent-primary" />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {concernNames.length > 0 && (
        <fieldset className="border-b border-border py-5">
          <legend className="mb-3 text-sm font-semibold text-ink">Besoin</legend>
          <div className="space-y-0.5">
            {concernNames.map((c) => (
              <label key={c} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-ink hover:bg-soft-nude">
                <input type="checkbox" checked={filters.concerns.includes(c)} onChange={() => onToggle("concerns", c)} className="size-4 accent-primary" />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {skinTypes.length > 0 && (
        <fieldset className="border-b border-border py-5">
          <legend className="mb-3 text-sm font-semibold text-ink">Type de peau</legend>
          <div className="space-y-0.5">
            {skinTypes.map((st) => (
              <label key={st} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-ink hover:bg-soft-nude">
                <input type="checkbox" checked={filters.skinTypes.includes(st)} onChange={() => onToggle("skinTypes", st)} className="size-4 accent-primary" />
                <span>{st}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className="pt-5">
        <legend className="text-sm font-semibold text-ink">Prix maximum</legend>
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>0 DT</span>
          <output className="font-medium text-ink">{filters.maxPrice >= 1000 ? "Tous les prix" : `${filters.maxPrice} DT`}</output>
        </div>
        <input type="range" min="10" max="600" step="10" value={filters.maxPrice > 600 ? 600 : filters.maxPrice} onChange={(e) => onMaxPriceChange(Number(e.target.value) >= 600 ? 1000 : Number(e.target.value))} aria-label="Prix maximum" className="mt-2 h-10 w-full accent-primary" />
      </fieldset>
    </div>
  );
}

/* ─── Main PLP Component ─────────────────────────────────────────── */

export function CategoryPLP({
  category,
  products,
  subcategoryMap,
  concernMap,
  searchParams,
  meta,
}: {
  category: CategoryData;
  products: ProductSummary[];
  /** subcategory slug → set of product IDs that belong to it */
  subcategoryMap: Record<string, string[]>;
  /** concern name → set of product IDs that match */
  concernMap: Record<string, string[]>;
  searchParams: Record<string, string | string[] | undefined>;
  meta: PaginationMeta;
}) {
  const parseList = (v: string | string[] | undefined): string[] =>
    Array.isArray(v) ? v : v ? [v] : [];

  const [filters, setFilters] = useState<FilterState>({
    brands: parseList(searchParams.brands),
    concerns: parseList(searchParams.concerns),
    skinTypes: parseList(searchParams.skinTypes),
    maxPrice: Number(searchParams.maxPrice) || 1000,
  });
  const [sort, setSort] = useState<SortKey>((searchParams.sort as SortKey) || "pertinence");
  const [query, setQuery] = useState(searchParams.q?.toString() || "");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(searchParams.subcategory?.toString() || null);
  const [activeConcern, setActiveConcern] = useState<string | null>(searchParams.concern?.toString() || null);
  const [filterOpen, setFilterOpen] = useState(false);

  const allBrands = useMemo(() => extractUnique(products, "brand"), [products]);
  const allSkinTypes = useMemo(() => extractUnique(products, "skinTypes"), [products]);
  const allConcernNames = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.concerns.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* Subcategory filter via map */
    if (activeSubcategory && subcategoryMap[activeSubcategory]) {
      const ids = new Set(subcategoryMap[activeSubcategory]);
      result = result.filter((p) => ids.has(p.id));
    }

    /* Concern chip filter via map */
    if (activeConcern) {
      const concernName = category.concerns.find((c) => c.slug === activeConcern)?.name;
      if (concernName && concernMap[concernName]) {
        const ids = new Set(concernMap[concernName]);
        result = result.filter((p) => ids.has(p.id));
      }
    }

    if (filters.brands.length > 0) result = result.filter((p) => filters.brands.includes(p.brand));
    if (filters.concerns.length > 0) result = result.filter((p) => p.concerns.some((c) => filters.concerns.includes(c)));
    if (filters.skinTypes.length > 0) result = result.filter((p) => p.skinTypes.some((st) => filters.skinTypes.includes(st)));
    if (filters.maxPrice < 1000) {
      result = result.filter((p) => p.priceMillimes / 1000 <= filters.maxPrice);
    }

    if (query.trim()) {
      const q = normalize(query.trim());
      result = result.filter((p) => normalize(p.name).includes(q) || normalize(p.benefit).includes(q) || normalize(p.brand).includes(q));
    }

    if (sort === "prix-croissant") result.sort((a, b) => a.priceMillimes - b.priceMillimes);
    else if (sort === "prix-descroissant") result.sort((a, b) => b.priceMillimes - a.priceMillimes);

    return result;
  }, [products, subcategoryMap, concernMap, category.concerns, filters, sort, query, activeSubcategory, activeConcern]);

  const toggleFilter = useCallback((key: "brands" | "concerns" | "skinTypes", value: string) => {
    setFilters((prev) => {
      const cur = prev[key];
      return { ...prev, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  }, []);

  const removeFilter = useCallback((key: keyof FilterState, value: string) => {
    if (key === "maxPrice") setFilters((prev) => ({ ...prev, maxPrice: 1000 }));
    else setFilters((prev) => ({ ...prev, [key]: (prev[key] as string[]).filter((v) => v !== value) }));
  }, []);

  const clearFilters = useCallback(() => { setFilters(EMPTY_FILTERS); setQuery(""); setActiveSubcategory(null); setActiveConcern(null); }, []);

  const activeFilterCount = filters.brands.length + filters.concerns.length + filters.skinTypes.length + (filters.maxPrice < 1000 ? 1 : 0);
  const hasActive = activeFilterCount > 0 || query.trim().length > 0 || activeSubcategory !== null || activeConcern !== null;

  const filterContent = (
    <FilterPanel filters={filters} brands={allBrands} concernNames={allConcernNames} skinTypes={allSkinTypes} onToggle={toggleFilter} onMaxPriceChange={(v) => setFilters((prev) => ({ ...prev, maxPrice: v }))} />
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-muted-foreground sm:text-sm">
        <ol className="flex items-center gap-1.5 sm:gap-2">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li aria-hidden className="text-muted-foreground/50">/</li>
          <li><Link href="/shop" className="hover:text-primary">Shop</Link></li>
          <li aria-hidden className="text-muted-foreground/50">/</li>
          <li aria-current="page" className="text-ink">{category.name}</li>
        </ol>
      </nav>

      {/* Intro */}
      <header>
        {category.eyebrow && <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-sm">{category.eyebrow}</p>}
        <h1 className="mt-1.5 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">{category.h1 || category.name}</h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{category.description}</p>
      </header>

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <div className="mt-6">
          <SubcategoryChips subcategories={category.subcategories} active={activeSubcategory} onSelect={setActiveSubcategory} />
        </div>
      )}

      {/* Concerns */}
      {category.concerns.length > 0 && !activeSubcategory && (
        <div className="mt-6">
          <ConcernChips concerns={category.concerns} active={activeConcern} onSelect={setActiveConcern} />
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <strong className="text-ink">{hasActive ? filteredProducts.length : meta.total}</strong> produit{(hasActive ? filteredProducts.length : meta.total) === 1 ? "" : "s"}
          </p>
          {hasActive && <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline">Tout effacer</button>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input type="search" placeholder={`Rechercher dans ${category.name}…`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`Rechercher dans ${category.name}`} className="h-9 w-48 rounded-lg border border-border bg-card ps-8 pr-8 text-xs text-ink placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:w-56" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer" className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"><X className="size-3" /></button>}
          </div>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="size-4" />Filtrer
            {activeFilterCount > 0 && <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{activeFilterCount}</span>}
          </Button>
          <label htmlFor="category-sort" className="sr-only">Trier</label>
          <select id="category-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {hasActive && <div className="mt-3"><ActiveFilters filters={filters} onRemove={removeFilter} onClear={clearFilters} /></div>}

      {/* Mobile search */}
      <div className="mt-3 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" placeholder={`Rechercher dans ${category.name}…`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`Rechercher dans ${category.name}`} className="h-10 w-full rounded-lg border border-border bg-card ps-9 pr-9 text-sm text-ink placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer" className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"><X className="size-3.5" /></button>}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtres">
          <div className="sticky top-28">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Filtrer</h2>
              {hasActive && <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline">Tout effacer</button>}
            </div>
            {filterContent}
          </div>
        </aside>
        <section aria-label={`Produits ${category.name}`}>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} variant="shop" />)}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-soft-nude"><Search className="size-5 text-muted-foreground" aria-hidden="true" /></div>
              <p className="mt-4 text-sm font-medium text-ink">Aucun produit ne correspond à ces filtres</p>
              <p className="mt-1 text-xs text-muted-foreground">Essayez de modifier vos filtres pour retrouver nos soins {category.name}.</p>
              <Button variant="outline" size="lg" className="mt-6" onClick={clearFilters}>Réinitialiser les filtres</Button>
            </div>
          )}
          {!hasActive && meta.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {meta.page > 1 && <Link rel="prev" href={meta.page === 2 ? `/${category.slug}` : `/${category.slug}?page=${meta.page - 1}`} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-soft-nude">Précédent</Link>}
              {Array.from({ length: meta.totalPages }, (_, index) => index + 1).filter((page) => page === 1 || page === meta.totalPages || Math.abs(page - meta.page) <= 2).map((page) => (
                <Link key={page} href={page === 1 ? `/${category.slug}` : `/${category.slug}?page=${page}`} aria-current={page === meta.page ? "page" : undefined} className={`min-w-9 rounded-lg border px-3 py-2 text-center text-sm font-medium ${page === meta.page ? "border-primary bg-primary text-white" : "border-border hover:bg-soft-nude"}`}>{page}</Link>
              ))}
              {meta.page < meta.totalPages && <Link rel="next" href={`/${category.slug}?page=${meta.page + 1}`} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-soft-nude">Suivant</Link>}
            </nav>
          )}
        </section>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-2xl">
          <SheetHeader className="border-b border-border pe-16">
            <SheetTitle className="text-xl">Filtrer</SheetTitle>
            <SheetDescription>{filteredProducts.length} produit{filteredProducts.length === 1 ? "" : "s"} disponible{filteredProducts.length === 1 ? "" : "s"}</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-28">{filterContent}</div>
          <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t border-border bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button variant="outline" size="lg" className="flex-1" onClick={clearFilters}>Effacer</Button>
            <Button size="lg" className="flex-1" onClick={() => setFilterOpen(false)}>Voir {filteredProducts.length} produit{filteredProducts.length === 1 ? "" : "s"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
