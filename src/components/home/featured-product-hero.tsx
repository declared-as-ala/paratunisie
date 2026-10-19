import Image from "next/image";
import { ArrowRight, Banknote, Check, Truck } from "lucide-react";

import { FREE_DELIVERY_THRESHOLD } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/data/products";
import type { FeaturedProduct } from "@/lib/api/client";
import { FeaturedActions, FeaturedImpression, TrackedLink } from "@/components/home/featured-product-actions";

/**
 * Above-the-fold featured product. Every number (price, stock) is read live from the catalogue;
 * the admin configuration only supplies copy and CTAs. Nothing here is invented: no ratings, no
 * discounts, no scarcity.
 */
export function FeaturedProductHero({ featured }: { featured: FeaturedProduct }) {
  const { product, config } = featured;
  const title = config.headline || product.name;
  const description = config.description || product.benefit;
  const freeDelivery = product.priceMillimes >= FREE_DELIVERY_THRESHOLD;
  const productHref = `/produits/${product.slug}`;
  const inStock = product.inStock !== false;

  return (
    <section
      aria-labelledby="featured-product-title"
      className="relative overflow-hidden bg-[radial-gradient(1200px_500px_at_85%_-10%,rgba(201,143,168,0.22),transparent_60%),linear-gradient(180deg,#FCF8F6_0%,#F5ECE8_100%)]"
    >
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -start-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      <FeaturedImpression product={product}>
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-4 px-4 pb-6 pt-4 sm:px-6 sm:pb-10 sm:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-12 lg:py-14">
          {/* Image (first on mobile, right on desktop) */}
          <div className="relative order-1 lg:order-2">
            <TrackedLink href={productHref} product={product} action="product_click" aria-label={`Voir ${product.name}`} className="group relative mx-auto block aspect-[5/4] w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_70px_-30px_rgba(94,32,60,0.45)] ring-1 ring-border/60 sm:aspect-square lg:max-w-xl lg:rounded-[2.25rem]">
              <Image
                src={product.image}
                alt={product.imageAlt || `${product.name} — ${product.brand}`}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 448px, 576px"
                className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none sm:p-8"
              />
              <span className="absolute start-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-primary shadow-2xs ring-1 ring-border/60">
                {product.brand}
              </span>
            </TrackedLink>
          </div>

          {/* Copy */}
          <div className="order-2 lg:order-1">
            <h1 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-primary/80 sm:text-xs">
              Parapharmacie en ligne &amp; nutrition sportive en Tunisie
            </h1>
            <h2 id="featured-product-title" className="mt-2 font-serif text-[1.625rem] font-bold leading-[1.12] tracking-tight text-ink sm:text-4xl lg:mt-4 lg:text-[3.25rem]">
              {title}
            </h2>
            {description && <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted sm:mt-4 sm:text-base">{description}</p>}

            {config.bullets.length > 0 && (
              <ul className="mt-4 hidden space-y-2 sm:block">
                {config.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1 sm:mt-6">
              <p className="font-tabular text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {formatPrice(product.priceMillimes)}
              </p>
              <p className="pb-1 text-xs font-medium text-ink-muted sm:text-sm">
                {product.size}
                {inStock ? (
                  <span className="ms-3 inline-flex items-center gap-1 font-bold text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden /> En stock
                  </span>
                ) : (
                  <span className="ms-3 font-bold text-amber-700">Actuellement indisponible</span>
                )}
              </p>
            </div>

            <div className="mt-4 sm:mt-6">
              {inStock ? (
                <FeaturedActions product={product} buyLabel={config.ctaLabel} />
              ) : (
                <TrackedLink href={productHref} product={product} action="product_click" className="inline-flex h-13 items-center justify-center rounded-xl bg-primary px-7 text-[0.9375rem] font-bold text-primary-foreground">
                  Voir le produit
                </TrackedLink>
              )}
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-ink-muted sm:mt-6">
              <li className="flex items-center gap-1.5"><Truck className="size-4 text-primary" aria-hidden /> Livraison partout en Tunisie{freeDelivery ? " · offerte" : ""}</li>
              <li className="flex items-center gap-1.5"><Banknote className="size-4 text-primary" aria-hidden /> Paiement à la livraison</li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold sm:mt-5">
              <TrackedLink href={productHref} product={product} action="product_click" className="group inline-flex items-center gap-1.5 text-primary hover:text-primary-hover">
                Voir la fiche produit <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
              </TrackedLink>
              {config.secondaryCtaLabel && config.secondaryCtaUrl && (
                <TrackedLink href={config.secondaryCtaUrl} product={product} action="secondary_click" className="inline-flex items-center gap-1.5 text-ink-muted underline-offset-4 hover:text-ink hover:underline">
                  {config.secondaryCtaLabel}
                </TrackedLink>
              )}
            </div>
          </div>
        </div>
      </FeaturedImpression>
    </section>
  );
}
