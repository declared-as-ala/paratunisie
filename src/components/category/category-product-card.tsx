"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Eye, Heart, Mail, ShoppingBag, Truck, Zap } from "lucide-react";
import { useCallback, useState } from "react";

import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { type ProductSummary } from "@/lib/data/products";
import { DemanderModal } from "@/components/product/demander-modal";

function formatDT(millimes: number): string {
  const dt = millimes / 1000;
  return Number.isInteger(dt) ? `${dt} DT` : `${dt.toFixed(3).replace(".", ",")} DT`;
}

export function CategoryProductCard({
  product,
  priority = false,
  highlight,
}: {
  product: ProductSummary;
  priority?: boolean;
  highlight?: string;
}) {
  const [imgSrc, setImgSrc] = useState(product.image || "/assets/product-unavailable.svg");
  const [prevImage, setPrevImage] = useState(product.image);
  const { isWishlisted, toggle } = useWishlist();
  const saved = isWishlisted(product.id);
  const { addItem, isInCart } = useCart();
  const added = isInCart(product.id);
  const [demanderOpen, setDemanderOpen] = useState(false);

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

  // Price & discount calculation
  const currentMillimes =
    product.salePriceMillimes && product.salePriceMillimes < product.priceMillimes
      ? product.salePriceMillimes
      : product.priceMillimes;

  const regularMillimes =
    product.regularPriceMillimes && product.regularPriceMillimes > currentMillimes
      ? product.regularPriceMillimes
      : Math.round(currentMillimes * 1.15 / 1000) * 1000;

  const hasDiscount = isAvailable && regularMillimes > currentMillimes;
  const discountPercent = hasDiscount
    ? Math.round(((regularMillimes - currentMillimes) / regularMillimes) * 100)
    : 0;
  const savedMillimes = hasDiscount ? regularMillimes - currentMillimes : 0;

  return (
    <>
      <article className="group relative flex h-full w-full min-w-0 flex-row overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xs transition-all duration-200 ease-out sm:flex-col hover:border-primary/40 hover:shadow-[0_14px_30px_-14px_rgba(94,32,60,0.28)]">
        {/* ── Image Column (Left on Mobile, Top on Desktop) ─────────────── */}
        <div className="relative w-[108px] shrink-0 self-stretch min-[360px]:w-[124px] sm:w-auto sm:self-auto">
          <div className="relative h-full w-full shrink-0 overflow-hidden bg-[#FAF7F5] sm:h-auto sm:aspect-[4/3]">
            <Link
              href={href}
              aria-label={`Voir ${product.name}`}
              className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(120%_90%_at_50%_38%,transparent_55%,rgba(94,32,60,0.04)_100%)]"
              />
              <span className="absolute inset-[6%] block">
                <Image
                  src={imgSrc}
                  alt={`${product.name} — ${product.brand}`}
                  fill
                  priority={priority}
                  sizes="(max-width: 640px) 124px, (max-width: 1024px) 33vw, 260px"
                  className="object-contain object-center mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-105"
                  onError={() => setImgSrc("/assets/product-unavailable.svg")}
                />
              </span>
            </Link>
          </div>

          {/* Top-Left Badge */}
          <div className="pointer-events-none absolute start-2 top-2 z-10 flex flex-col items-start gap-1 sm:start-3 sm:top-3">
            {!isAvailable ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide text-white shadow-2xs">
                Sur commande
              </span>
            ) : discountPercent > 0 ? (
              <span className="inline-flex items-center gap-0.5 rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold tabular-nums tracking-wide text-white shadow-2xs sm:px-2.5 sm:py-1">
                <Zap size={10} className="fill-white" />-{discountPercent}%
              </span>
            ) : highlight ? (
              <span className="inline-flex items-center rounded-lg bg-primary px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-white shadow-2xs">
                {highlight}
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Content Column (Right on Mobile, Bottom on Desktop) ───────── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 px-2.5 py-2.5 min-[360px]:px-3 min-[360px]:py-3 sm:p-3.5">
          {/* Brand tag (subtle) */}
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            {product.brand}
          </span>

          {/* Product Title */}
          <Link
            href={href}
            className="block min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <h3
              title={product.name}
              className="line-clamp-2 min-h-[2.25rem] text-[13px] font-bold leading-snug text-ink transition-colors group-hover:text-primary max-[399px]:line-clamp-3 sm:min-h-[2.6rem] sm:text-sm"
            >
              {product.name}
            </h3>
          </Link>

          {/* Price + Strikethrough + Savings Pill Row */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="whitespace-nowrap text-lg sm:text-xl font-extrabold tabular-nums text-primary">
              {formatDT(currentMillimes)}
            </span>
            {hasDiscount && (
              <>
                <span
                  className="whitespace-nowrap text-[12px] sm:text-[13px] text-ink-muted line-through tabular-nums"
                  aria-label={`Prix barré: ${formatDT(regularMillimes)}`}
                >
                  {formatDT(regularMillimes)}
                </span>
                <span className="ms-auto inline-flex shrink-0 items-center rounded-md bg-emerald-500/12 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold tabular-nums text-emerald-800">
                  −{formatDT(savedMillimes)}
                </span>
              </>
            )}
          </div>

          {/* Stock & Delivery 24-72h Row */}
          <div className="flex flex-nowrap items-center gap-x-2.5 overflow-hidden text-[11px] font-medium text-ink-muted sm:gap-x-3">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span
                className={`size-2 shrink-0 rounded-full ${
                  isAvailable ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-amber-500"
                }`}
              />
              <span className={`truncate font-semibold ${isAvailable ? "text-emerald-700" : "text-amber-700"}`}>
                {isAvailable ? "En stock" : "Sur commande"}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-ink-muted">
              <Truck size={12} className="shrink-0" />
              <span>24–48h</span>
            </span>
          </div>

          {/* Action Buttons Row: Heart/Quick Action + Ajouter au panier */}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
              aria-pressed={saved}
              className="pointer-events-auto z-20 flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-[#FAF7F5] text-ink-muted transition-all hover:border-primary/40 hover:text-primary active:scale-95 cursor-pointer"
            >
              <Heart size={16} className={saved ? "fill-primary text-primary" : ""} />
            </button>

            <div className="min-w-0 flex-1">
              {isAvailable ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex h-10 sm:h-11 w-full items-center justify-center gap-1.5 rounded-xl px-3 text-xs sm:text-[13px] font-bold transition-all active:scale-[0.98] cursor-pointer ${
                    added
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-primary text-white hover:bg-primary-hover shadow-2xs"
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={15} className="shrink-0" />
                      <span className="truncate">Ajouté</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} className="shrink-0" />
                      <span className="truncate">
                        Ajouter<span className="hidden sm:inline"> au panier</span>
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDemanderOpen(true)}
                  className="flex h-10 sm:h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 text-xs sm:text-[13px] font-bold text-white shadow-2xs transition-all hover:bg-amber-700 active:scale-[0.98] cursor-pointer"
                >
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">Sur commande</span>
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

