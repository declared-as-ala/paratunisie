import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Heart } from "lucide-react";

import { formatPrice } from "@/lib/data/products";
import type { FeaturedProduct } from "@/lib/api/client";
import { FeaturedActions, FeaturedImpression, TrackedLink } from "@/components/home/featured-product-actions";

/**
 * Desktop & mobile featured product showcase ("À LA UNE").
 * Displays the main featured product with full details, ratings, price, stock,
 * and 3 smaller featured products below, matching the reference design.
 */
export function FeaturedSidePanel({
  featured,
}: {
  featured: FeaturedProduct;
}) {
  const { product, config } = featured;
  const title = config.headline || product.name;
  const inStock = product.inStock !== false;

  // Discount calculation
  const hasSale = Boolean(
    product.regularPriceMillimes &&
      product.regularPriceMillimes > product.priceMillimes
  );
  const discountPercent = hasSale && product.regularPriceMillimes
    ? Math.round(((product.regularPriceMillimes - product.priceMillimes) / product.regularPriceMillimes) * 100)
    : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-40px_rgba(90,27,61,0.45)] ring-1 ring-border/60">
      {/* ── Header: À LA UNE ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-secondary px-5 py-3.5 text-white">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-[0.16em]">
          <Flame size={15} className="fill-primary text-primary" aria-hidden />
          <span>À LA UNE</span>
        </div>
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/70">
          PRODUIT DU MOMENT
        </span>
      </div>

      {/* ── Main Featured Product Card ──────────────────────────────────── */}
      <FeaturedImpression product={product}>
        <div className="p-3.5 sm:p-4">
          {/* Image Container with Badges */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] w-full overflow-hidden rounded-3xl bg-primary-soft/60 p-3 sm:p-4">
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute start-2.5 top-2.5 z-10 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-bold text-white shadow-2xs">
                -{discountPercent}%
              </span>
            )}

            {/* Wishlist Heart */}
            <button
              type="button"
              aria-label="Ajouter aux favoris"
              className="absolute end-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink-muted shadow-2xs hover:text-primary transition-colors cursor-pointer"
            >
              <Heart size={14} />
            </button>

            {/* Main Product Image */}
            <TrackedLink
              href={`/produits/${product.slug}`}
              product={product}
              action="product_click"
              aria-label={`Voir ${product.name}`}
              className="group relative block size-full"
            >
              <Image
                src={product.image}
                alt={product.imageAlt || `${product.name} — ${product.brand}`}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 400px"
                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
            </TrackedLink>
          </div>

          {/* Brand */}
          <p className="mt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
            {product.brand}
          </p>

          {/* Product Title */}
          <h3 className="mt-1 line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink">
            <TrackedLink
              href={`/produits/${product.slug}`}
              product={product}
              action="product_click"
              className="hover:text-primary transition-colors"
            >
              {title}
            </TrackedLink>
          </h3>

          {/* Benefit Subtitle */}
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted leading-relaxed">
            {product.benefit || "Protéine premium pour la prise de masse et la récupération musculaire."}
          </p>

          {/* Price & Stock Availability */}
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-2xl sm:text-3xl font-black tracking-tight text-primary">
                {formatPrice(product.priceMillimes)}
              </span>
              {hasSale && product.regularPriceMillimes ? (
                <span className="font-tabular text-xs text-ink-muted/70 line-through">
                  {formatPrice(product.regularPriceMillimes)}
                </span>
              ) : null}
            </div>

            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${inStock ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <span className={`size-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden />
              {inStock ? "En stock" : "Indisponible"}
            </span>
          </div>

          {/* Add to Cart CTA */}
          <div className="mt-4">
            {inStock ? (
              <FeaturedActions product={product} buyLabel="Ajouter au panier" compact />
            ) : (
              <TrackedLink
                href={`/produits/${product.slug}`}
                product={product}
                action="product_click"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm hover:bg-primary-hover"
              >
                Voir le produit
              </TrackedLink>
            )}
          </div>
        </div>
      </FeaturedImpression>

      {/* ── Footer Link: Voir toute la boutique ─────────────────────────── */}
      <Link
        href="/shop"
        className="flex items-center justify-center gap-1.5 border-t border-border/70 bg-primary-soft/50 px-4 py-3.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
      >
        <span>Voir toute la boutique</span>
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
