"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Loader2, Search, X, Sparkles, BookOpen, Tag, Award } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productCategories, formatPrice, type ProductSummary } from "@/lib/data/products";
import { articles } from "@/lib/data/articles";
import { popularSearches } from "@/lib/data/navigation";
import { logMerchandisingEvent } from "@/lib/telemetry";
import { fetchBrands, fetchPaginatedProducts } from "@/lib/api/client";
import { trackSearch } from "@/lib/analytics/tracker";

const RECENT_SEARCHES_KEY = "paratunisie-recent-searches";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function SearchOverlay({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact" | "icon";
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [value, setValue] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  // Real catalogue data — fetched live per query
  const [liveProducts, setLiveProducts] = useState<ProductSummary[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [allBrands, setAllBrands] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetchBrands().then(setAllBrands);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (!query) return;
    setIsSearchingProducts(true);
    const timeout = setTimeout(async () => {
      const res = await fetchPaginatedProducts({ search: query, limit: 5 });
      setLiveProducts(res.products);
      setIsSearchingProducts(false);
      trackSearch(query, res.meta?.total ?? res.products.length);
    }, 400);
    return () => clearTimeout(timeout);
  }, [value]);

  const activeProducts = value.trim() ? liveProducts : [];
  const activeSearching = value.trim() ? isSearchingProducts : false;

  // Structured search results
  const searchResults = useMemo(() => {
    const query = normalize(value.trim());
    if (!query) {
      return {
        productsList: [],
        brandsList: [],
        categoriesList: [],
        concernsList: [],
        articlesList: [],
      };
    }

    const matchedBrands = allBrands
      .filter((b) => normalize(b.name).includes(query))
      .slice(0, 4);

    const matchedCategories = productCategories
      .filter((c) => normalize(c).includes(query))
      .slice(0, 4);

    const concernsMap: Record<string, string> = {
      acne: "Imperfections & Acné",
      sensible: "Peau Sensible",
      taches: "Taches & Éclat",
      solaire: "Protection Solaire",
      seche: "Peau Sèche",
      antiage: "Anti-Âge",
      cheveux: "Chute de Cheveux",
    };

    const matchedConcerns = Object.entries(concernsMap)
      .filter(([k, label]) => normalize(`${k} ${label}`).includes(query))
      .map(([k, label]) => ({ key: k, label }))
      .slice(0, 3);

    const matchedArticles = articles
      .filter((a) => normalize(`${a.title} ${a.excerpt} ${a.category}`).includes(query))
      .slice(0, 2);

    return {
      productsList: activeProducts,
      brandsList: matchedBrands,
      categoriesList: matchedCategories,
      concernsList: matchedConcerns,
      articlesList: matchedArticles,
    };
  }, [value, activeProducts, allBrands]);

  function openSearch() {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]").slice(0, 5));
    } catch {
      setRecent([]);
    }
    dialogRef.current?.showModal();
  }

  function remember(term: string) {
    const next = [term, ...recent.filter((item) => item !== term)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }

  function goToShop(term: string) {
    const clean = term.trim();
    if (!clean) return;
    remember(clean);
    logMerchandisingEvent("search_autocomplete_click", { query: clean });
    dialogRef.current?.close();
    router.push(`/shop?q=${encodeURIComponent(clean)}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToShop(value);
  }

  const hasResults =
    searchResults.productsList.length > 0 ||
    searchResults.brandsList.length > 0 ||
    searchResults.categoriesList.length > 0 ||
    searchResults.concernsList.length > 0 ||
    searchResults.articlesList.length > 0;

  const showEmpty = value.trim().length > 1 && !hasResults && !isSearchingProducts;

  return (
    <>
      {/* Trigger Button based on Variant */}
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Rechercher un produit"
          onClick={openSearch}
          className={`text-ink hover:text-primary ${className}`}
        >
          <Search size={20} />
        </Button>
      ) : variant === "compact" ? (
        <button
          type="button"
          onClick={openSearch}
          className={`group flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-border/80 bg-soft-nude/50 px-3.5 text-left text-xs text-ink-muted transition-all hover:border-primary/40 hover:bg-white hover:shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${className}`}
        >
          <Search className="size-4 shrink-0 text-primary transition-transform group-hover:scale-110" aria-hidden />
          <span className="truncate">Rechercher un soin, marque, besoin…</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openSearch}
          className={`group flex w-full min-w-0 items-center gap-2.5 rounded-2xl border border-border bg-soft-nude/40 px-4 py-2.5 text-left text-sm font-medium text-ink-muted transition-all hover:border-primary/50 hover:bg-white hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${className}`}
        >
          <Search className="size-4.5 shrink-0 text-primary transition-transform group-hover:scale-110" aria-hidden />
          <span className="truncate text-xs sm:text-sm">Rechercher un produit, une marque, un besoin…</span>
          <span className="ml-auto hidden shrink-0 rounded-full border border-border bg-white px-2.5 py-0.5 text-[0.625rem] font-bold text-ink-faint lg:inline-block">
            Rechercher
          </span>
        </button>
      )}

      {/* Search Autocomplete Dialog Modal */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:duration-150"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        onClose={() => setValue("")}
        aria-label="Rechercher un produit"
      >
        <div className="mx-auto mt-4 max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/80 bg-white p-5 shadow-2xl sm:mt-12 sm:p-7">
          <form onSubmit={submit} role="search">
            <label htmlFor="global-search" className="sr-only">
              Rechercher un produit, une marque ou un besoin
            </label>
            <div className="flex items-center gap-2.5 border-b border-border/80 pb-3">
              <Search className="size-5 shrink-0 text-primary" aria-hidden />
              <Input
                id="global-search"
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ex: CeraVe, SPF50, Acné, Sérum..."
                autoComplete="off"
                className="h-10 flex-1 border-none bg-transparent text-sm sm:text-base font-medium shadow-none focus-visible:ring-0 placeholder:text-ink-muted/60"
              />
              {value && (
                <button
                  type="button"
                  aria-label="Effacer la recherche"
                  onClick={() => setValue("")}
                  className="p-1.5 text-ink-muted hover:text-ink transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={!value.trim()}
                className="hidden sm:inline-flex rounded-xl font-bold bg-primary text-white text-xs px-4"
              >
                Rechercher
              </Button>
              <button
                type="button"
                aria-label="Fermer la recherche"
                onClick={() => dialogRef.current?.close()}
                className="p-1.5 text-ink-muted hover:text-ink transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>
          </form>

          {activeSearching && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
              <Loader2 size={13} className="animate-spin" aria-hidden />
              Recherche en cours…
            </p>
          )}

          {/* Structured Search Autocomplete Results */}
          {value.trim() ? (
            <div className="mt-5 space-y-6">
              {/* Products Section */}
              {searchResults.productsList.length > 0 && (
                <div>
                  <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-primary uppercase mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} /> Produits ({searchResults.productsList.length})
                  </p>
                  <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-white overflow-hidden">
                    {searchResults.productsList.map((product) => (
                      <Link
                        key={product.id}
                        href={`/produits/${product.slug}`}
                        onClick={() => {
                          remember(product.name);
                          dialogRef.current?.close();
                        }}
                        className="group flex items-center justify-between gap-3 p-3 hover:bg-soft-nude/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-11 w-11 rounded-lg object-cover border border-border bg-soft-nude"
                          />
                          <div>
                            <p className="text-[0.65rem] font-bold text-primary uppercase">{product.brand}</p>
                            <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-[0.625rem] text-ink-muted line-clamp-1">{product.benefit}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-ink font-tabular shrink-0">
                          {formatPrice(product.priceMillimes)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands & Categories & Concerns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Brands */}
                {searchResults.brandsList.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-primary uppercase mb-2 flex items-center gap-1.5">
                      <Award size={13} /> Marques
                    </p>
                    <div className="space-y-1.5">
                      {searchResults.brandsList.map((b) => (
                        <Link
                          key={b.slug}
                          href={`/marques/${b.slug}`}
                          onClick={() => dialogRef.current?.close()}
                          className="block rounded-lg border border-border/60 bg-white p-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold text-ink"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {searchResults.categoriesList.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-primary uppercase mb-2 flex items-center gap-1.5">
                      <Tag size={13} /> Catégories
                    </p>
                    <div className="space-y-1.5">
                      {searchResults.categoriesList.map((c) => (
                        <Link
                          key={c}
                          href={`/shop?categorie=${encodeURIComponent(c.toLowerCase())}`}
                          onClick={() => dialogRef.current?.close()}
                          className="block rounded-lg border border-border/60 bg-white p-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold text-ink"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {searchResults.concernsList.length > 0 && (
                  <div>
                    <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-primary uppercase mb-2 flex items-center gap-1.5">
                      <Sparkles size={13} /> Besoins & Soins
                    </p>
                    <div className="space-y-1.5">
                      {searchResults.concernsList.map((c) => (
                        <Link
                          key={c.key}
                          href={`/shop?preoccupation=${c.key}`}
                          onClick={() => dialogRef.current?.close()}
                          className="block rounded-lg border border-border/60 bg-white p-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs font-bold text-ink"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Articles / Advice */}
              {searchResults.articlesList.length > 0 && (
                <div>
                  <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-primary uppercase mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} /> Conseils Pharmaceutiques
                  </p>
                  <div className="space-y-2">
                    {searchResults.articlesList.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/conseils/${a.slug}`}
                        onClick={() => dialogRef.current?.close()}
                        className="group flex items-center justify-between rounded-xl border border-border bg-white p-3 hover:border-primary/40 transition-colors"
                      >
                        <div>
                          <p className="text-[0.65rem] font-bold text-primary">{a.category}</p>
                          <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">
                            {a.title}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-ink-muted group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* All results button */}
              <button
                type="button"
                onClick={() => goToShop(value)}
                className="mt-4 flex min-h-11 w-full items-center justify-between rounded-xl bg-primary px-4 text-xs font-bold text-white hover:bg-primary-hover transition-colors"
              >
                <span>Voir tous les résultats pour « {value.trim()} »</span>
                <ArrowRight className="size-4" />
              </button>

              {showEmpty && (
                <div className="rounded-2xl bg-soft-nude/60 p-6 text-center border border-border">
                  <h2 className="font-serif text-xl font-medium text-ink">Aucun résultat immédiat</h2>
                  <p className="mt-2 text-xs text-ink-muted">
                    Vérifiez l’orthographe ou explorez l&apos;une des catégories ci-dessous.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {productCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => goToShop(category)}
                        className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {recent.length > 0 && (
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                    <Clock3 className="size-3.5 text-primary" /> Searches Récentes
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setValue(term)}
                        className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Searches Populaire</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setValue(term)}
                      className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
