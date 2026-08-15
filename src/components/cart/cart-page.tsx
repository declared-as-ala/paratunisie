"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart, FREE_DELIVERY_THRESHOLD } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/data/products";

function FreeDeliveryBar({ remaining }: { remaining: number }) {
  if (remaining <= 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-success-bg px-3 py-2 text-xs font-medium text-success sm:px-4 sm:py-2.5 sm:text-sm">
        <Check className="size-3.5 shrink-0" aria-hidden />
        Livraison offerte
      </div>
    );
  }

  const progress = Math.min(1, (FREE_DELIVERY_THRESHOLD - remaining) / FREE_DELIVERY_THRESHOLD);

  return (
    <div className="rounded-lg bg-soft-nude px-3 py-2.5 sm:px-4">
      <p className="text-xs text-ink sm:text-sm">
        Plus que <strong className="text-primary">{formatPrice(remaining)}</strong> pour la livraison offerte
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border sm:mt-2 sm:h-1.5">
        <div
          className="h-full rounded-full bg-primary transition-all duration-[var(--duration-standard)] ease-[var(--ease-out-standard)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center sm:py-28">
      <div className="flex size-20 items-center justify-center rounded-full bg-soft-nude sm:size-24">
        <ShoppingBag className="size-9 text-ink-muted/40 sm:size-11" aria-hidden />
      </div>
      <h1 className="mt-6 font-serif text-2xl font-medium text-ink sm:text-3xl">
        Votre panier est vide
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
        Explorez notre sélection de soins dermocosmétiques et trouvez vos favoris.
      </p>
      <Button size="lg" className="mt-8 min-w-44" render={<Link href="/shop" />}>
        Découvrir le Shop
      </Button>
    </div>
  );
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: { productId: string; slug: string; brand: string; name: string; sizeLabel: string; priceMillimes: number; quantity: number; image: string };
  onRemove: () => void;
  onUpdateQuantity: (q: number) => void;
}) {
  return (
    <li className="group flex gap-3 py-3 first:pt-0 sm:gap-4 sm:py-4">
      {/* Product image — compact on mobile, slightly larger on desktop */}
      <Link
        href={`/produits/${item.slug}`}
        className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white border border-border flex items-center justify-center p-1 transition-transform duration-150 ease-out active:scale-[0.97] sm:size-20"
        aria-label={`Voir ${item.name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image || "/assets/product-tube.webp"}
          alt={`${item.name} de ${item.brand}`}
          className="size-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
          }}
        />
      </Link>

      {/* Product info + controls */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top: brand, name, size, price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold tracking-[0.12em] text-primary uppercase sm:text-xs">
              {item.brand}
            </p>
            <Link
              href={`/produits/${item.slug}`}
              className="mt-0.5 block text-sm font-medium text-ink line-clamp-1 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none sm:text-[0.9rem]"
            >
              {item.name}
            </Link>
            <p className="mt-px text-[0.7rem] text-ink-muted sm:text-xs">{item.sizeLabel}</p>
          </div>
          <p className="font-tabular shrink-0 text-sm font-semibold text-ink sm:text-[0.9rem]">
            {formatPrice(item.priceMillimes * item.quantity)}
          </p>
        </div>

        {/* Bottom: quantity + remove */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              aria-label={`Diminuer la quantité de ${item.name}`}
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex size-8 items-center justify-center text-ink-muted transition-transform duration-100 ease-out hover:text-ink disabled:opacity-30 active:scale-90 sm:size-9"
            >
              <Minus className="size-3 sm:size-3.5" aria-hidden />
            </button>
            <span className="font-tabular w-6 text-center text-xs font-medium text-ink sm:w-7 sm:text-sm">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={`Augmenter la quantité de ${item.name}`}
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              className="flex size-8 items-center justify-center text-ink-muted transition-transform duration-100 ease-out hover:text-ink active:scale-90 sm:size-9"
            >
              <Plus className="size-3 sm:size-3.5" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            aria-label={`Retirer ${item.name} du panier`}
            onClick={onRemove}
            className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-danger-bg hover:text-destructive active:scale-90 sm:size-9"
          >
            <Trash2 className="size-3.5 sm:size-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-32 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pt-12">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-ink-muted sm:mb-6 sm:text-sm">
        <ol className="flex items-center gap-1.5 sm:gap-2">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li aria-hidden className="text-ink-muted/50">/</li>
          <li aria-current="page" className="text-ink">Panier</li>
        </ol>
      </nav>

      {/* Title — tighter on mobile */}
      <h1 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:text-4xl">
        Mon panier
      </h1>

      <div className="mt-5 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_380px] lg:gap-8">
        {/* Items column */}
        <div>
          <FreeDeliveryBar remaining={cart.freeDeliveryRemaining} />

          <ul className="mt-3 divide-y divide-border/60 sm:mt-4 sm:divide-border">
            {cart.items.map((item) => (
              <CartItemRow
                key={`${item.productId}-${item.sizeLabel}`}
                item={item}
                onRemove={() => cart.removeItem(item.productId, item.sizeLabel)}
                onUpdateQuantity={(q) => cart.updateQuantity(item.productId, item.sizeLabel, q)}
              />
            ))}
          </ul>
        </div>

        {/* Summary sidebar — desktop */}
        <aside className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
          <SummaryCard cart={cart} />
        </aside>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface-alt/95 px-4 py-3 backdrop-blur-md sm:bottom-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[0.65rem] text-ink-muted">Total</p>
            <p className="font-tabular text-lg font-semibold leading-tight text-ink">
              {formatPrice(cart.subtotal)}
            </p>
          </div>
          <Button size="lg" className="shrink-0 px-6" render={<Link href="/checkout" />}>
            Passer à la commande
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  cart,
}: {
  cart: {
    itemCount: number;
    subtotal: number;
    hasFreeDelivery: boolean;
    items: { productId: string; sizeLabel: string; brand: string; name: string; priceMillimes: number; quantity: number }[];
  };
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-alt p-5">
      <h2 className="font-serif text-lg font-medium text-ink sm:text-xl">Récapitulatif</h2>

      <dl className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <dt className="text-ink-muted">
            Sous-total ({cart.itemCount} article{cart.itemCount === 1 ? "" : "s"})
          </dt>
          <dd className="font-tabular font-semibold text-ink">{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-ink-muted">Livraison Aramex</dt>
          <dd className="font-tabular text-ink">
            {cart.hasFreeDelivery ? (
              <span className="text-success">Offerte</span>
            ) : (
              "Calculée à l'étape suivante"
            )}
          </dd>
        </div>
        <div className="border-t border-border pt-2.5">
          <div className="flex items-center justify-between">
            <dt className="font-medium text-ink">Total</dt>
            <dd className="font-tabular text-lg font-semibold text-ink">
              {formatPrice(cart.subtotal)}
            </dd>
          </div>
        </div>
      </dl>

      <Button size="lg" className="mt-5 w-full" render={<Link href="/checkout" />}>
        Passer la commande
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="mt-2 w-full"
        render={<Link href="/shop" />}
      >
        Continuer mes achats
      </Button>
    </div>
  );
}
