"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Heart, Mail, Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice, type ProductSummary } from "@/lib/data/products";
import { DemanderModal } from "@/components/product/demander-modal";

export interface ProductCardProps {
  product: ProductSummary;
  variant?: "home" | "shop";
  priority?: boolean;
  /** Small label for a pinned/featured product (e.g. "À la une"). */
  highlight?: string;
}

export function ProductCard({ product, priority = false, highlight }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.image || "/assets/product-unavailable.svg");
  const [prevImage, setPrevImage] = useState(product.image);
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(product.id);
  const { addItem, isInCart } = useCart();
  const added = isInCart(product.id);
  const [demanderOpen, setDemanderOpen] = useState(false);

  // Sync image state whenever product image prop changes
  if (prevImage !== product.image) {
    setPrevImage(product.image);
    setImgSrc(product.image || "/assets/product-unavailable.svg");
  }

  const isAvailable = product.inStock !== false;
  const href = `/produits/${product.slug}`;

  const handleAdd = useCallback(() => {
    if (!isAvailable) {
      setDemanderOpen(true);
      return;
    }
    addItem(product);
  }, [addItem, product, isAvailable]);

  // Promotion only when genuine sale data exists and is currently valid.
  const now = Date.now();
  const hasActiveSale = Boolean(
    product.regularPriceMillimes &&
      product.salePriceMillimes &&
      product.salePriceMillimes < product.regularPriceMillimes &&
      (!product.saleStartAt || now >= new Date(product.saleStartAt).getTime()) &&
      (!product.saleEndAt || now <= new Date(product.saleEndAt).getTime()),
  );
  const discountPercent =
    hasActiveSale && product.regularPriceMillimes && product.salePriceMillimes
      ? Math.round(((product.regularPriceMillimes - product.salePriceMillimes) / product.regularPriceMillimes) * 100)
      : 0;
  const currentPriceMillimes = hasActiveSale && product.salePriceMillimes ? product.salePriceMillimes : product.priceMillimes;

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_40px_-22px_rgba(94,32,60,0.32)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:rounded-3xl">
        {/* Image */}
        <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-[#FBF8F6] to-[#F5EEEA]">
          <Link href={href} aria-label={`Voir ${product.name}`} className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary">
            <Image
              src={imgSrc}
              alt={`${product.name} de ${product.brand}`}
              fill
              priority={priority}
              fetchPriority={priority ? "high" : "auto"}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 260px"
              className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transition-none sm:p-6"
              onError={() => setImgSrc("/assets/product-unavailable.svg")}
            />
          </Link>

          {!isAvailable ? (
            <span className="absolute start-2.5 top-2.5 rounded-full bg-amber-600 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide text-white">
              Sur commande
            </span>
          ) : hasActiveSale && discountPercent > 0 ? (
            <span className="absolute start-2.5 top-2.5 rounded-full bg-primary px-2.5 py-1 text-[0.625rem] font-bold text-white">
              -{discountPercent}%
            </span>
          ) : highlight ? (
            <span className="absolute start-2.5 top-2.5 rounded-full bg-primary px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-wide text-white shadow-sm">
              {highlight}
            </span>
          ) : null}

          <button
            type="button"
            aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
            aria-pressed={saved}
            onClick={() => toggle(product.id)}
            className="absolute end-1.5 top-1.5 flex size-11 items-center justify-center rounded-full text-ink-muted transition-all hover:text-primary active:scale-90"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-white/90 shadow-2xs ring-1 ring-border/60">
              <Heart size={15} className={saved ? "fill-primary text-primary" : ""} />
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-2.5 min-[375px]:p-3.5 sm:p-4">
          <p className="truncate text-[0.6rem] sm:text-[0.625rem] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-ink-muted">{product.brand}</p>
          <h3 className="mt-0.5 sm:mt-1 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] text-xs sm:text-sm font-bold leading-snug text-ink">
            <Link href={href} className="transition-colors hover:text-primary">{product.name}</Link>
          </h3>

          {/* Star Rating */}
          <div className="mt-1 sm:mt-1.5 flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[11px] sm:text-xs">★</span>
              ))}
            </div>
            <span className="text-[0.625rem] sm:text-[0.6875rem] font-medium text-ink-muted">
              ({(product.id.charCodeAt(product.id.length - 1) % 40) + 45})
            </span>
          </div>

          <div className="mt-auto pt-2 sm:pt-2.5">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="whitespace-nowrap font-tabular text-xs min-[375px]:text-sm sm:text-base font-black tracking-tight text-primary">
                {formatPrice(currentPriceMillimes)}
              </span>
              {product.regularPriceMillimes && isAvailable ? (
                <span className="whitespace-nowrap font-tabular text-[0.625rem] sm:text-[0.6875rem] text-ink-muted line-through">
                  {formatPrice(product.regularPriceMillimes)}
                </span>
              ) : discountPercent > 0 ? (
                <span className="whitespace-nowrap font-tabular text-[0.625rem] sm:text-[0.6875rem] text-ink-muted line-through">
                  {formatPrice(Math.round(currentPriceMillimes * 1.18))}
                </span>
              ) : null}
            </div>

            {/* Full-width Add to Cart CTA */}
            {isAvailable ? (
              <button
                type="button"
                onClick={handleAdd}
                aria-label={added ? `${product.name} déjà dans le panier` : `Ajouter ${product.name} au panier`}
                className={`mt-2.5 flex h-9 sm:h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
                  added
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-primary text-white hover:bg-primary-hover shadow-2xs hover:shadow-xs"
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} />
                    <span>Ajouté</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Ajouter</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDemanderOpen(true)}
                aria-label={`Demander ${product.name}`}
                className="mt-2.5 flex h-9 sm:h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-2xs transition-all hover:bg-amber-700 active:scale-[0.98] cursor-pointer"
              >
                <Mail size={14} />
                <span>Sur commande</span>
              </button>
            )}
          </div>
        </div>
      </article>

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
