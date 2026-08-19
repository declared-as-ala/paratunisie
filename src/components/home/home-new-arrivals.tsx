import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products, type ProductSummary } from "@/lib/data/products";

export function HomeNewArrivals({ items }: { items?: ProductSummary[] }) {
  const displayProducts = items && items.length > 0 ? items : products.slice(2, 7);

  return (
    <section className="bg-white py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/15">
              <Sparkles size={13} />
              Dernières Arrivées
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Nouveautés Dermatologiques
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Voir toutes les nouveautés
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Horizontal Discovery Rail */}
        <div className="flex overflow-x-auto gap-4 snap-x scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayProducts.map((product) => (
            <div key={product.id} className="w-[240px] sm:w-[270px] shrink-0 snap-start">
              <ProductCard product={product} variant="shop" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
