"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Filter, ShoppingBag, ShieldCheck, Truck, CreditCard, ChevronDown, Search } from "lucide-react";
import { useMemo, useState, useEffect, useTransition } from "react";

import { ProductCard } from "@/components/product/product-card";
import { FilterControls, type ShopFilters } from "@/components/shop/filter-controls";
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
    maxPrice: Number(searchParams.get("maxPrice")) || 100,
  };
  const query = searchParams.get("q")?.trim() ?? "";
  const sort = searchParams.get("sort") ?? "recommended";
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const hasPriceFilter = filters.maxPrice < 100;

  /* Derive filter option lists */
  const allBrands = useMemo(
    () => (availableBrands.length ? availableBrands : [...new Set(products.map((p) => p.brand))].sort()),
    [availableBrands, products]
  );
  const allCategories = useMemo(
    () => (availableCategories.length ? availableCategories : [...new Set(products.map((p) => p.category))].sort()),
    [availableCategories, products]
  );

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
    setSearchValue("");
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
      concerns={[]}
      onToggle={toggleFilter}
      onMaxPriceChange={(value) => updateParams({ maxPrice: value < 100 ? String(value) : null, page: null })}
      onClearAll={clearAllFilters}
    />
  );

  function goToPage(newPage: number) {
    updateParams({ page: newPage > 1 ? String(newPage) : null });
    window.scrollTo({ top: 400, behavior: "smooth" });
  }

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-ink">
      {/* ── 1. TOP HERO BANNER WITH SEARCH BAR ────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#FAF3F0] via-[#FDFBF9] to-[#F7ECE8] border-b border-border/60">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] items-center gap-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              Toute la parapharmacie,<br />au même endroit
            </h1>
            <p className="mt-3 max-w-xl text-xs sm:text-sm text-ink-muted leading-relaxed">
              Découvrez des milliers de soins pour prendre soin de vous. Recherchez facilement par produit, marque ou besoin.
            </p>

            {/* ── PROMINENT SEARCH BAR ─────────────────────────────────────── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ q: searchValue.trim() || null, page: null });
              }}
              className="mt-5 max-w-xl relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  updateParams({ q: e.target.value.trim() || null, page: null });
                }}
                placeholder="Rechercher un produit, une marque, un besoin (ex: CeraVe, Solaire, Acné)..."
                className="w-full h-12 rounded-2xl border border-border/90 bg-white pl-12 pr-10 text-xs sm:text-sm font-medium text-ink shadow-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    updateParams({ q: null, page: null });
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
                >
                  <X className="size-4" />
                </button>
              )}
            </form>

            {/* 3 Reassurance Badges Pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white border border-border/80 px-3.5 py-2 shadow-2xs text-xs font-semibold text-ink">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-ink block">Produits authentiques</span>
                  <span className="text-[0.65rem] text-ink-muted">Sélection rigoureuse</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-white border border-border/80 px-3.5 py-2 shadow-2xs text-xs font-semibold text-ink">
                <Truck className="size-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-ink block">Livraison partout en Tunisie</span>
                  <span className="text-[0.65rem] text-ink-muted">Rapide et sécurisée</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-white border border-border/80 px-3.5 py-2 shadow-2xs text-xs font-semibold text-ink">
                <CreditCard className="size-4 text-primary shrink-0" />
                <div>
                  <span className="font-bold text-ink block">Paiement à la livraison</span>
                  <span className="text-[0.65rem] text-ink-muted">Simple et fiable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Podium Product Image */}
          <div className="hidden lg:flex justify-end relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/shop-hero-banner.png"
              alt="ParaTunisie Produits Parapharmacie"
              className="max-h-[290px] w-auto rounded-2xl object-cover drop-shadow-lg border border-border/40"
            />
          </div>
        </div>
      </section>

      {/* ── 2. MAIN SHOP AREA: SIDEBAR + PRODUCT GRID ──────────────────────────────── */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] items-start">
          {/* Left Desktop Sidebar Container */}
          <aside className="hidden lg:block sticky top-28 space-y-4 rounded-2xl border border-border/80 bg-white p-5 shadow-xs" aria-label="Filtres produits">
            {controls}
          </aside>

          {/* Right Product Grid Column */}
          <section aria-label="Produits">
            {/* Header Summary & Sort Options */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink">
                  {totalProductsCount.toLocaleString("fr-FR")} produits
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  {query ? (
                    <span>Résultats pour la recherche <strong>« {query} »</strong></span>
                  ) : (
                    "Trouvez votre soin idéal parmi notre sélection."
                  )}
                </p>

                {/* Active Filter Chips */}
                {(activeCount > 0 || query) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {query && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[0.7rem] font-bold border border-primary/20">
                        Recherche : « {query} »
                        <button
                          type="button"
                          onClick={() => {
                            setSearchValue("");
                            updateParams({ q: null, page: null });
                          }}
                          className="hover:text-rose-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {filters.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 rounded-full bg-soft-nude px-2.5 py-1 text-[0.7rem] font-bold text-ink border border-border/60"
                      >
                        {cat}
                        <button type="button" onClick={() => removeFilterChip("categories", cat)} className="hover:text-rose-600">
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    {filters.brands.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 rounded-full bg-soft-nude px-2.5 py-1 text-[0.7rem] font-bold text-ink border border-border/60"
                      >
                        {b}
                        <button type="button" onClick={() => removeFilterChip("brands", b)} className="hover:text-rose-600">
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-bold text-primary hover:underline ml-1"
                    >
                      Effacer tous les filtres
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Selector */}
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
                  className="h-10 rounded-xl border border-border bg-white px-3 text-xs font-bold text-ink focus:outline-none cursor-pointer"
                >
                  <option value="recommended">Nos recommandations</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom (A → Z)</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isPending ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse rounded-2xl border border-border bg-white p-4 space-y-3">
                    <div className="aspect-square rounded-xl bg-soft-nude/70 w-full" />
                    <div className="h-3 bg-soft-nude rounded w-1/3" />
                    <div className="h-4 bg-soft-nude rounded w-3/4" />
                    <div className="h-8 bg-soft-nude rounded w-full pt-2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* ── Numeric Pagination ─────────────────────────────────── */}
                {totalPages > 1 && (
                  <nav aria-label="Pagination" className="mt-12 flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="rounded-xl text-xs font-bold gap-1"
                    >
                      <ChevronLeft size={14} /> Précédent
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
                            className={`h-9 min-w-9 rounded-xl text-xs font-bold transition-all ${
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
                          className="h-9 min-w-9 rounded-xl text-xs font-bold bg-white border border-border text-ink hover:bg-soft-nude"
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
                      className="rounded-xl text-xs font-bold gap-1"
                    >
                      Suivant <ChevronRight size={14} />
                    </Button>
                  </nav>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center shadow-xs">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-soft-nude text-ink-muted mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-ink">Aucun soin ne correspond à vos critères</h2>
                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-ink-muted">
                  {query ? (
                    <span>Aucun résultat trouvé pour « {query} ». Essayez d&apos;autres mots-clés.</span>
                  ) : (
                    "Essayez d'élargir votre recherche ou de supprimer quelques filtres pour découvrir notre sélection."
                  )}
                </p>
                <Button size="lg" className="mt-6 rounded-xl font-bold" onClick={clearAllFilters}>
                  Effacer tous les filtres
                </Button>
              </div>
            )}
          </section>
        </div>

        {/* ── 3. BOTTOM FAQ & SEO BANNER ─────────────────────────────────── */}
        <section className="mt-16 rounded-3xl border border-border/80 bg-[#FAF1EE] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left SEO Column */}
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink">Votre parapharmacie en ligne en Tunisie</h3>
              <p className="mt-3 text-xs leading-6 text-ink-muted">
                ParaTunisie est votre destination beauté et bien-être de confiance. Nous sélectionnons pour vous des produits de <strong>parapharmacie authentiques</strong> au meilleur prix, livrés rapidement partout en Tunisie.
              </p>
              <p className="mt-2 text-xs leading-6 text-ink-muted">
                Soins visage, corps, cheveux, hygiène, solaire, bébé ou compléments : retrouvez toutes vos marques préférées et profitez d&apos;une expérience d&apos;achat simple, sécurisée et agréable.
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
              <h3 className="font-serif text-2xl font-bold text-ink mb-4">Questions fréquentes</h3>
              <div className="space-y-2">
                {FAQ_ITEMS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="rounded-xl border border-border/70 bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-ink text-left"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={14} className={`text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs leading-5 text-ink-muted border-t border-border/40 pt-2">
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

      {/* Mobile Sticky Action Controls */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-white/95 p-3 backdrop-blur-md lg:hidden shadow-2xl">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 font-bold rounded-xl gap-2 shadow-xs border-border"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal size={16} className="text-primary" />
          Filtres {activeCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{activeCount}</span>}
        </Button>
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="max-h-[90dvh] rounded-t-3xl p-0">
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
          <div className="absolute inset-x-0 bottom-0 flex gap-3 border-t border-border bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg">
            <Button variant="outline" size="lg" className="flex-1 rounded-xl font-bold" onClick={clearAllFilters}>
              Effacer tout
            </Button>
            <Button size="lg" className="flex-2 rounded-xl font-bold bg-primary text-white" onClick={() => setFilterOpen(false)}>
              Voir {totalProductsCount.toLocaleString("fr-FR")} produits
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
