"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface CategoryFilterToolbarProps {
  totalCount: number;
  availableBrands: string[];
  currentQuery: {
    q?: string;
    brand?: string;
    price?: string;
    in_stock?: string;
    sort?: string;
  };
}

export function CategoryFilterToolbar({
  totalCount,
  availableBrands,
  currentQuery,
}: CategoryFilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(currentQuery.q || "");
  const [brand, setBrand] = useState(currentQuery.brand || "");
  const [price, setPrice] = useState(currentQuery.price || "");
  const [inStock, setInStock] = useState(currentQuery.in_stock || "");
  const [sort, setSort] = useState(currentQuery.sort || "");

  const hasActiveFilters = Boolean(
    currentQuery.q ||
    currentQuery.brand ||
    currentQuery.price ||
    currentQuery.in_stock ||
    currentQuery.sort
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (brand) params.set("brand", brand);
    if (price) params.set("price", price);
    if (inStock) params.set("in_stock", inStock);
    if (sort) params.set("sort", sort);

    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-white p-4 sm:p-5 shadow-xs my-6">
      <form onSubmit={handleSubmit}>
        {/* ── Top Bar: Title, Count Badge, Reset ──────────────────────── */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={17} className="text-primary" />
            <h2 className="text-xs sm:text-sm font-bold text-ink">
              Filtrer et trier les produits
            </h2>
            <span className="rounded-full bg-[#FAF7F5] px-2.5 py-0.5 text-[11px] font-bold text-ink-muted border border-border/60">
              {totalCount} produit{totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {hasActiveFilters && (
            <Link
              href={pathname}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
            >
              <RotateCcw size={13} />
              <span>Réinitialiser</span>
            </Link>
          )}
        </div>

        {/* ── Filter Controls Row ─────────────────────────────────────── */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          {/* 1. Search input */}
          <div className="flex flex-col gap-1 lg:col-span-2">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Recherche
            </label>
            <div className="relative">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted/70" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un produit..."
                className="h-10 w-full rounded-xl border border-border/80 bg-[#FAF7F5] ps-9 pe-3 text-xs text-ink placeholder:text-ink-muted/60 focus:bg-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* 2. Marque dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Marque
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/80 bg-[#FAF7F5] px-3 text-xs text-ink focus:bg-white focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Toutes les marques</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* 3. Prix dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Prix
            </label>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/80 bg-[#FAF7F5] px-3 text-xs text-ink focus:bg-white focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Tous les prix</option>
              <option value="under_60">&lt; 60 DT</option>
              <option value="60_120">60 DT - 120 DT</option>
              <option value="above_120">&gt; 120 DT</option>
            </select>
          </div>

          {/* 4. Disponibilité dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Disponibilité
            </label>
            <select
              value={inStock}
              onChange={(e) => setInStock(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/80 bg-[#FAF7F5] px-3 text-xs text-ink focus:bg-white focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Tous les produits</option>
              <option value="in_stock">En stock uniquement</option>
            </select>
          </div>

          {/* 5. Trier par dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Trier par
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/80 bg-[#FAF7F5] px-3 text-xs text-ink focus:bg-white focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Pertinence</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A–Z</option>
              <option value="newest">Nouveautés</option>
            </select>
          </div>
        </div>

        {/* Submit button row */}
        <div className="mt-4 pt-3 flex justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-6 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Appliquer les filtres
          </button>
        </div>
      </form>
    </div>
  );
}
