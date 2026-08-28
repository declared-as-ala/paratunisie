import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Star } from "lucide-react";
import { getProductBySlug, formatPrice, type ProductSummary } from "@/lib/data/products";

interface ArticleProductCardProps {
  productSlug?: string;
  productId?: string;
  rationale?: string;
  highlightBadge?: string;
  initialProduct?: ProductSummary | null;
}

export function ArticleProductCard({
  productSlug,
  productId,
  rationale,
  highlightBadge,
  initialProduct,
}: ArticleProductCardProps) {
  const product = initialProduct || (productSlug ? getProductBySlug(productSlug) : null);

  if (!product) {
    // Graceful fallback if product is deleted or unavailable
    return null;
  }

  const priceFormatted = formatPrice(product.priceMillimes);
  const inStock = product.inStock !== false;

  return (
    <aside
      aria-label={`Produit mentionné : ${product.name}`}
      className="my-6 overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Product Image */}
        <div className="relative flex size-full sm:size-48 shrink-0 items-center justify-center bg-soft-nude/30 p-4 border-b sm:border-b-0 sm:border-r border-border/60">
          {product.image ? (
            <div className="relative size-36">
              <Image
                src={product.image}
                alt={`Photo du produit ${product.name} disponible en Tunisie`}
                fill
                sizes="(max-width: 640px) 100vw, 150px"
                className="object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex size-36 items-center justify-center text-xs text-ink-muted">
              Image non disponible
            </div>
          )}
          {highlightBadge && (
            <span className="absolute top-2.5 left-2.5 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              {highlightBadge}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {product.brand}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  inStock ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {inStock ? (
                  <>
                    <Check className="size-3.5" /> En stock
                  </>
                ) : (
                  "Sur commande"
                )}
              </span>
            </div>

            <h4 className="mt-1 font-serif text-lg font-bold text-ink hover:text-primary transition-colors">
              <Link href={`/produits/${product.slug}`}>{product.name}</Link>
            </h4>

            {product.size && (
              <p className="mt-0.5 text-xs text-ink-muted">Format : <strong>{product.size}</strong></p>
            )}

            {rationale ? (
              <div className="mt-2.5 rounded-lg bg-soft-nude/40 p-2.5 text-xs leading-relaxed text-ink-muted border border-border/50">
                <strong className="text-ink font-semibold">Pourquoi nous le recommandons : </strong>
                {rationale}
              </div>
            ) : product.benefit ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-muted line-clamp-2">
                {product.benefit}
              </p>
            ) : null}
          </div>

          {/* Pricing & CTA */}
          <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-tabular text-xl font-extrabold text-ink">{priceFormatted}</span>
              <span className="text-[11px] text-ink-muted font-medium">(TVA incluse)</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/produits/${product.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                Voir le produit
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
