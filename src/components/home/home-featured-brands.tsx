"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

type BrandItem = {
  name: string;
  slug: string;
  badgeText: string;
  styleClass: string;
};

const FEATURED_BRANDS_LIST: BrandItem[] = [
  { name: "Optimum Nutrition", slug: "optimum-nutrition", badgeText: "ON", styleClass: "font-black tracking-tighter text-2xl" },
  { name: "MuscleTech", slug: "muscletech", badgeText: "MUSCLETECH", styleClass: "font-black tracking-widest text-lg italic" },
  { name: "Real Pharm", slug: "real-pharm", badgeText: "REAL PHARM", styleClass: "font-bold tracking-wider text-base uppercase" },
  { name: "BioTechUSA", slug: "biotechusa", badgeText: "BioTechUSA", styleClass: "font-extrabold tracking-tight text-lg" },
  { name: "Applied Nutrition", slug: "applied-nutrition", badgeText: "APPLIED NUTRITION", styleClass: "font-black tracking-wide text-sm" },
  { name: "Mutant", slug: "mutant", badgeText: "MUTANT", styleClass: "font-black tracking-widest text-2xl uppercase" },
  { name: "NOW Foods", slug: "now-foods", badgeText: "now", styleClass: "font-black tracking-normal text-2xl lowercase italic" },
  { name: "Nutrex Research", slug: "nutrex", badgeText: "NUTREX", styleClass: "font-black tracking-wider text-xl uppercase" },
];

/**
 * "Nos marques" section matching reference:
 * Header with bar icon, title, subtitle, navigation arrows,
 * and clean rounded cards with bold brand marks.
 */
export function HomeFeaturedBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section aria-labelledby="home-brands" className="bg-[#FAF7F5] py-8 sm:py-12 border-t border-border/50">
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
              <h2 id="home-brands" className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink">
                Nos marques
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                Des marques de confiance, disponibles en Tunisie
              </p>
            </div>
          </div>

          {/* Navigation Controls (Desktop only) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Marques précédentes"
              className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-white text-ink shadow-2xs hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Marques suivantes"
              className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-white text-ink shadow-2xs hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── Brands Cards Grid (No horizontal scroll on mobile) ────────── */}
        <div
          ref={scrollRef}
          className="grid grid-cols-2 min-[400px]:grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4"
        >
          {FEATURED_BRANDS_LIST.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marques/${brand.slug}`}
              className="group flex h-16 sm:h-24 w-full flex-col items-center justify-center rounded-2xl border border-border/70 bg-white p-2.5 sm:p-3 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-sm"
            >
              <span className={`text-ink/80 group-hover:text-primary transition-colors select-none ${brand.styleClass}`}>
                {brand.badgeText}
              </span>
              <span className="sr-only">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
