import Link from "next/link";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductRail } from "@/components/product/product-rail";
import { RecentlyViewedRail } from "@/components/product/recently-viewed-rail";
import type { ProductSummary } from "@/lib/data/products";
import type { ProductRating, PublicReview } from "@/lib/api/client";

export function ProductDetailView({
  product,
  routineCompletion,
  similar,
  reviews,
  rating,
}: {
  product: ProductSummary;
  routineCompletion: ProductSummary[];
  similar: ProductSummary[];
  reviews: PublicReview[];
  rating: ProductRating;
}) {
  return (
    <div className="bg-background pb-[calc(190px+env(safe-area-inset-bottom))] lg:pb-16 overflow-x-hidden w-full max-w-full">
      <div className="mx-auto max-w-[1440px] px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        <nav aria-label="Fil d’Ariane" className="text-xs sm:text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <li>
              <Link href="/" className="hover:text-primary">
                Accueil
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/shop?categories=${encodeURIComponent(product.category)}`} className="hover:text-primary">
                {product.category}
              </Link>
            </li>
            <li aria-hidden className="hidden sm:inline-block">/</li>
            <li aria-current="page" className="hidden sm:inline-block text-ink truncate max-w-[200px] lg:max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-3 sm:mt-6 grid gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <ProductGallery image={product.image} alt={product.imageAlt || `${product.name} de ${product.brand}`} />
          <ProductPurchasePanel product={product} rating={rating} />
        </div>

        <ProductTabs product={product} reviews={reviews} rating={rating} />
      </div>

      <ProductRail
        title="Complétez votre routine"
        description="D'autres gestes pensés pour le même besoin."
        products={routineCompletion}
      />
      <ProductRail
        title="Produits similaires"
        products={similar}
      />
      <RecentlyViewedRail currentSlug={product.slug} />
    </div>
  );
}
