"use client";

import Link from "next/link";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice, type ProductSummary } from "@/lib/data/products";

export function ProductCard({ product }: { product: ProductSummary }) {
  const [imgSrc, setImgSrc] = useState(product.image || "/assets/product-tube.webp");
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(product.id);
  const { addItem, isInCart } = useCart();
  const added = isInCart(product.id);
  const [loading, setLoading] = useState(false);

  // Sync state whenever product prop changes
  useEffect(() => {
    setImgSrc(product.image || "/assets/product-tube.webp");
  }, [product.id, product.image]);

  const handleAdd = useCallback(() => {
    setLoading(true);
    addItem(product);
    setTimeout(() => setLoading(false), 250);
  }, [addItem, product]);

  // Optional mock discount calculation for visual fidelity
  const oldPriceMillimes = Math.round(product.priceMillimes * 1.2);
  const showDiscount = (product.id.charCodeAt(0) + product.id.length) % 3 === 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_28px_rgba(43,35,38,0.06)] p-3">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white p-2 flex items-center justify-center border border-border/30">
        {/* Discount Badge */}
        {showDiscount && (
          <span className="absolute start-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-extrabold text-white shadow-2xs">
            -15%
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
          className="absolute end-2 top-2 z-10 flex size-7.5 items-center justify-center rounded-full bg-white/90 shadow-2xs border border-border/60 text-ink-muted hover:text-primary transition-all active:scale-95"
        >
          <Heart size={14} className={saved ? "fill-primary text-primary" : "text-ink-muted"} />
        </button>

        <Link
          href={`/produits/${product.slug}`}
          className="flex size-full items-center justify-center p-1 focus:outline-none"
          aria-label={`Voir ${product.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`${product.name} de ${product.brand}`}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgSrc("/assets/product-tube.webp")}
          />
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col pt-2.5">
        <p className="text-[0.625rem] font-bold tracking-wider text-primary/90 uppercase truncate">{product.brand}</p>
        <h3 className="mt-0.5 text-xs font-bold leading-4 text-ink line-clamp-2 min-h-[32px]">
          <Link href={`/produits/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-tabular text-xs sm:text-sm font-extrabold text-ink">{formatPrice(product.priceMillimes)}</span>
            {showDiscount && (
              <span className="font-tabular text-[0.65rem] text-ink-muted/70 line-through">
                {formatPrice(oldPriceMillimes)}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Button
            type="button"
            size="sm"
            disabled={loading}
            variant={added ? "secondary" : "default"}
            onClick={handleAdd}
            aria-label={added ? `${product.name} ajouté` : `Ajouter ${product.name}`}
            className={`w-full mt-2 h-9 rounded-xl font-bold text-xs gap-1.5 shadow-2xs transition-all ${
              added
                ? "bg-success-bg text-success border border-success/30 hover:bg-success-bg/80"
                : "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
            }`}
          >
            {added ? <Check size={14} className="text-success" /> : <ShoppingBag size={14} />}
            <span>{added ? "Ajouté au panier" : "Ajouter au panier"}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

