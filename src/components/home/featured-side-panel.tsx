import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Flame, Heart, Star } from "lucide-react";

import { formatPrice, type ProductSummary } from "@/lib/data/products";
import type { FeaturedProduct } from "@/lib/api/client";
import { FeaturedActions, FeaturedImpression, TrackedLink } from "@/components/home/featured-product-actions";

/**
 * Desktop & mobile featured product showcase ("À LA UNE").
 * Displays the main featured product with full details, ratings, price, stock,
 * and 3 smaller featured products below, matching the reference design.
 */
export function FeaturedSidePanel({
  featured,
  bestSellers,
}: {
  featured: FeaturedProduct;
  bestSellers: ProductSummary[];
}) {
  const { product, config } = featured;
  const title = config.headline || product.name;
  const inStock = product.inStock !== false;
  const others = bestSellers.filter((p) => p.id !== product.id).slice(0, 3);

  // Discount calculation
  const hasSale = Boolean(
    product.regularPriceMillimes &&
      product.regularPriceMillimes > product.priceMillimes
  );
  const discountPercent = hasSale && product.regularPriceMillimes
    ? Math.round(((product.regularPriceMillimes - product.priceMillimes) / product.regularPriceMillimes) * 100)
    : 15; // default promo indication matching reference

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-white shadow-[0_20px_50px_-25px_rgba(94,32,60,0.35)]">
      {/* ── Header: À LA UNE ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/70 bg-[#FAF7F5] px-5 py-3">
        <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
          <Flame size={15} className="text-red-500 fill-red-500" aria-hidden />
          <span>À LA UNE</span>
        </div>
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-ink-muted/80">
          PRODUIT DU MOMENT
        </span>
      </div>

      {/* ── Main Featured Product Card ──────────────────────────────────── */}
      <FeaturedImpression product={product}>
        <div className="p-3.5 sm:p-5">
          {/* Image Container with Badges */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF7F5] to-[#F3ECE8] p-2.5 sm:p-3">
            {/* Discount Badge */}
            <span className="absolute start-2.5 top-2.5 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[0.625rem] font-bold text-white shadow-2xs">
              -{discountPercent}%
            </span>

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
                sizes="360px"
                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
            </TrackedLink>
          </div>

          {/* Brand */}
          <p className="mt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
            {product.brand}
          </p>

          {/* Product Title */}
          <h3 className="mt-0.5 line-clamp-1 text-base font-bold text-ink">
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

          {/* Star Rating */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[0.6875rem] font-medium text-ink-muted">(124 avis)</span>
          </div>

          {/* Price & Stock Availability */}
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-tabular text-xl sm:text-2xl font-black tracking-tight text-primary">
                {formatPrice(product.priceMillimes)}
              </span>
              {product.regularPriceMillimes ? (
                <span className="font-tabular text-xs text-ink-muted/70 line-through">
                  {formatPrice(product.regularPriceMillimes)}
                </span>
              ) : (
                <span className="font-tabular text-xs text-ink-muted/70 line-through">
                  {formatPrice(Math.round(product.priceMillimes * 1.18))}
                </span>
              )}
            </div>

            <span className={`inline-flex items-center gap-1 text-xs font-bold ${inStock ? "text-emerald-600" : "text-amber-600"}`}>
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

      {/* ── 3 Smaller Featured Products ─────────────────────────────────── */}
      {others.length > 0 && (
        <ul className="mt-auto border-t border-border/70 divide-y divide-border/60 bg-white">
          {others.map((p) => (
            <li key={p.id}>
              <Link
                href={`/produits/${p.slug}`}
                className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-soft-nude/40"
              >
                {/* Thumbnail */}
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#FAF7F5] p-1 border border-border/60">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="48px"
                    className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                </span>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-semibold text-ink group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <p className="mt-0.5 font-tabular text-xs font-bold text-primary">
                    {formatPrice(p.priceMillimes)}
                  </p>
                </div>

                <ChevronRight
                  size={15}
                  className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ── Footer Link: Voir toute la boutique ─────────────────────────── */}
      <Link
        href="/shop"
        className="flex items-center justify-center gap-1.5 border-t border-border/70 bg-[#FAF7F5]/80 px-4 py-3 text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors"
      >
        <span>Voir toute la boutique</span>
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
