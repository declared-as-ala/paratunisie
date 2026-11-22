"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/data/products";

const arrowClass =
  "flex size-11 items-center justify-center rounded-full border border-border bg-white text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** One catalogue category as a swipeable product rail (native scroll-snap, arrow controls on larger screens). */
export function HomeProductCarousel({
  id,
  title,
  accent,
  subtitle,
  href,
  products,
  tinted = false,
}: {
  id: string;
  title: string;
  accent: string;
  subtitle: string;
  href: string;
  products: ProductSummary[];
  tinted?: boolean;
}) {
  const railRef = useRef<HTMLUListElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={id} className={`py-10 sm:py-14 ${tinted ? "bg-white" : "bg-background"}`}>
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-primary" />
            <h2 id={id} className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title} — <span className="italic text-primary">{accent}</span>
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{subtitle}</p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Link href={href} className="me-2 inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary">
              Voir tous les produits <ArrowRight className="size-4" aria-hidden />
            </Link>
            <button type="button" onClick={() => scroll(-1)} aria-label={`${title} : produits précédents`} className={arrowClass}>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label={`${title} : produits suivants`} className={arrowClass}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <ul
          ref={railRef}
          className="-mx-3 mt-6 flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto px-3 pb-3 [scrollbar-width:none] sm:-mx-6 sm:mt-8 sm:scroll-px-6 sm:gap-4 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <li key={product.id} className="w-[46vw] max-w-[15rem] shrink-0 snap-start sm:w-[15rem] lg:w-[16.25rem] lg:max-w-none">
              <ProductCard product={product} variant="shop" />
            </li>
          ))}
        </ul>

        <Link href={href} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary sm:hidden">
          Voir tous les produits <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
