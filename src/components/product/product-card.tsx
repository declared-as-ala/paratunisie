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

  // Sync state whenever product prop changes
  useEffect(() => {
    setImgSrc(product.image || "/assets/product-tube.webp");
  }, [product.id, product.image]);

  const handleAdd = useCallback(() => {
    addItem(product);
  }, [addItem, product]);

  // Optional mock discount calculation for visual fidelity
  const oldPriceMillimes = Math.round(product.priceMillimes * 1.2);
  const showDiscount = (product.id.charCodeAt(0) + product.id.length) % 3 === 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(43,35,38,0.08)] p-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white p-2 flex items-center justify-center">
        {/* Discount Badge */}
        {showDiscount && (
          <span className="absolute start-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-bold text-white shadow-2xs">
            -15%
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
          className="absolute end-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-2xs border border-border/60 text-ink-muted hover:text-primary transition-colors"
        >
          <Heart size={15} className={saved ? "fill-primary text-primary" : "text-ink-muted"} />
        </button>

        <Link
          href={`/produits/${product.slug}`}
          className="block size-full flex items-center justify-center focus:outline-none"
          aria-label={`Voir ${product.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`${product.name} de ${product.brand}`}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgSrc("/assets/product-tube.webp")}
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[0.65rem] font-extrabold tracking-wider text-primary uppercase">{product.brand}</p>
        <h3 className="mt-1 text-xs font-bold leading-4 text-ink line-clamp-2 min-h-[32px]">
          <Link href={`/produits/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-tabular text-sm font-extrabold text-ink">{formatPrice(product.priceMillimes)}</span>
            {showDiscount && (
              <span className="font-tabular text-[0.6875rem] text-ink-muted line-through">
                {formatPrice(oldPriceMillimes)}
              </span>
            )}
          </div>

          {/* Full Width Dark Burgundy Button */}
          <Button
            type="button"
            size="sm"
            variant={added ? "secondary" : "default"}
            onClick={handleAdd}
            aria-label={added ? `${product.name} ajouté` : `Ajouter ${product.name}`}
            className="w-full mt-2.5 h-9 rounded-xl font-bold text-xs gap-1.5 shadow-2xs"
          >
            {added ? <Check size={14} /> : <ShoppingBag size={14} />}
            <span>{added ? "Ajouté au panier" : "Ajouter au panier"}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
