"use client";

import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, FREE_DELIVERY_THRESHOLD } from "@/hooks/use-cart";
import { useCartDrawer } from "@/hooks/use-cart-drawer";
import { formatPrice } from "@/lib/data/products";

function FreeDeliveryBar({ remaining }: { remaining: number }) {
  if (remaining <= 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-xs">
        <Check className="size-4 shrink-0 text-emerald-600" aria-hidden />
        <span>Félicitations ! Votre livraison est OFFERTE 🎉</span>
      </div>
    );
  }

  const progress = Math.min(1, (FREE_DELIVERY_THRESHOLD - remaining) / FREE_DELIVERY_THRESHOLD);

  return (
    <div className="rounded-2xl bg-soft-nude/70 p-3.5 border border-border shadow-xs">
      <p className="text-xs text-ink font-medium">
        Plus que <strong className="text-primary font-bold">{formatPrice(remaining)}</strong> pour bénéficier de la livraison offerte !
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const cart = useCart();
  const { open, setOpen, lastAdded } = useCartDrawer();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 w-full max-w-full sm:max-w-md h-dvh max-h-dvh overflow-hidden bg-white shadow-2xl border-l border-border"
      >
        <SheetHeader className="border-b border-border/80 px-4 py-3.5 sm:px-5 sm:py-4 shrink-0 bg-white">
          <div className="flex items-center justify-between w-full pr-7">
            <SheetTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-ink">
              <ShoppingBag className="size-4.5 sm:size-5 text-primary" aria-hidden />
              <span>Votre Panier</span>
              {cart.itemCount > 0 && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                  {cart.itemCount}
                </span>
              )}
            </SheetTitle>

            {cart.items.length > 0 && (
              <button
                type="button"
                onClick={() => cart.clearCart()}
                className="inline-flex items-center gap-1 text-[0.6875rem] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors border border-rose-200/80 shrink-0"
                title="Vider tous les articles du panier"
              >
                <Trash2 size={12} />
                <span>Vider</span>
              </button>
            )}
          </div>
          <SheetDescription className="sr-only">Votre panier d&apos;achat</SheetDescription>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-soft-nude border border-border/60">
              <ShoppingBag className="size-7 text-ink-muted/50" aria-hidden />
            </div>
            <p className="font-serif text-lg font-bold text-ink sm:text-xl">Votre panier est vide</p>
            <p className="max-w-[240px] text-xs text-ink-muted leading-relaxed">
              Découvrez notre sélection de soins dermatologiques et ajoutez vos favoris.
            </p>
            <Button size="lg" className="rounded-xl font-bold px-6 shadow-xs" onClick={() => setOpen(false)} render={<Link href="/shop" />}>
              Découvrir le Shop
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-3.5 py-3 sm:px-5 sm:py-4 space-y-3.5 min-h-0">
              <FreeDeliveryBar remaining={cart.freeDeliveryRemaining} />

              <ul className="divide-y divide-border/60">
                {cart.items.map((item) => {
                  const key = `${item.productId}-${item.sizeLabel}`;
                  const justAdded = key === lastAdded;
                  return (
                    <li
                      key={key}
                      className={`flex gap-3 py-3 first:pt-0 transition-colors duration-500 ease-out sm:gap-4 ${
                        justAdded ? "bg-brand-blush/30 rounded-xl p-2" : "bg-transparent"
                      }`}
                    >
                      <Link
                        href={`/produits/${item.slug}`}
                        className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl bg-white border border-border p-1 flex items-center justify-center"
                        onClick={() => setOpen(false)}
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
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[0.625rem] font-bold tracking-[0.1em] text-primary uppercase sm:text-xs">
                              {item.brand}
                            </p>
                            <p className="mt-px text-xs font-bold text-ink line-clamp-2 leading-snug sm:text-sm">
                              {item.name}
                            </p>
                            <p className="text-[0.65rem] text-ink-muted sm:text-xs font-medium">{item.sizeLabel}</p>
                          </div>
                          <p className="font-tabular shrink-0 text-xs font-extrabold text-ink sm:text-sm">
                            {formatPrice(item.priceMillimes * item.quantity)}
                          </p>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-lg border border-border bg-white">
                            <button
                              type="button"
                              aria-label={`Diminuer la quantité de ${item.name}`}
                              onClick={() =>
                                cart.updateQuantity(item.productId, item.sizeLabel, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="flex size-8 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-30 active:scale-90 transition-transform"
                            >
                              <Minus className="size-3.5" aria-hidden />
                            </button>
                            <span className="font-tabular w-6 text-center text-xs font-bold text-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Augmenter la quantité de ${item.name}`}
                              onClick={() =>
                                cart.updateQuantity(item.productId, item.sizeLabel, item.quantity + 1)
                              }
                              className="flex size-8 items-center justify-center text-ink-muted hover:text-ink active:scale-90 transition-transform"
                            >
                              <Plus className="size-3.5" aria-hidden />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={`Retirer ${item.name} du panier`}
                            onClick={() => cart.removeItem(item.productId, item.sizeLabel)}
                            className="flex size-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Supprimer du panier"
                          >
                            <Trash2 className="size-3.5 sm:size-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom Checkout Section */}
            <div className="border-t border-border/80 px-4 py-3.5 sm:px-5 sm:py-4 bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-ink-muted font-semibold">Sous-total</p>
                <p className="font-tabular text-base sm:text-lg font-black text-primary">
                  {formatPrice(cart.subtotal)}
                </p>
              </div>
              <p className="mb-3 text-[0.65rem] text-ink-muted">
                Livraison — {cart.hasFreeDelivery ? <strong className="text-emerald-700">OFFERTE 🎉</strong> : "10 DT"} calculée à l&apos;étape suivante
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-3 shadow-md"
                  onClick={() => setOpen(false)}
                  render={<Link href="/checkout" />}
                >
                  Commander ({formatPrice(cart.subtotal)})
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl font-bold text-xs sm:text-sm py-3"
                  onClick={() => setOpen(false)}
                  render={<Link href="/panier" />}
                >
                  Voir le panier
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
