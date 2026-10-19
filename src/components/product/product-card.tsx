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
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <p className="truncate text-[0.625rem] font-bold uppercase tracking-[0.12em] text-primary/90">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-[0.8125rem] font-semibold leading-5 text-ink sm:text-sm">
            <Link href={href} className="transition-colors hover:text-primary">{product.name}</Link>
          </h3>

          <div className="mt-auto pt-3">
            <p className="whitespace-nowrap font-tabular text-[1.0625rem] font-extrabold leading-none tracking-tight text-ink sm:text-lg">
              {formatPrice(currentPriceMillimes)}
            </p>
            {hasActiveSale && product.regularPriceMillimes && isAvailable && (
              <p className="mt-1 font-tabular text-[0.6875rem] text-ink-muted line-through">{formatPrice(product.regularPriceMillimes)}</p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className={`flex items-center gap-1 text-[0.6875rem] font-semibold ${isAvailable ? "text-emerald-700" : "text-amber-700"}`}>
                <span className={`size-1.5 rounded-full ${isAvailable ? "bg-emerald-600" : "bg-amber-600"}`} aria-hidden />
                {isAvailable ? "En stock" : "Sur commande"}
              </p>

              {isAvailable ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  aria-label={added ? `${product.name} déjà dans le panier — en ajouter un autre` : `Ajouter ${product.name} au panier`}
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full shadow-sm transition-all active:scale-90 ${
                    added ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300" : "bg-primary text-white hover:bg-primary-hover hover:shadow-md"
                  }`}
                >
                  {added ? <Check size={18} /> : <Plus size={20} strokeWidth={2.4} />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDemanderOpen(true)}
                  aria-label={`Demander ${product.name}`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition-all hover:bg-amber-700 active:scale-90"
                >
                  <Mail size={17} />
                </button>
              )}
            </div>
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
