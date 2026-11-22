"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export type DirectoryBrand = { slug: string; name: string; count: number };

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function firstLetter(name: string): string {
  const c = normalize(name).trim().charAt(0).toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
}

const LETTERS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "#"];

/** A–Z brand directory with live search. Letter links are plain anchors, so they work without JavaScript. */
export function BrandDirectory({ brands }: { brands: DirectoryBrand[] }) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    const filtered = q ? brands.filter((b) => normalize(b.name).includes(q)) : brands;
    const map = new Map<string, DirectoryBrand[]>();
    for (const b of [...filtered].sort((a, c) => normalize(a.name).localeCompare(normalize(c.name)))) {
      const l = firstLetter(b.name);
      map.set(l, [...(map.get(l) ?? []), b]);
    }
    return map;
  }, [brands, query]);

  const total = [...groups.values()].reduce((sum, list) => sum + list.length, 0);

  return (
    <section id="repertoire" aria-labelledby="brands-directory" className="scroll-mt-48">
      <h2 id="brands-directory" className="font-serif text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
        Répertoire des marques de A à Z
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
        Toutes les marques ayant au moins un produit publié, classées de A à Z. Le nombre à droite est le total de produits.
      </p>

      <div className="relative mt-5 max-w-xl">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
        <input
          id="brands-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une marque…"
          aria-label="Rechercher une marque"
          className="h-12 w-full rounded-full border border-border-strong bg-card ps-11 pe-11 text-sm font-medium text-foreground placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute end-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-ink-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <nav aria-label="Index alphabétique" className="sticky top-[4.75rem] z-20 mt-5 -mx-3 overflow-x-auto bg-background/95 px-3 py-2 backdrop-blur sm:mx-0 sm:px-0 lg:top-[8.5rem]">
        <ul className="flex gap-1">
          {LETTERS.map((letter) => {
            const has = groups.has(letter);
            return (
              <li key={letter}>
                {has ? (
                  <a
                    href={`#lettre-${letter === "#" ? "num" : letter}`}
                    className="flex size-9 items-center justify-center rounded-lg bg-card text-xs font-extrabold text-foreground ring-1 ring-border-strong/60 transition-colors hover:bg-primary hover:text-white"
                  >
                    {letter}
                  </a>
                ) : (
                  <span aria-hidden className="flex size-9 items-center justify-center rounded-lg text-xs font-bold text-ink-faint/60">
                    {letter}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-4 text-sm font-semibold text-ink-muted" aria-live="polite">
        {total} marque{total > 1 ? "s" : ""}
      </p>

      {total === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-sm text-ink-muted">
          Aucune marque ne correspond à « {query} ».
        </p>
      ) : (
        <div className="mt-4 space-y-8">
          {[...groups.entries()].map(([letter, list]) => (
            <div key={letter} id={`lettre-${letter === "#" ? "num" : letter}`} className="scroll-mt-56">
              <h3 className="flex items-baseline gap-3 border-b border-border-strong pb-2 font-serif text-2xl font-extrabold text-foreground">
                {letter}
                <span className="font-sans text-xs font-semibold text-ink-muted">
                  {list.length} marque{list.length > 1 ? "s" : ""}
                </span>
              </h3>
              <ul className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/marques/${b.slug}`}
                      className="flex min-h-11 items-center justify-between gap-3 border-b border-border/60 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      <span className="truncate">{b.name}</span>
                      <span className="text-xs tabular-nums text-ink-muted">{b.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
