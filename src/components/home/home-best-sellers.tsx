"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/data/products";

/**
 * Best Sellers Section matching reference image:
 * Header with bar icon, title, subtitle, and "Voir tout →",
 * horizontal scrollable/grid cards with left/right buttons.
 */
export function HomeBestSellers({ items }: { items: ProductSummary[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section aria-labelledby="home-best-sellers" className="bg-[#FAF7F5] py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Red Signal Bar Icon */}
            <div className="flex items-end gap-0.5 h-6 pt-1 text-primary shrink-0" aria-hidden>
              <span className="w-1.5 h-3.5 bg-primary rounded-full" />
              <span className="w-1.5 h-5 bg-primary rounded-full" />
              <span className="w-1.5 h-4 bg-primary rounded-full" />
            </div>

            <div>
              <h2 id="home-best-sellers" className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink">
                Meilleures ventes
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                Les produits les plus populaires sur ParaTunisie
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-primary transition-colors"
            >
              <span>Voir tout</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── Products 2-Col Mobile Grid & Desktop Grid ─────────────────── */}
        <div
          ref={scrollRef}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4"
        >
          {items.map((product) => (
            <div key={product.id} className="min-w-0">
              <ProductCard product={product} variant="shop" />
            </div>
          ))}
        </div>

        {/* Mobile "Voir tout" CTA */}
        <div className="mt-5 flex justify-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-white px-5 py-2.5 text-xs font-bold text-primary shadow-2xs active:scale-95"
          >
            <span>Voir toutes les meilleures ventes</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
