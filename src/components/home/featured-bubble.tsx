"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { formatPrice } from "@/lib/data/products";
import type { FeaturedProduct } from "@/lib/api/client";
import { FeaturedActions, FeaturedImpression } from "@/components/home/featured-product-actions";

const DISMISS_KEY = "pt-featured-bubble-hidden";

/**
 * Mobile-only floating bubble (like a chat head): a small round product photo that opens a compact card.
 * It never auto-opens and can be hidden for the session. No fake badges or counters.
 */
export function FeaturedBubble({ featured }: { featured: FeaturedProduct }) {
  const { product, config } = featured;
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true); // hidden until we know it was not dismissed (avoids a flash)

  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (hidden) return null;
  const inStock = product.inStock !== false;
  const title = config.headline || product.name;

  const hide = () => {
    setOpen(false);
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  return (
    <div className="fixed end-3 z-30 flex flex-col items-end gap-2 lg:hidden" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom) + 0.5rem)" }}>
      {open && (
        <div role="dialog" aria-label={`${product.name} — offre à la une`} className="w-[min(18.5rem,calc(100vw-1.5rem))] origin-bottom-right overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_18px_44px_-14px_rgba(43,35,38,0.45)] animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none">
          <div className="flex items-start gap-3 p-3">
            <Link href={`/produits/${product.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#FBF8F6] to-[#F5EEEA]" aria-label={`Voir ${product.name}`}>
              <Image src={product.image} alt="" fill sizes="80px" className="object-contain p-1.5 mix-blend-multiply" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.625rem] font-bold uppercase tracking-[0.12em] text-primary/90">{product.brand}</p>
              <Link href={`/produits/${product.slug}`} className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-ink">{title}</Link>
              <p className="mt-1 font-tabular text-lg font-extrabold leading-none text-ink">{formatPrice(product.priceMillimes)}</p>
              <p className={`mt-1 text-[0.6875rem] font-semibold ${inStock ? "text-emerald-700" : "text-amber-700"}`}>{inStock ? "● En stock" : "Indisponible"}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="-me-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-soft-nude">
              <X size={16} />
            </button>
          </div>
          <div className="px-3 pb-3">
            {inStock ? (
              <FeaturedActions product={product} buyLabel={config.ctaLabel} compact />
            ) : (
              <Link href={`/produits/${product.slug}`} className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">Voir le produit</Link>
            )}
            <button type="button" onClick={hide} className="mt-2 w-full text-center text-[0.6875rem] font-medium text-ink-muted underline-offset-2 hover:underline">
              Masquer
            </button>
          </div>
        </div>
      )}

      <FeaturedImpression product={product}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Fermer l'offre à la une" : `Offre à la une : ${product.name}, ${formatPrice(product.priceMillimes)}`}
          className="relative flex size-14 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-6px_rgba(43,35,38,0.5)] ring-2 ring-primary transition-transform active:scale-90"
        >
          <span className="relative size-11 overflow-hidden rounded-full bg-[#F8F3F0]">
            <Image src={product.image} alt="" fill sizes="44px" className="object-contain p-1 mix-blend-multiply" />
          </span>
        </button>
      </FeaturedImpression>
    </div>
  );
}
