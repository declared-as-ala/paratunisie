"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, X } from "lucide-react";

import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { products, formatPrice } from "@/lib/data/products";

export function WishlistPage() {
  const { ids, remove } = useWishlist();
  const { addItem } = useCart();

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
      <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-muted sm:text-sm">
        <ol className="flex items-center gap-1.5 sm:gap-2">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li aria-hidden className="text-ink-muted/50">/</li>
          <li aria-current="page" className="text-ink">Mes favoris</li>
        </ol>
      </nav>

      <header>
        <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-sm">
          Mes favoris
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Vos coups de cœur
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
          {wishlistProducts.length > 0
            ? `${wishlistProducts.length} produit${wishlistProducts.length === 1 ? "" : "s"} enregistré${wishlistProducts.length === 1 ? "" : "s"}.`
            : "Aucun produit en favori pour le moment."}
        </p>
      </header>

      {wishlistProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col rounded-xl border border-border bg-surface-alt"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-xl bg-soft-nude">
                <Link href={`/produits/${product.slug}`} aria-label={`Voir ${product.name}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform duration-[var(--duration-standard)] group-hover:scale-105"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label={`Retirer ${product.name} des favoris`}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-surface/90 text-ink-muted backdrop-blur-sm transition-colors hover:bg-danger-bg hover:text-danger focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-primary uppercase sm:text-xs">
                  {product.brand}
                </p>
                <Link href={`/produits/${product.slug}`} className="mt-1 text-sm font-medium text-ink hover:text-primary sm:text-base">
                  {product.name}
                </Link>
                <p className="mt-1 text-xs text-ink-muted line-clamp-2">{product.benefit}</p>
                <div className="mt-auto flex items-end justify-between pt-3">
                  <span className="font-tabular text-base font-semibold text-ink sm:text-lg">
                    {formatPrice(product.priceMillimes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(product)}
                    aria-label={`Ajouter ${product.name} au panier`}
                    className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-90"
                  >
                    <ShoppingCart className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-soft-nude">
            <Heart className="size-7 text-primary" aria-hidden />
          </div>
          <h2 className="mt-4 font-serif text-xl font-medium text-ink">Aucun favori pour le moment</h2>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Parcourez notre catalogue et enregistrez les produits que vous aimez.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            Découvrir nos soins
          </Link>
        </div>
      )}
    </div>
  );
}
