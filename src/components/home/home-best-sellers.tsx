import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { ProductSummary } from "@/lib/data/products";

/** Ranked from real order data by the API; the page hides this section when there is not enough genuine data. */
export function HomeBestSellers({ items }: { items: ProductSummary[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="home-best-sellers" className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-primary/80">
              <TrendingUp size={13} aria-hidden /> Les plus commandés
            </p>
            <h2 id="home-best-sellers" className="font-serif text-xl font-bold tracking-tight text-ink sm:text-3xl">
              Meilleures ventes
            </h2>
          </div>
          <Link href="/shop" className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover sm:text-sm">
            Toute la boutique <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {items.map((product) => (
            <div key={product.id} className="w-[44vw] max-w-[13rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <ProductCard product={product} variant="shop" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
