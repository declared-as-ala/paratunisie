import Link from "next/link";
import { Tag, ChevronRight, Percent } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products, type ProductSummary } from "@/lib/data/products";

export function HomePromotions({ items }: { items?: ProductSummary[] }) {
  const displayProducts = items && items.length > 0 ? items : products.slice(1, 6);

  return (
    <section className="bg-gradient-to-b from-rose-50/40 via-soft-nude/30 to-white py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 mb-2 border border-rose-500/20">
              <Percent size={13} className="text-rose-600" />
              Promotions Exclusives
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Offres du moment
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors"
          >
            Toutes les promotions
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Promo Horizontal Snap Rail */}
        <div className="flex overflow-x-auto gap-4 snap-x scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayProducts.map((product) => (
            <div key={product.id} className="w-[240px] sm:w-[280px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
