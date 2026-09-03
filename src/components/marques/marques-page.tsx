"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, X, Award, ChevronRight, Sparkles, ShieldCheck, Truck, CheckCircle2, Zap } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

export interface BrandItem {
  id?: string;
  slug: string;
  name: string;
  logo?: string | null;
  image?: string | null;
  tagline?: string | null;
  description?: string | null;
  origin?: string | null;
  featured?: boolean;
  productCount?: number;
  inStockCount?: number;
}

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function firstLetter(name: string): string {
  const norm = normalize(name).trim();
  const c = norm.charAt(0).toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
}

const ALPHABET = ["TOUS", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];

export function MarquesPage({ initialBrands }: { initialBrands: BrandItem[] }) {
  const brands = initialBrands;
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("TOUS");
  const letterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const allSorted = useMemo(() => {
    return [...brands].sort((a, b) => {
      // Put brands with products first, then alphabetical
      if ((b.productCount || 0) !== (a.productCount || 0)) {
        return (b.productCount || 0) - (a.productCount || 0);
      }
      return normalize(a.name).localeCompare(normalize(b.name));
    });
  }, [brands]);

  const activeLetters = useMemo(() => {
    const set = new Set<string>();
    for (const b of brands) {
      set.add(firstLetter(b.name));
    }
    return set;
  }, [brands]);

  const featuredBrands = useMemo(() => {
    return allSorted.filter((b) => b.featured || (b.productCount && b.productCount >= 5)).slice(0, 12);
  }, [allSorted]);

  const filteredBrands = useMemo(() => {
    let list = allSorted;
    if (query.trim()) {
      const q = normalize(query.trim());
      list = list.filter(
        (b) => normalize(b.name).includes(q) || normalize(b.slug).includes(q) || (b.tagline && normalize(b.tagline).includes(q))
      );
    } else if (selectedLetter !== "TOUS") {
      list = list.filter((b) => firstLetter(b.name) === selectedLetter);
    }
    return list;
  }, [allSorted, query, selectedLetter]);

  // Group by alphabetical letters for section view
  const groupedByLetter = useMemo(() => {
    const map = new Map<string, BrandItem[]>();
    const sortedAlpha = [...filteredBrands].sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)));
    for (const b of sortedAlpha) {
      const l = firstLetter(b.name);
      if (!map.has(l)) map.set(l, []);
      map.get(l)!.push(b);
    }
    return map;
  }, [filteredBrands]);

  const visibleLetters = useMemo(() => Array.from(groupedByLetter.keys()).sort(), [groupedByLetter]);

  const jumpToLetter = useCallback((letter: string) => {
    setSelectedLetter(letter);
    setQuery("");
    if (letter === "TOUS") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = letterRefs.current.get(letter);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const setLetterRef = useCallback(
    (letter: string) => (el: HTMLDivElement | null) => {
      if (el) letterRefs.current.set(letter, el);
    },
    []
  );

  const isSearching = query.trim().length > 0;

  return (
    <div className="bg-[#FAF7F5] min-h-screen text-ink pb-24">
      {/* ── 1. HERO HEADER ─────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F3] via-[#FAF7F5] to-[#FAF7F5] border-b border-border/60">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-4 font-medium">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li aria-hidden className="opacity-40">/</li>
              <li aria-current="page" className="text-ink font-bold">
                Toutes les marques
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Award size={14} className="text-primary" />
              Compléments &amp; Nutrition Sportive
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-ink leading-tight">
              Toutes nos marques
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed max-w-2xl">
              Découvrez <strong>{brands.length > 0 ? brands.length : 45} marques</strong> de compléments alimentaires, protéines, créatines et vitamines présentes dans notre catalogue.
            </p>

            {/* ── SEARCH INPUT ───────────────────────────────────────────── */}
            <div className="mt-6 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setSelectedLetter("TOUS");
                }}
                placeholder="Rechercher une marque (ex: Optimum Nutrition, BioTechUSA, OstroVit)..."
                className="w-full h-12 rounded-2xl border border-border/90 bg-white pl-12 pr-10 text-xs sm:text-sm font-semibold text-ink shadow-xs placeholder:text-ink-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-8">
        {/* ── 2. STICKY ALPHABETICAL FILTER BAR (A-Z) ───────────────────────── */}
        <div className="sticky top-20 z-20 rounded-2xl border border-border/80 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 shadow-xs mb-10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 justify-start sm:justify-center">
            {ALPHABET.map((letter) => {
              const active = letter === "TOUS" || activeLetters.has(letter);
              const isSelected = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => active && jumpToLetter(letter)}
                  disabled={!active}
                  className={`h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 shrink-0 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : active
                      ? "bg-soft-nude/80 text-ink hover:bg-primary/20 hover:text-primary cursor-pointer"
                      : "opacity-25 cursor-not-allowed text-ink-muted"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. FEATURED BRANDS (MARQUES EN VEDETTE) ─────────────────────────── */}
        {!isSearching && selectedLetter === "TOUS" && featuredBrands.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h2 className="font-serif text-2xl font-bold text-ink">Marques en Vedette</h2>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Les plus populaires
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/marques/${brand.slug}`}
                  className="group relative flex flex-col items-center justify-between rounded-2xl border border-border/80 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Brand Logo Well */}
                  <div className="relative flex h-16 sm:h-20 w-full items-center justify-center rounded-xl bg-white p-2">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={`${brand.name} Tunisie`}
                        className="max-h-full max-w-full object-contain filter contrast-105 group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-12 rounded-xl bg-primary/10 text-primary font-serif font-black text-xl flex items-center justify-center">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Brand Name & Counts */}
                  <div className="w-full text-center mt-2">
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-ink group-hover:text-primary transition-colors truncate">
                      {brand.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[0.6875rem] font-semibold text-ink-muted">
                      <span>{brand.productCount || 0} produit{(brand.productCount || 0) > 1 ? "s" : ""}</span>
                      {brand.productCount && brand.productCount > 0 ? (
                        <span className="inline-flex items-center text-[0.625rem] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                          En stock
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. COMPLETE ALPHABETICAL DIRECTORY ────────────────────────────── */}
        <section aria-label="Répertoire des marques">
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
            <h2 className="font-serif text-2xl font-bold text-ink">
              {isSearching
                ? `Résultats de recherche (${filteredBrands.length})`
                : selectedLetter !== "TOUS"
                ? `Marques commençant par « ${selectedLetter} » (${filteredBrands.length})`
                : "Toutes les marques (A-Z)"}
            </h2>
            <span className="text-xs font-semibold text-ink-muted">
              {filteredBrands.length} marque{filteredBrands.length > 1 ? "s" : ""}
            </span>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-12 text-center">
              <Search className="mx-auto size-10 text-ink-muted/60 mb-3" />
              <h3 className="font-serif text-lg font-bold text-ink">Aucune marque ne correspond à votre recherche</h3>
              <p className="text-xs text-ink-muted mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedLetter("TOUS");
                }}
                className="mt-4 rounded-xl bg-primary text-white text-xs font-bold px-4 py-2 hover:bg-primary/90 transition-colors"
              >
                Afficher toutes les marques
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {visibleLetters.map((letter) => {
                const list = groupedByLetter.get(letter) || [];
                return (
                  <div key={letter} ref={setLetterRef(letter)} className="scroll-mt-36">
                    {/* Letter Divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-9 rounded-xl bg-[#E11D48] text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {letter}
                      </div>
                      <span className="text-xs font-bold text-ink-muted">
                        {list.length} marque{list.length > 1 ? "s" : ""}
                      </span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>

                    {/* Brand Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {list.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/marques/${brand.slug}`}
                          className="group relative flex flex-col items-center justify-between rounded-2xl border border-border/80 bg-white p-3.5 sm:p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
                        >
                          {/* Brand Logo Well */}
                          <div className="relative flex h-16 sm:h-20 w-full items-center justify-center rounded-xl bg-white p-2">
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={`${brand.name} Tunisie`}
                                className="max-h-full max-w-full object-contain filter contrast-105 group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="size-11 rounded-xl bg-primary/10 text-primary font-serif font-black text-lg flex items-center justify-center">
                                {brand.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Brand Name & Counts */}
                          <div className="w-full text-center mt-2">
                            <h3 className="font-serif font-bold text-xs sm:text-sm text-ink group-hover:text-primary transition-colors truncate">
                              {brand.name}
                            </h3>
                            <div className="mt-1 flex items-center justify-center gap-1.5 text-[0.6875rem] font-semibold text-ink-muted">
                              <span>{brand.productCount || 0} produit{(brand.productCount || 0) > 1 ? "s" : ""}</span>
                              {brand.productCount && brand.productCount > 0 ? (
                                <span className="inline-flex items-center text-[0.6rem] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-bold">
                                  En stock
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 5. SEO & TRUST SECTION (FOOTER BANNER) ────────────────────────── */}
        <section className="mt-20 rounded-3xl border border-border/80 bg-gradient-to-br from-white via-[#FFF9F8] to-[#FFF5F3] p-6 sm:p-10 shadow-xs">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                <ShieldCheck size={16} /> Informations &amp; contrôle à réception
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                Pourquoi choisir vos compléments alimentaires sur ParaTunisie ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="rounded-2xl border border-border/60 bg-white/90 p-5 space-y-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink">100% Produits Originaux</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Consultez la marque et le format sur chaque fiche, puis vérifiez le scellé, le lot et la date indiqués sur le produit reçu.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white/90 p-5 space-y-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Truck size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink">Livraison Rapide 24/48h</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Expédition express sur toute la Tunisie avec suivi en direct par SMS et paiement sécurisé à la livraison.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-white/90 p-5 space-y-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Zap size={20} />
                </div>
                <h3 className="font-bold text-sm text-ink">Prix affichés clairement</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Tarifs compétitifs sur les plus grands laboratoires de musculation et de santé, avec promotions régulières et programme de fidélité.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
