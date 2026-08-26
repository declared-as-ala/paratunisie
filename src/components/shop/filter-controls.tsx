"use client";

import { useMemo, useState, useDeferredValue } from "react";
import { Search, ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react";

export type ShopFilters = {
  brands: string[];
  categories: string[];
  concerns: string[];
  maxPrice: number;
  inStockOnly?: boolean;
};

type FilterControlsProps = {
  filters: ShopFilters;
  brands: string[];
  categories: string[];
  concerns: string[];
  categoryCounts?: Record<string, number>;
  brandCounts?: Record<string, number>;
  onToggle: (key: "brands" | "categories" | "concerns", value: string) => void;
  onMaxPriceChange: (value: number) => void;
  onClearAll?: () => void;
};

export function FilterControls({
  filters,
  brands,
  categories,
  categoryCounts,
  brandCounts,
  onToggle,
  onMaxPriceChange,
  onClearAll,
}: FilterControlsProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);

  // Section collapse state
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    categories: false,
    brands: false,
    price: false,
    availability: false,
  });

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const deferredCategorySearch = useDeferredValue(categorySearch);
  const deferredBrandSearch = useDeferredValue(brandSearch);
  const [brandLimit, setBrandLimit] = useState(18);

  // Fast Set lookups for selected filter items
  const selectedBrandsSet = useMemo(() => new Set(filters.brands), [filters.brands]);
  const selectedCategoriesSet = useMemo(() => new Set(filters.categories), [filters.categories]);

  // Search filter applied to categories
  const filteredCategories = useMemo(() => {
    if (!deferredCategorySearch.trim()) return categories;
    const q = deferredCategorySearch.toLowerCase().trim();
    return categories.filter((cat) => cat.toLowerCase().includes(q));
  }, [categories, deferredCategorySearch]);

  // Search filter applied to brands
  const filteredBrands = useMemo(() => {
    if (!deferredBrandSearch.trim()) return brands;
    const q = deferredBrandSearch.toLowerCase().trim();
    return brands.filter((b) => b.toLowerCase().includes(q));
  }, [brands, deferredBrandSearch]);

  // Paginated/capped brand rendering list to keep DOM nodes lightweight
  const visibleBrands = useMemo(() => {
    if (deferredBrandSearch.trim()) {
      return filteredBrands.slice(0, 30);
    }
    return filteredBrands.slice(0, brandLimit);
  }, [filteredBrands, deferredBrandSearch, brandLimit]);

  return (
    <div className="space-y-5 text-xs text-ink">
      {/* ── 1. CATÉGORIES ─────────────────────────────────────────────────── */}
      <div className="border-b border-border/70 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between font-serif font-bold text-sm text-ink mb-3"
        >
          <span className="flex items-center gap-2">
            <span className="size-4 rounded border border-primary/30 bg-primary/10 flex items-center justify-center text-[0.65rem] text-primary">
              ⊞
            </span>
            Catégories
          </span>
          {collapsed.categories ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsed.categories && (
          <div className="space-y-2.5">
            {/* Category Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Rechercher une catégorie..."
                className="w-full h-8 rounded-xl border border-border/80 bg-white pl-8 pr-7 text-[0.725rem] font-medium text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-primary"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {filteredCategories.map((cat) => {
                const isChecked = selectedCategoriesSet.has(cat);
                const count = categoryCounts?.[cat];

                return (
                  <label
                    key={cat}
                    className="flex items-center justify-between gap-2 py-1 px-1 rounded-md cursor-pointer hover:bg-soft-nude/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle("categories", cat)}
                        className="size-3.5 rounded border-border text-primary accent-primary shrink-0"
                      />
                      <span className="truncate font-medium text-ink">{cat}</span>
                    </div>
                    {count !== undefined && (
                      <span className="text-[0.6875rem] font-medium text-ink-muted/80 shrink-0">
                        ({count})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. MARQUES ────────────────────────────────────────────────────── */}
      <div className="border-b border-border/70 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("brands")}
          className="w-full flex items-center justify-between font-serif font-bold text-sm text-ink mb-3"
        >
          <span className="flex items-center gap-2">
            <span className="size-4 rounded border border-primary/30 bg-primary/10 flex items-center justify-center text-[0.65rem] text-primary">
              🏷️
            </span>
            Marques
          </span>
          {collapsed.brands ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsed.brands && (
          <div className="space-y-2.5">
            {/* Brand Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Rechercher une marque..."
                className="w-full h-8 rounded-xl border border-border/80 bg-white pl-8 pr-7 text-[0.725rem] font-medium text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-primary"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {visibleBrands.map((brand) => {
                const isChecked = selectedBrandsSet.has(brand);
                const count = brandCounts?.[brand];

                return (
                  <label
                    key={brand}
                    className="flex items-center justify-between gap-2 py-1 px-1 rounded-md cursor-pointer hover:bg-soft-nude/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle("brands", brand)}
                        className="size-3.5 rounded border-border text-primary accent-primary shrink-0"
                      />
                      <span className="truncate font-medium text-ink">{brand}</span>
                    </div>
                    {count !== undefined && (
                      <span className="text-[0.6875rem] font-medium text-ink-muted/80 shrink-0">
                        ({count})
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {filteredBrands.length > visibleBrands.length && !brandSearch && (
              <button
                type="button"
                onClick={() => setBrandLimit((prev) => prev + 20)}
                className="text-[0.7rem] font-bold text-primary hover:underline pt-1 block"
              >
                Voir plus de marques (+{filteredBrands.length - visibleBrands.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. PRIX ───────────────────────────────────────────────────────── */}
      <div className="border-b border-border/70 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between font-serif font-bold text-sm text-ink mb-3"
        >
          <span className="flex items-center gap-2">
            <span className="size-4 rounded border border-primary/30 bg-primary/10 flex items-center justify-center text-[0.65rem] text-primary">
              💰
            </span>
            Prix
          </span>
          {collapsed.price ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsed.price && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-[0.7rem] font-semibold text-ink-muted">
              <span>0 DT</span>
              <span className="font-bold text-primary">300 DT+</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={filters.maxPrice}
              onChange={(event) => onMaxPriceChange(Number(event.target.value))}
              aria-label="Prix maximum en dinars"
              className="h-1.5 w-full accent-primary bg-border rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-2 pt-1 text-[0.7rem]">
              <div>
                <label className="block text-ink-muted mb-0.5">Min.</label>
                <div className="h-8 rounded-xl border border-border bg-white flex items-center px-2.5 font-bold text-ink">
                  0 DT
                </div>
              </div>
              <div>
                <label className="block text-ink-muted mb-0.5">Max.</label>
                <div className="h-8 rounded-xl border border-border bg-white flex items-center px-2.5 font-bold text-ink">
                  {filters.maxPrice} DT+
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. DISPONIBILITÉ ──────────────────────────────────────────────── */}
      <div className="border-b border-border/70 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between font-serif font-bold text-sm text-ink mb-3"
        >
          <span className="flex items-center gap-2">
            <span className="size-4 rounded border border-primary/30 bg-primary/10 flex items-center justify-center text-[0.65rem] text-primary">
              📦
            </span>
            Disponibilité
          </span>
          {collapsed.availability ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsed.availability && (
          <label className="flex items-center gap-2.5 py-1 px-1 cursor-pointer hover:bg-soft-nude/60 rounded-md">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="size-3.5 rounded border-border text-primary accent-primary shrink-0"
            />
            <span className="font-medium text-ink truncate">En stock uniquement</span>
            <span className="text-[0.6875rem] font-medium text-ink-muted/80 ml-auto">(6 352)</span>
          </label>
        )}
      </div>

      {/* ── BOTTOM ACTION: RÉINITIALISER LES FILTRES ─────────────────────── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onClearAll}
          className="w-full h-10 rounded-xl border border-border bg-white hover:bg-soft-nude/50 font-bold text-xs text-ink flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <RefreshCw size={13} className="text-ink-muted" />
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}
