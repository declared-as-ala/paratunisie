"use client";

import Link from "next/link";
import { Check, Heart, Mail, ShoppingBag } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { DemanderModal } from "@/components/product/demander-modal";

export interface ProductCardProps {
  product: ProductSummary;
  variant?: "home" | "shop";
}

export function ProductCard({ product, variant = "shop" }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.image || "/assets/product-tube.webp");
  const [prevImage, setPrevImage] = useState(product.image);
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(product.id);
  const { addItem, isInCart } = useCart();
  const added = isInCart(product.id);
  const [loading, setLoading] = useState(false);
  const [demanderOpen, setDemanderOpen] = useState(false);

  // Sync image state whenever product image prop changes
  if (prevImage !== product.image) {
    setPrevImage(product.image);
    setImgSrc(product.image || "/assets/product-tube.webp");
  }

  const isAvailable = product.inStock !== false;

  const handleAdd = useCallback(() => {
    if (!isAvailable) {
      setDemanderOpen(true);
      return;
    }
    setLoading(true);
    addItem(product);
    setTimeout(() => setLoading(false), 250);
  }, [addItem, product, isAvailable]);

  // Real promotion validation: only display discount if genuine sale data exists in database
  const now = Date.now();
  const hasActiveSale = Boolean(
    product.regularPriceMillimes &&
    product.salePriceMillimes &&
    product.salePriceMillimes < product.regularPriceMillimes &&
    (!product.saleStartAt || now >= new Date(product.saleStartAt).getTime()) &&
    (!product.saleEndAt || now <= new Date(product.saleEndAt).getTime())
  );
  const discountPercent =
    hasActiveSale && product.regularPriceMillimes && product.salePriceMillimes
      ? Math.round(((product.regularPriceMillimes - product.salePriceMillimes) / product.regularPriceMillimes) * 100)
      : 0;
  const currentPriceMillimes = hasActiveSale && product.salePriceMillimes ? product.salePriceMillimes : product.priceMillimes;
  const regularPriceMillimes = hasActiveSale ? product.regularPriceMillimes : undefined;

  return (
    <>
      {/* ── 1. HOME MOBILE HORIZONTAL CARD (variant="home" & < sm) ─────────────── */}
      {variant === "home" && (
        <article className="group relative flex w-full flex-row overflow-hidden rounded-2xl border border-border/70 bg-white p-3 gap-3 shadow-2xs hover:border-primary/40 transition-all sm:hidden">
          {/* Top Badge: Sur Commande or Real Discount */}
          {!isAvailable ? (
            <span className="absolute start-2 top-2 z-10 rounded-full bg-amber-600 px-2 py-0.5 text-[0.6rem] font-extrabold text-white shadow-2xs">
              SUR COMMANDE
            </span>
          ) : hasActiveSale && discountPercent > 0 ? (
            <span className="absolute start-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-extrabold text-white shadow-2xs">
              -{discountPercent}%
            </span>
          ) : null}

          {/* Favorite Heart Button */}
          <button
            type="button"
            aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
            aria-pressed={saved}
            onClick={() => toggle(product.id)}
            className="absolute end-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-2xs border border-border/60 text-ink-muted hover:text-primary transition-all active:scale-95"
          >
            <Heart size={15} className={saved ? "fill-primary text-primary" : "text-ink-muted"} />
          </button>

          {/* Left: Product Image Box */}
          <div className="relative w-[105px] xs:w-[120px] shrink-0 aspect-square rounded-xl bg-white p-1.5 flex items-center justify-center border border-border/40 overflow-hidden">
            <Link href={`/produits/${product.slug}`} className="flex size-full items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={`${product.name} de ${product.brand}`}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
                onError={() => setImgSrc("/assets/product-tube.webp")}
              />
            </Link>
          </div>

          {/* Right: Product Details Column */}
          <div className="flex flex-1 flex-col justify-between min-w-0 pr-7">
            <div>
              <p className="text-[0.625rem] font-extrabold tracking-wider text-primary uppercase truncate">{product.brand}</p>
              <h3 className="mt-0.5 text-xs font-bold leading-4 text-ink line-clamp-2">
                <Link href={`/produits/${product.slug}`} className="hover:text-primary transition-colors">
                  {product.name}
                </Link>
              </h3>
            </div>

            <div className="mt-2 space-y-1.5">
              {/* Prices & Savings */}
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-tabular text-sm font-extrabold text-ink">{formatPrice(currentPriceMillimes)}</span>
                {hasActiveSale && regularPriceMillimes && isAvailable && (
                  <>
                    <span className="font-tabular text-[0.6875rem] text-ink-muted/70 line-through">
                      {formatPrice(regularPriceMillimes)}
                    </span>
                    <span className="rounded-md bg-soft-nude px-1.5 py-0.5 text-[0.6rem] font-bold text-primary border border-border/50">
                      -{formatPrice(regularPriceMillimes - currentPriceMillimes)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Reassurance */}
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold">
                {isAvailable ? (
                  <>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">✓ En stock</span>
                    <span className="text-ink-muted">🚚 24–48h</span>
                  </>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-0.5">○ Sur commande</span>
                )}
              </div>

              {/* CTA Button */}
              {isAvailable ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={loading}
                  onClick={handleAdd}
                  aria-label={added ? `${product.name} ajouté` : `Ajouter ${product.name}`}
                  className={`w-full h-8.5 rounded-xl font-bold text-xs gap-1.5 shadow-2xs transition-all ${
                    added
                      ? "bg-success-bg text-success border border-success/30"
                      : "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                  }`}
                >
                  {added ? <Check size={14} className="text-success" /> : <ShoppingBag size={14} />}
                  <span>{added ? "Ajouté" : "Ajouter au panier"}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDemanderOpen(true)}
                  aria-label={`Demander ${product.name}`}
                  className="w-full h-8.5 rounded-xl font-bold text-xs gap-1.5 shadow-2xs bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98]"
                >
                  <Mail size={13} />
                  <span>Demander</span>
                </Button>
              )}
            </div>
          </div>
        </article>
      )}

      {/* ── 2. VERTICAL CARD (Always for variant="shop", or sm:flex for variant="home") ── */}
      <article
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white p-2.5 sm:p-3 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_28px_rgba(43,35,38,0.06)] ${
          variant === "home" ? "hidden sm:flex" : "flex"
        }`}
      >
        {/* Top Badge */}
        {!isAvailable ? (
          <span className="absolute start-2 top-2 z-10 rounded-full bg-amber-600 px-1.5 sm:px-2 py-0.5 text-[0.6rem] sm:text-[0.625rem] font-extrabold text-white shadow-2xs">
            SUR COMMANDE
          </span>
        ) : hasActiveSale && discountPercent > 0 ? (
          <span className="absolute start-2 top-2 z-10 rounded-full bg-primary px-1.5 sm:px-2 py-0.5 text-[0.6rem] sm:text-[0.625rem] font-extrabold text-white shadow-2xs">
            -{discountPercent}%
          </span>
        ) : null}

        {/* Favorite Heart Button */}
        <button
          type="button"
          aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={saved}
          onClick={() => toggle(product.id)}
          className="absolute end-2 top-2 z-10 flex size-7 sm:size-7.5 items-center justify-center rounded-full bg-white/90 shadow-2xs border border-border/60 text-ink-muted hover:text-primary transition-all active:scale-95"
        >
          <Heart size={14} className={saved ? "fill-primary text-primary" : "text-ink-muted"} />
        </button>

        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white p-1.5 sm:p-2 flex items-center justify-center border border-border/30">
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
        <div className="flex flex-1 flex-col pt-2 sm:pt-2.5 min-w-0">
          <p className="text-[0.6rem] sm:text-[0.625rem] font-bold tracking-wider text-primary/90 uppercase truncate">{product.brand}</p>
          <h3 className="mt-0.5 text-[0.75rem] sm:text-xs font-bold leading-4 text-ink line-clamp-2 min-h-[32px]">
            <Link href={`/produits/${product.slug}`} className="hover:text-primary transition-colors">
              {product.name}
            </Link>
          </h3>

          <div className="mt-auto pt-2 sm:pt-2.5 space-y-1 sm:space-y-1.5">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="font-tabular text-xs sm:text-sm font-extrabold text-ink">{formatPrice(currentPriceMillimes)}</span>
              {hasActiveSale && regularPriceMillimes && isAvailable && (
                <>
                  <span className="font-tabular text-[0.6rem] sm:text-[0.65rem] text-ink-muted/70 line-through">
                    {formatPrice(regularPriceMillimes)}
                  </span>
                  <span className="rounded-md bg-soft-nude px-1 sm:px-1.5 py-0.5 text-[0.55rem] sm:text-[0.6rem] font-bold text-primary border border-border/50">
                    -{formatPrice(regularPriceMillimes - currentPriceMillimes)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[0.6rem] sm:text-[0.65rem] font-semibold">
              {isAvailable ? (
                <>
                  <span className="text-emerald-700 font-bold">✓ En stock</span>
                  <span className="text-ink-muted">🚚 24–48h</span>
                </>
              ) : (
                <span className="text-amber-700 font-bold">○ Sur commande</span>
              )}
            </div>

            {/* Action Button */}
            {isAvailable ? (
              <Button
                type="button"
                size="sm"
                disabled={loading}
                variant={added ? "secondary" : "default"}
                onClick={handleAdd}
                aria-label={added ? `${product.name} ajouté` : `Ajouter ${product.name}`}
                className={`w-full h-8.5 sm:h-9 rounded-xl font-bold text-[0.7rem] sm:text-xs gap-1 sm:gap-1.5 shadow-2xs transition-all ${
                  added
                    ? "bg-success-bg text-success border border-success/30 hover:bg-success-bg/80"
                    : "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                }`}
              >
                {added ? <Check size={14} className="text-success" /> : <ShoppingBag size={14} />}
                <span>{added ? "Ajouté" : "Ajouter au panier"}</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setDemanderOpen(true)}
                aria-label={`Demander ${product.name}`}
                className="w-full h-8.5 sm:h-9 rounded-xl font-bold text-[0.7rem] sm:text-xs gap-1 sm:gap-1.5 shadow-2xs bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98]"
              >
                <Mail size={13} />
                <span>Demander</span>
              </Button>
            )}
          </div>
        </div>
      </article>

      {/* Demander Modal */}
      <DemanderModal
        isOpen={demanderOpen}
        onClose={() => setDemanderOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          brand: product.brand,
          image: imgSrc,
          priceMillimes: product.priceMillimes,
        }}
      />
    </>
  );
}


