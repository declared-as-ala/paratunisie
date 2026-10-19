"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag, Zap } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { closeCartDrawer } from "@/hooks/use-cart-drawer";
import { trackAddToCart, trackEvent } from "@/lib/analytics/tracker";
import type { ProductSummary } from "@/lib/data/products";

type Action = "impression" | "product_click" | "secondary_click" | "add_to_cart" | "buy_now";

function track(action: Action, product: ProductSummary) {
  trackEvent({
    eventType: "CUSTOM",
    pageType: "home",
    productId: product.id,
    priceMillimes: product.priceMillimes,
    metadata: { event: `featured_product_${action}`, productSlug: product.slug, placement: "home_hero" },
  });
}

/** Fires the impression once, when at least half of the hero is actually visible. */
export function FeaturedImpression({ product, children }: { product: ProductSummary; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track("impression", product);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [product]);
  return <div ref={ref}>{children}</div>;
}

export function FeaturedActions({ product, buyLabel, compact = false }: { product: ProductSummary; buyLabel?: string | null; compact?: boolean }) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const [busy, setBusy] = useState(false);
  const added = isInCart(product.id, product.size);

  const add = (openDrawer: boolean) => {
    addItem(product, product.size, 1); // also fires the Meta Pixel AddToCart and opens the drawer
    if (!openDrawer) closeCartDrawer();
    trackAddToCart({ id: product.id, name: product.name, priceMillimes: product.priceMillimes, quantity: 1 });
  };

  return (
    <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-2.5 sm:flex-row sm:items-center"}>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          track("buy_now", product);
          add(false);
          router.push("/checkout");
        }}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70 ${compact ? "h-11 px-4 text-sm" : "h-13 px-7 text-[0.9375rem] shadow-[0_10px_28px_-10px_rgba(123,47,82,0.7)] sm:h-14"}`}
      >
        <Zap className="size-[18px]" aria-hidden />
        {buyLabel || "Acheter maintenant"}
      </button>
      <button
        type="button"
        onClick={() => {
          track("add_to_cart", product);
          add(true);
        }}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border font-bold transition-all active:scale-[0.98] ${compact ? "h-11 px-4 text-sm" : "h-13 px-6 text-[0.9375rem] sm:h-14"} ${
          added
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-primary/30 bg-white text-primary hover:border-primary hover:bg-primary-soft/30"
        }`}
      >
        {added ? <Check className="size-[18px]" aria-hidden /> : <ShoppingBag className="size-[18px]" aria-hidden />}
        {added ? (compact ? "Ajouté" : "Ajouté — en ajouter un autre") : "Ajouter au panier"}
      </button>
    </div>
  );
}

export function TrackedLink({
  href,
  product,
  action,
  className,
  children,
  ...rest
}: {
  href: string;
  product: ProductSummary;
  action: "product_click" | "secondary_click";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={className} onClick={() => track(action, product)} {...rest}>
      {children}
    </Link>
  );
}
