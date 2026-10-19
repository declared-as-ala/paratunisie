import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { formatPrice, type ProductSummary } from "@/lib/data/products";
import type { FeaturedProduct } from "@/lib/api/client";
import { FeaturedActions, FeaturedImpression, TrackedLink } from "@/components/home/featured-product-actions";

/**
 * Desktop side panel next to the hero (same idea as a "top sales" rail).
 * The first card is the admin-chosen featured product with live price/stock; the rows below are the
 * real best sellers (omitted when there is not enough genuine sales data).
 */
export function FeaturedSidePanel({ featured, bestSellers }: { featured: FeaturedProduct; bestSellers: ProductSummary[] }) {
  const { product, config } = featured;
  const title = config.headline || product.name;
  const inStock = product.inStock !== false;
  const others = bestSellers.filter((p) => p.id !== product.id).slice(0, 2);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-white shadow-[0_20px_50px_-30px_rgba(94,32,60,0.35)]">
      <div className="flex items-center justify-between border-b border-border/70 bg-soft-nude/50 px-5 py-3.5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-ink">À la une</h2>
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-primary">Produit du moment</span>
      </div>

      <FeaturedImpression product={product}>
        <div className="p-4">
          <TrackedLink href={`/produits/${product.slug}`} product={product} action="product_click" aria-label={`Voir ${product.name}`} className="group relative block aspect-[5/4] overflow-hidden rounded-2xl bg-gradient-to-b from-[#FBF8F6] to-[#F5EEEA]">
            <Image
              src={product.image}
              alt={product.imageAlt || `${product.name} — ${product.brand}`}
              fill
              sizes="344px"
              className="object-contain p-3 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none"
            />
          </TrackedLink>
          <p className="mt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-primary/90">{product.brand}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[0.9375rem] font-bold leading-snug text-ink">
            <TrackedLink href={`/produits/${product.slug}`} product={product} action="product_click" className="hover:text-primary">{title}</TrackedLink>
          </h3>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="font-tabular text-2xl font-extrabold tracking-tight text-ink">{formatPrice(product.priceMillimes)}</p>
            <p className={`flex items-center gap-1 text-xs font-semibold ${inStock ? "text-emerald-700" : "text-amber-700"}`}>
              <span className={`size-1.5 rounded-full ${inStock ? "bg-emerald-600" : "bg-amber-600"}`} aria-hidden />
              {inStock ? "En stock" : "Indisponible"}
            </p>
          </div>
          <div className="mt-3">
            {inStock ? (
              <FeaturedActions product={product} buyLabel={config.ctaLabel} compact />
            ) : (
              <TrackedLink href={`/produits/${product.slug}`} product={product} action="product_click" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                Voir le produit
              </TrackedLink>
            )}
          </div>
        </div>
      </FeaturedImpression>

      {others.length > 0 && (
        <ul className="mt-auto border-t border-border/70">
          {others.map((p, i) => (
            <li key={p.id} className="border-b border-border/60 last:border-b-0">
              <Link href={`/produits/${p.slug}`} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-soft-nude/40">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#F8F3F0] ring-1 ring-border/50">
                  <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1.5 mix-blend-multiply" />
                  <span className="absolute start-0 top-0 rounded-br-md bg-ink px-1.5 text-[0.5625rem] font-bold text-white">0{i + 1}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-ink">{p.name}</span>
                  <span className="mt-0.5 block font-tabular text-sm font-extrabold text-primary">{formatPrice(p.priceMillimes)}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/shop" className="flex items-center justify-center gap-1.5 border-t border-border/70 bg-soft-nude/30 px-4 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-ink transition-colors hover:text-primary">
        Voir toute la boutique <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
