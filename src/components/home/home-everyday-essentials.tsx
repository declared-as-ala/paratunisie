import Link from "next/link";
import { RefreshCw, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data/products";

export function HomeEverydayEssentials() {
  const essentials = products.slice(0, 4);

  return (
    <section className="bg-soft-nude/30 py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/15">
              <RefreshCw size={13} />
              Réapprovisionnement Rapide
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Les essentiels du quotidien
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Voir tous les essentiels
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {essentials.map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </div>
      </div>
    </section>
  );
}
