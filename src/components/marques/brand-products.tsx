"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/data/products";

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function BrandProducts({
  brandName,
  products,
}: {
  brandName: string;
  products: ProductSummary[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = normalize(query.trim());
    return products.filter(
      (p) =>
        normalize(p.name).includes(q) ||
        normalize(p.benefit).includes(q) ||
        normalize(p.category).includes(q),
    );
  }, [query, products]);

  return (
    <section className="mt-10" aria-label={`Produits ${brandName}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-xl font-medium text-ink sm:text-2xl">
          Nos produits {brandName}
        </h2>
        {products.length > 1 && (
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder={`Filtrer les produits ${brandName}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Filtrer les produits ${brandName}`}
              className="h-10 w-full rounded-lg border border-border bg-card ps-9 pe-9 text-sm text-ink placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer le filtre"
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">
            Aucun produit ne correspond à «&nbsp;{query}&nbsp;»
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Voir tous les produits {brandName}
          </button>
        </div>
      )}
    </section>
  );
}
