"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { type HomepageCategoryRow } from "@/lib/api/client";

export function HomeCategoryRow({
  row,
  bgClass = "bg-white",
}: {
  row: HomepageCategoryRow;
  bgClass?: string;
}) {
  if (!row.products || row.products.length === 0) return null;

  return (
    <section className={`py-12 sm:py-16 border-b border-border/50 ${bgClass}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Header Section: Title, Subtitle, and Voir tout link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {row.title}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl leading-relaxed">
              {row.subtitle}
            </p>
          </div>

          <Link
            href={`/shop?category=${encodeURIComponent(row.slug)}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors shrink-0 group"
          >
            <span>Voir tout</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Grid: 5 columns on desktop, 4 on laptop, 3 on tablet, 2 on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
          {row.products.map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </div>
      </div>
    </section>
  );
}
