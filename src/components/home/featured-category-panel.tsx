"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { ArrowRight, Check, Flame, Heart, ShoppingBag } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { trackAddToCart, trackEvent } from "@/lib/analytics/tracker";
import { formatPrice } from "@/lib/data/products";
import type { CheapestByCategoryEntry } from "@/lib/api/client";

/**
 * Desktop hero module "À LA UNE — Les petits prix par catégorie".
 * One real product per category (the cheapest purchasable one), chosen with accessible tabs. No autoplay: the visitor
 * stays in control. The price shown is the exact variant price the cart receives (`product.sizes` holds that single variant).
 */
export function FeaturedCategoryPanel({ entries }: { entries: CheapestByCategoryEntry[] }) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { addItem, isInCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const entry = entries[Math.min(active, entries.length - 1)];
  const product = entry.product;
  const saved = isWishlisted(product.id);
  const added = isInCart(product.id, product.size);
  const tabId = (i: number) => `${uid}-tab-${i}`;
  const panelId = `${uid}-panel`;

  const select = useCallback(
    (index: number, focus = false) => {
      const next = (index + entries.length) % entries.length;
      setActive(next);
      if (focus) tabRefs.current[next]?.focus();
      trackEvent({
        eventType: "CUSTOM",
        pageType: "home",
        productId: entries[next].product.id,
        priceMillimes: entries[next].product.priceMillimes,
        metadata: { event: "featured_category_select", category: entries[next].categorySlug, placement: "home_hero_cheapest" },
      });
    },
    [entries],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); select(active + 1, true); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); select(active - 1, true); }
    else if (event.key === "Home") { event.preventDefault(); select(0, true); }
    else if (event.key === "End") { event.preventDefault(); select(entries.length - 1, true); }
  };

  const addToCart = () => {
    addItem(product, product.size, 1); // fires the Meta Pixel AddToCart and opens the drawer
    trackAddToCart({ id: product.id, name: product.name, priceMillimes: product.priceMillimes, quantity: 1 });
    trackEvent({
      eventType: "CUSTOM",
      pageType: "home",
      productId: product.id,
      priceMillimes: product.priceMillimes,
      metadata: { event: "featured_category_add_to_cart", category: entry.categorySlug, placement: "home_hero_cheapest" },
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_70px_-40px_rgba(90,27,61,0.45)] ring-1 ring-border/60">
      <div className="flex items-center justify-between bg-secondary px-5 py-3.5 text-white">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
          <Flame size={15} className="fill-primary text-primary" aria-hidden />
          <span>À LA UNE</span>
        </div>
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/70">Les petits prix par catégorie</span>
      </div>

      {/* Category selector: scrolls sideways when there are many categories */}
      <div
        role="tablist"
        aria-label="Catégories"
        onKeyDown={onKeyDown}
        className="flex gap-1.5 overflow-x-auto border-b border-border/60 bg-primary-soft/40 px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {entries.map((e, i) => {
          const selected = i === active;
          return (
            <button
              key={e.categorySlug}
              ref={(node) => { tabRefs.current[i] = node; }}
              id={tabId(i)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={`min-h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-white text-ink-muted ring-1 ring-border/70 hover:text-primary"
              }`}
            >
              {e.categoryName}
            </button>
          );
        })}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(active)} aria-live="polite" className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div key={entry.categorySlug} className="cat-fade flex flex-1 flex-col">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-primary-soft/60 p-3 sm:p-4">
            <span className="absolute start-2.5 top-2.5 z-10 max-w-[75%] rounded-full bg-primary px-2.5 py-1 text-[0.625rem] font-bold text-white shadow-2xs">
              {entry.cheapestProven ? `Prix le plus bas en stock · ${entry.categoryName}` : `En stock · ${entry.categoryName}`}
            </span>
            <button
              type="button"
              aria-label={saved ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
              aria-pressed={saved}
              onClick={() => toggle(product.id)}
              className="absolute end-2.5 top-2.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-ink-muted shadow-2xs transition-colors hover:text-primary"
            >
              <Heart size={15} className={saved ? "fill-primary text-primary" : ""} />
            </button>
            <Link href={`/produits/${product.slug}`} aria-label={`Voir ${product.name}`} className="group relative block size-full">
              <Image
                src={product.image}
                alt={product.imageAlt || `${product.name} — ${product.brand}`}
                fill
                sizes="(max-width: 1280px) 370px, 400px"
                className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
            </Link>
          </div>

          <p className="mt-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-muted">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink">
            <Link href={`/produits/${product.slug}`} className="transition-colors hover:text-primary">
              {product.name}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {entry.displaySize ? (
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[0.6875rem] font-bold text-secondary">Format : {entry.displaySize}</span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.6875rem] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              En stock
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-tabular text-2xl font-black tracking-tight text-primary sm:text-3xl">{formatPrice(product.priceMillimes)}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/produits/${product.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-white px-3 text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Voir le produit
            </Link>
            <button
              type="button"
              onClick={addToCart}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {added ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
              <span className="truncate">{added ? "Ajouté" : "Ajouter au panier"}</span>
            </button>
          </div>
        </div>
      </div>

      <Link
        href={`/${entry.categorySlug}`}
        className="flex items-center justify-center gap-1.5 border-t border-border/70 bg-primary-soft/50 px-4 py-3.5 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
      >
        <span>Voir tous les produits : {entry.categoryName}</span>
        <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
