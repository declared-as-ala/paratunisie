"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, ShoppingBag, ChevronDown } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { ProductCard } from "@/components/product/product-card";
import { FilterControls, type ShopFilters } from "@/components/shop/filter-controls";
import { SearchOverlay } from "@/components/layout/navigation/search-overlay";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { type ProductSummary } from "@/lib/data/products";
import type { PaginationMeta } from "@/lib/api/client";

type FilterKey = "brands" | "categories" | "concerns";

function parseList(value: string | null) {
  return value?.split("|").filter(Boolean) ?? [];
}

const FAQ_ITEMS = [
  {
    q: "Quels produits puis-je trouver sur ParaTunisie ?",
    a: "ParaTunisie propose des milliers de produits de parapharmacie 100% authentiques : soins du visage, dermo-cosmétiques, protection solaire, produits capillaires, gamme bébé & maternité, ainsi que du matériel orthopédique et des compléments alimentaires."
  },
  {
    q: "Comment choisir un soin adapté à mon type de peau ou à mon besoin ?",
    a: "Vous pouvez utiliser nos filtres par catégorie ou par besoin (acné, taches, peau sèche, anti-âge) ou réaliser votre bilan personnalisé sur notre page Diagnostic."
  },
  {
    q: "Quels produits sont en stock et disponibles ?",
    a: "Tous les produits affichés avec la mention 'En stock' sont disponibles immédiatement dans notre entrepôt et prêts à être expédiés."
  },
  {
    q: "Livrez-vous partout en Tunisie ?",
    a: "Oui, nous livrons sur les 24 gouvernorats de la Tunisie sous 24h à 48h. La livraison est offerte à partir de 99 DT de commande."
  },
  {
    q: "Comment passer ma commande et payer à la livraison ?",
    a: "Vous pouvez commander directement sur le site ou via notre bouton 'Acheter maintenant' en 1-Clic sur la fiche produit. Le paiement s'effectue en espèces à la livraison."
  }
];

export function ShopPage({
  products,
  meta,
  availableBrands = [],
  availableCategories = [],
}: {
  products: ProductSummary[];
  meta?: PaginationMeta;
  availableBrands?: string[];
  availableCategories?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filters: ShopFilters = {
    brands: parseList(searchParams.get("brands") || searchParams.get("brand")),
    categories: parseList(searchParams.get("categories") || searchParams.get("category")),
    concerns: parseList(searchParams.get("concerns") || searchParams.get("concern")),
    maxPrice: Number(searchParams.get("maxPrice")) || 500,
  };
  const query = searchParams.get("q")?.trim() ?? "";
  const sort = searchParams.get("sort") ?? "recommended";

  const hasPriceFilter = filters.maxPrice < 500;

  /* Derive filter option lists */
  const allBrands = useMemo(
    () => (availableBrands.length ? availableBrands : [...new Set(products.map((p) => p.brand))].sort()),
    [availableBrands, products]
  );
  const allCategories = useMemo(
    () => (availableCategories.length ? availableCategories : [...new Set(products.map((p) => p.category))].sort()),
    [availableCategories, products]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.brand) counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [products]);

  function updateParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    
    startTransition(() => {
      router.replace(`${pathname}${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
    });
  }

  function toggleFilter(key: FilterKey, value: string) {
    const current = filters[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateParams({ [key]: next.length ? next.join("|") : null, page: null });
  }

  function removeFilterChip(type: FilterKey, value: string) {
    toggleFilter(type, value);
  }

  function clearAllFilters() {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  const PAGE_SIZE = meta?.limit || 24;
  const currentPage = meta?.page || Number(searchParams.get("page")) || 1;
  const totalProductsCount = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? Math.ceil(totalProductsCount / PAGE_SIZE) ?? 1;

  const activeCount =
    filters.brands.length + filters.categories.length + filters.concerns.length + (hasPriceFilter ? 1 : 0);

  const controls = (
    <FilterControls
      filters={filters}
      brands={allBrands}
      categories={allCategories}
      categoryCounts={categoryCounts}
      brandCounts={brandCounts}
      concerns={[]}
      onToggle={toggleFilter}
      onMaxPriceChange={(value) => updateParams({ maxPrice: value < 500 ? String(value) : null, page: null })}
      onClearAll={clearAllFilters}
    />
  );

  function goToPage(newPage: number) {
    updateParams({ page: newPage > 1 ? String(newPage) : null });
    window.scrollTo({ top: 300, behavior: "smooth" });
  }

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-ink pb-24 lg:pb-8">
      {/* ── 1. DIRECT COMPACT CATALOG HEADER ─────────────────────────── */}
      <section className="bg-gradient-to-r from-[#FAF3F0] via-[#FDFBF9] to-[#F7ECE8] border-b border-border/60">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-ink uppercase">
            Boutique — Parapharmacie en Tunisie
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            Affichage {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalProductsCount)} sur {totalProductsCount.toLocaleString("fr-FR")} produits disponibles
          </p>
        </div>
      </section>

      {/* ── 2. MAIN SHOP AREA: SIDEBAR + PRODUCT GRID ──────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Single Mobile Catalog Search Input */}
        <div className="mb-4 sm:hidden">
          <SearchOverlay variant="full" />
        </div>

        {/* Mobile Control Row: Sort Select (65%) + Filter Button (35%) */}
        <div className="grid grid-cols-[1.8fr_1fr] gap-2.5 mb-5 sm:hidden">
          <select
            aria-label="Trier par"
            value={sort}
            onChange={(event) =>
              updateParams({
                sort: event.target.value === "recommended" ? null : event.target.value,
                page: null,
              })
            }
            className="h-11 rounded-2xl border border-border/80 bg-white px-3 text-xs font-bold text-ink focus:outline-none focus:border-primary shadow-2xs cursor-pointer"
          >
            <option value="recommended">Popularité</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name">Nom (A → Z)</option>
          </select>

          <Button
            variant="outline"
            className="h-11 rounded-2xl border-border/80 bg-white font-bold text-xs gap-1.5 shadow-2xs text-ink hover:bg-soft-nude"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={15} className="text-primary" />
            <span>Filtres</span>
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[0.625rem] text-white font-extrabold">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr] items-start">
          {/* Left Desktop Sidebar Container */}
          <aside className="hidden lg:block sticky top-28 space-y-4 rounded-2xl border border-border/80 bg-white p-5 shadow-2xs" aria-label="Filtres produits">
            <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-2">
              <span className="font-serif text-sm font-bold text-ink flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-primary" />
                Filtres
              </span>
              {activeCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-bold text-primary border border-primary/20">
                  {activeCount} actif{activeCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {controls}
          </aside>

          {/* Right Product Grid Column */}
          <section aria-label="Produits">
            {/* Desktop Header Summary & Sort Toolbar */}
            <div className="hidden sm:block mb-5 rounded-2xl border border-border/70 bg-white p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-tabular text-base font-extrabold text-ink">
                    {totalProductsCount.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted">produits au catalogue</span>
                </div>

                {/* Desktop Sort Selector */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs font-semibold text-ink-muted">Trier par :</span>
                  <select
                    aria-label="Trier par"
                    value={sort}
                    onChange={(event) =>
                      updateParams({
                        sort: event.target.value === "recommended" ? null : event.target.value,
                        page: null,
                      })
                    }
                    className="h-9.5 rounded-xl border border-border bg-soft-nude/40 px-3 text-xs font-bold text-ink focus:outline-none focus:border-primary cursor-pointer transition-colors"
                  >
                    <option value="recommended">Popularité</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom (A → Z)</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips & Search Term Indicator */}
              {(activeCount > 0 || query) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-border/50">
                  {query && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold border border-primary/20">
                      Recherche : « {query} »
                      <button
                        type="button"
                        onClick={() => updateParams({ q: null, page: null })}
                        className="hover:text-rose-600 transition-colors"
                        aria-label="Effacer la recherche"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 rounded-full bg-soft-nude px-2.5 py-1 text-xs font-bold text-ink border border-border/70"
                    >
                      {cat}
                      <button type="button" onClick={() => removeFilterChip("categories", cat)} className="hover:text-rose-600 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {filters.brands.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full bg-soft-nude px-2.5 py-1 text-xs font-bold text-ink border border-border/70"
                    >
                      {b}
                      <button type="button" onClick={() => removeFilterChip("brands", b)} className="hover:text-rose-600 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-bold text-primary hover:underline ml-1"
                  >
                    Effacer tout
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid — 2 columns on mobile (compact vertical cards), 2-5 columns on desktop */}
            {isPending ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse rounded-2xl border border-border bg-white p-3.5 space-y-3">
                    <div className="aspect-square rounded-xl bg-soft-nude/70 w-full" />
                    <div className="h-3 bg-soft-nude rounded w-1/3" />
                    <div className="h-4 bg-soft-nude rounded w-3/4" />
                    <div className="h-8 bg-soft-nude rounded w-full pt-2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} variant="shop" />
                  ))}
                </div>

                {/* Numeric Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Pagination" className="mt-12 flex flex-wrap justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="rounded-xl text-xs font-bold gap-1 px-3 border-border"
                    >
                      <ChevronLeft size={14} /> <span className="hidden sm:inline">Précédent</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                        let pNum = currentPage;
                        if (totalPages <= 5) {
                          pNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pNum = totalPages - 4 + idx;
                        } else {
                          pNum = currentPage - 2 + idx;
                        }
                        return (
                          <button
                            key={pNum}
                            type="button"
                            onClick={() => goToPage(pNum)}
                            className={`size-8 sm:h-9 sm:min-w-9 sm:size-auto rounded-xl text-xs font-bold transition-all ${
                              currentPage === pNum
                                ? "bg-primary text-white shadow-2xs font-extrabold"
                                : "bg-white border border-border text-ink hover:bg-soft-nude"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && <span className="text-ink-muted px-1">...</span>}
                      {totalPages > 5 && (
                        <button
                          type="button"
                          onClick={() => goToPage(totalPages)}
                          className="size-8 sm:h-9 sm:min-w-9 sm:size-auto rounded-xl text-xs font-bold bg-white border border-border text-ink hover:bg-soft-nude"
                        >
                          {totalPages}
                        </button>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      className="rounded-xl text-xs font-bold gap-1 px-3 border-border"
                    >
                      <span className="hidden sm:inline">Suivant</span> <ChevronRight size={14} />
                    </Button>
                  </nav>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-xs">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-soft-nude text-ink-muted mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">Aucun produit ne correspond à vos critères</h2>
                <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-6 text-ink-muted">
                  {query ? (
                    <span>Aucun résultat trouvé pour « {query} ». Essayez d&apos;autres mots-clés.</span>
                  ) : (
                    "Essayez d'élargir votre recherche ou de supprimer quelques filtres pour découvrir notre sélection."
                  )}
                </p>
                <Button size="lg" className="mt-6 rounded-xl font-bold bg-primary text-white" onClick={clearAllFilters}>
                  Effacer tous les filtres
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* ── 3. BOTTOM FAQ & SEO BANNER ─────────────────────────────────── */}
        <section className="mt-14 rounded-3xl border border-border/80 bg-[#FAF1EE] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left SEO Column */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">Votre parapharmacie en ligne en Tunisie</h3>
              <p className="mt-3 text-xs sm:text-sm leading-6 text-ink-muted">
                ParaTunisie est votre destination beauté et bien-être de confiance. Nous sélectionnons pour vous des produits de <strong>parapharmacie authentiques</strong> au meilleur prix, livrés rapidement partout en Tunisie.
              </p>
              <p className="mt-2 text-xs sm:text-sm leading-6 text-ink-muted">
                Soins visage, corps, cheveux, hygiène, solaire, bébé ou compléments : retrouvez toutes vos marques préférées et profitez d&apos;une expérience d&apos;achat simple et agréable.
              </p>

              {/* Tag Pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {["Soin visage", "Soin corps", "Soin capillaire", "Protection solaire", "Bébé & Maternité", "Hygiène", "Compléments alimentaires"].map((tag) => (
                  <span key={tag} className="rounded-full bg-white border border-border/60 px-3 py-1 text-[0.6875rem] font-semibold text-ink-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Accordion FAQ Column */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink mb-4">Questions fréquentes</h3>
              <div className="space-y-2">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="rounded-xl border border-border/70 bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-3.5 text-xs sm:text-sm font-bold text-ink text-left"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={14} className={`text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs sm:text-sm leading-5 text-ink-muted border-t border-border/40 pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Filter Button on Mobile (Positioned comfortably above bottom navigation bar) */}
      <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] end-4 z-30 lg:hidden">
        <Button
          size="lg"
          className="rounded-full font-bold shadow-lg bg-primary text-white gap-2 px-5 py-3 border border-white/20"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal size={16} />
          <span>Filtrer</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-white text-primary px-2 py-0.5 text-xs font-extrabold">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="max-h-[88dvh] rounded-t-3xl p-0">
          <SheetHeader className="border-b border-border px-5 py-4 pe-14">
            <SheetTitle className="text-lg font-serif font-bold text-ink flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-primary" />
              Filtrer les produits
            </SheetTitle>
            <SheetDescription className="text-xs">
              {totalProductsCount.toLocaleString("fr-FR")} produits disponibles
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-5 py-4 pb-28">{controls}</div>
          <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t border-border bg-white p-4 shadow-lg">
            <Button variant="outline" size="lg" className="flex-1 rounded-xl font-bold" onClick={clearAllFilters}>
              Effacer tout
            </Button>
            <Button size="lg" className="flex-2 rounded-xl font-bold bg-primary text-white" onClick={() => setFilterOpen(false)}>
              Afficher {totalProductsCount.toLocaleString("fr-FR")} produits
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

