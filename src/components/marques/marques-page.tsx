"use client";

import Link from "next/link";
import { Search, X, Award, ChevronRight, Sparkles } from "lucide-react";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";

import { brands as defaultBrands, brandUniverses, type Brand } from "@/lib/data/brands";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function firstLetter(name: string): string {
  return normalize(name).charAt(0).toUpperCase();
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function MarquesPage() {
  const [allBrands, setAllBrands] = useState<Brand[]>(defaultBrands);
  const [query, setQuery] = useState("");
  const letterRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    async function fetchApiBrands() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
        const res = await fetch(`${apiUrl}/catalogue/brands`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Brand[] = data.map((b: any) => ({
              slug: b.slug,
              name: b.name,
              tagline: b.description || "Marque dermatologique sélectionnée par ParaTunisie",
              description: b.description || "",
              featured: Boolean(b.featured) || ["a-derma", "bioderma", "la-roche-posay", "avene", "cerave", "svr", "nuxe", "acm", "vichy", "uriage"].includes(b.slug),
              productCount: b._count?.products ?? 12,
            }));
            // Merge with defaultBrands to ensure no top brand is missed
            const existingSlugs = new Set(mapped.map((m) => m.slug));
            const merged = [...mapped];
            for (const def of defaultBrands) {
              if (!existingSlugs.has(def.slug)) {
                merged.push(def);
              }
            }
            setAllBrands(merged);
          }
        }
      } catch (err) {
        console.warn("Using default brand directory", err);
      }
    }
    fetchApiBrands();
  }, []);

  const allSorted = useMemo(
    () => [...allBrands].sort((a, b) => normalize(a.name).localeCompare(normalize(b.name))),
    [allBrands]
  );

  const activeLetters = useMemo(
    () => new Set(allBrands.map((b) => firstLetter(b.name))),
    [allBrands]
  );

  const featuredBrands = useMemo(
    () => allSorted.filter((b) => b.featured),
    [allSorted]
  );

  const filteredBrands = useMemo(() => {
    if (!query.trim()) return allSorted;
    const q = normalize(query.trim());
    return allSorted.filter(
      (b) => normalize(b.name).includes(q) || normalize(b.tagline).includes(q)
    );
  }, [allSorted, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Brand[]>();
    for (const brand of filteredBrands) {
      const letter = firstLetter(brand.name);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(brand);
    }
    return map;
  }, [filteredBrands]);

  const visibleLetters = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  const jumpToLetter = useCallback((letter: string) => {
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
    <div className="bg-[#FAF7F5] min-h-screen text-ink pb-20">
      {/* ── 1. HERO BANNER HEADER ────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-r from-[#FAF3F0] via-[#FDFBF9] to-[#F7ECE8] border-b border-border/60">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-4">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-ink font-bold">
                Marques
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Award size={14} />
              Laboratoires Dermo-Cosmétiques
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              Nos Marques de Confiance
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
              Explorez nos <strong>{allBrands.length} marques officielles</strong> de parapharmacie. Retrouvez des formules hautement tolérées, testées cliniquement et recommandées par les dermatologues.
            </p>

            {/* ── SEARCH INPUT ───────────────────────────────────────────── */}
            <div className="mt-6 max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une marque (ex: A-Derma, Bioderma, CeraVe, SVR)..."
                className="w-full h-12 rounded-2xl border border-border/90 bg-white pl-12 pr-10 text-xs sm:text-sm font-medium text-ink shadow-sm placeholder:text-ink-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
        {/* ── 2. ALPHABET QUICK JUMP BAR ────────────────────────────────────── */}
        <div className="sticky top-20 z-20 rounded-2xl border border-border/80 bg-white/95 backdrop-blur-md p-3 shadow-xs mb-10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1 justify-between">
            <span className="text-xs font-bold text-ink mr-2 shrink-0 hidden sm:inline">Index A-Z :</span>
            {ALPHABET.map((letter) => {
              const active = activeLetters.has(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => active && jumpToLetter(letter)}
                  disabled={!active}
                  className={`size-8 shrink-0 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center ${
                    active
                      ? "bg-soft-nude text-ink hover:bg-primary hover:text-white cursor-pointer shadow-2xs"
                      : "opacity-30 cursor-not-allowed text-ink-muted"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. FEATURED BRANDS GRID (MARQUES ICONIQUES) ────────────────────── */}
        {!isSearching && featuredBrands.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-primary" />
              <h2 className="font-serif text-2xl font-bold text-ink">Marques Iconiques</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/marques/${brand.slug}`}
                  className="group relative flex items-center gap-4 rounded-2xl border border-border/80 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="size-12 shrink-0 rounded-xl bg-primary/10 text-primary font-serif font-extrabold text-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    {brand.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-base text-ink group-hover:text-primary transition-colors truncate">
                      {brand.name}
                    </h3>
                    <p className="text-[0.725rem] text-ink-muted line-clamp-1 mt-0.5">{brand.tagline}</p>
                    <span className="inline-block mt-2 text-[0.65rem] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {brand.productCount} produits
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-ink-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. COMPLETE ALPHABETICAL DIRECTORY ────────────────────────────── */}
        <section aria-label="Répertoire des marques">
          <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
            <h2 className="font-serif text-2xl font-bold text-ink">
              {isSearching ? `Résultats de recherche (${filteredBrands.length})` : "Toutes les marques (A-Z)"}
            </h2>
            <span className="text-xs font-semibold text-ink-muted">
              {filteredBrands.length} marque{filteredBrands.length > 1 ? "s" : ""} disponible{filteredBrands.length > 1 ? "s" : ""}
            </span>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-12 text-center">
              <Search className="mx-auto size-10 text-ink-muted/60 mb-3" />
              <h3 className="font-serif text-lg font-bold text-ink">Aucune marque ne correspond à « {query} »</h3>
              <p className="text-xs text-ink-muted mt-1">Vérifiez l&apos;orthographe ou essayez une recherche plus large.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 rounded-xl bg-primary text-white text-xs font-bold px-4 py-2 hover:bg-primary/90 transition-colors"
              >
                Afficher toutes les marques
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {visibleLetters.map((letter) => {
                const brandsForLetter = grouped.get(letter) || [];
                return (
                  <div
                    key={letter}
                    ref={setLetterRef(letter)}
                    className="scroll-mt-36 rounded-2xl border border-border/70 bg-white p-5 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 border-b border-border/60 pb-3 mb-4">
                      <span className="size-8 rounded-xl bg-primary text-white font-extrabold text-sm flex items-center justify-center">
                        {letter}
                      </span>
                      <span className="text-xs font-bold text-ink-muted">
                        {brandsForLetter.length} marque{brandsForLetter.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {brandsForLetter.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/marques/${brand.slug}`}
                          className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-soft-nude/30 hover:bg-primary/10 hover:border-primary/40 transition-all"
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-ink group-hover:text-primary transition-colors truncate">
                              {brand.name}
                            </h4>
                            <p className="text-[0.65rem] text-ink-muted line-clamp-1">{brand.tagline}</p>
                          </div>
                          <span className="text-[0.65rem] font-extrabold text-primary shrink-0 bg-white px-2 py-1 rounded-full border border-border/50">
                            {brand.productCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
