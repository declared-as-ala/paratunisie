import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { ProductBundle } from "@/components/product/product-bundle";
import { ProductCompare } from "@/components/product/product-compare";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfoAccordion } from "@/components/product/product-info-accordion";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductReviews } from "@/components/product/product-reviews";
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
  const hasSale = Boolean(product.regularPriceMillimes && product.regularPriceMillimes > product.priceMillimes);
  const discount = hasSale && product.regularPriceMillimes
    ? Math.round(((product.regularPriceMillimes - product.priceMillimes) / product.regularPriceMillimes) * 100)
    : 0;

  return (
    <div className="w-full max-w-full overflow-x-clip bg-background pb-[calc(190px+env(safe-area-inset-bottom))] lg:pb-28">
      <div className="mx-auto max-w-[1280px] px-3.5 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-x-3 gap-y-1 py-4 text-xs text-ink-muted sm:text-sm">
          <Link
            href={`/${product.categorySlug}`}
            className="inline-flex items-center gap-1.5 border-e border-border-strong pe-3 font-bold text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> Retour
          </Link>
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <ChevronRight className="size-3 opacity-50" aria-hidden />
            <li><Link href="/shop" className="hover:text-primary">Boutique</Link></li>
            <ChevronRight className="size-3 opacity-50" aria-hidden />
            <li><Link href={`/${product.categorySlug}`} className="hover:text-primary">{product.category}</Link></li>
            <ChevronRight className="hidden size-3 opacity-50 sm:block" aria-hidden />
            <li aria-current="page" className="hidden max-w-xs truncate font-semibold text-foreground sm:block">{product.name}</li>
          </ol>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0">
            <ProductGallery
              image={product.image}
              alt={product.imageAlt || `${product.name} de ${product.brand}`}
              badge={discount > 0 ? `-${discount}%` : undefined}
            />
            <ProductInfoAccordion product={product} />
          </div>
          <div className="min-w-0 lg:sticky lg:top-44">
            <ProductPurchasePanel product={product} rating={rating} />
          </div>
        </div>

        <ProductBundle product={product} suggestions={routineCompletion} />
        <ProductCompare product={product} similar={similar} />
        <ProductReviews product={product} reviews={reviews} rating={rating} />
      </div>

      <div className="mt-14">
        <RecentlyViewedRail currentSlug={product.slug} />
      </div>
    </div>
  );
}
