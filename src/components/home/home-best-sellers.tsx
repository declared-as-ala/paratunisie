import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products, type ProductSummary } from "@/lib/data/products";

export function HomeBestSellers({ items }: { items?: ProductSummary[] }) {
  const displayProducts = items && items.length > 0 ? items : products.slice(0, 4);

  return (
    <section className="bg-white py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 mb-2 border border-amber-500/20">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              Incontournables Dermatologiques
            </div>
            <h2 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Les favoris ParaTunisie
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              Les soins les plus recommandés et les plus commandés par nos clients en Tunisie.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Voir les 8 meilleures ventes
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Hero Product Grid: 4 spacious cards desktop, 1 column mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="home" />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover"
          >
            Voir toutes les meilleures ventes <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
