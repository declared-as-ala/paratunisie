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
    <div className="bg-background pb-16">
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8">
        <nav aria-label="Fil d’Ariane" className="text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
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
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery image={product.image} alt={`${product.name} de ${product.brand}`} />
          <ProductPurchasePanel product={product} />
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
