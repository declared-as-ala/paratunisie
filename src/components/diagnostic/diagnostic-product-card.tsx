"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export interface DiagnosticProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  categoryName?: string;
  priceMillimes: number;
  priceDT: string;
  image: string;
  inStock: boolean;
  description?: string;
  reason?: string;
}

interface DiagnosticProductCardProps {
  product: DiagnosticProduct;
  onSelectAction?: (actionText: string) => void;
}

export function DiagnosticProductCard({ product, onSelectAction }: DiagnosticProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [showReason, setShowReason] = useState(true);

  const [imgSrc, setImgSrc] = useState(() => {
    const raw = product.image;
    if (!raw) return "/assets/placeholder-product.webp";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/assets/")) return raw;
    // Static uploads are served from the API's origin root, not under
    // /api/v1 — matches resolveImageUrl() in src/lib/api/client.ts.
    const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/api\/v\d+\/?$/, "");
    return `${apiOrigin}${raw.startsWith("/") ? "" : "/"}${raw}`;
  });

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brandName || "",
      benefit: product.description || "",
      size: "",
      priceMillimes: product.priceMillimes,
      category: product.categoryName || "",
      concerns: [],
      skinTypes: [],
      image: imgSrc,
      description: product.description || "",
      benefits: [],
      usage: "",
      sizes: [],
      routineTime: ["AM", "PM"],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-white p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex gap-4">
        {/* Product Image — plain <img> (matches ProductCard), not next/image:
            a chat-recommended product's host isn't guaranteed to be in
            next.config.ts remotePatterns, and next/image throws hard on an
            unlisted host instead of falling back gracefully like onError does. */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-soft-nude/40 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={product.name}
            className="max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgSrc("/assets/placeholder-product.webp")}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span className="font-semibold text-primary/80 uppercase tracking-wider">{product.brandName}</span>
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.6875rem] font-medium text-emerald-700">
                  En stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[0.6875rem] font-medium text-amber-700">
                  Sur commande
                </span>
              )}
            </div>

            <Link href={`/produits/${product.slug}`} className="mt-1 block font-medium text-sm text-ink line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </Link>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-serif text-base font-bold text-primary">{product.priceDT}</span>

            <button
              onClick={handleAddToCart}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-sm"
              }`}
            >
              {added ? (
                <>
                  <Check className="size-3.5" />
                  Ajouté
                </>
              ) : (
                <>
                  <ShoppingBag className="size-3.5" />
                  Ajouter au panier
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Why This Product / Reason */}
      {product.reason && (
        <div className="mt-3 border-t border-border/40 pt-2 text-xs">
          <button
            onClick={() => setShowReason(!showReason)}
            className="flex items-center gap-1 font-semibold text-primary/90 hover:text-primary transition-colors"
          >
            <Sparkles className="size-3.5 text-brand-gold" />
            <span>Pourquoi ce soin ?</span>
            {showReason ? <ChevronUp className="size-3 text-ink-muted" /> : <ChevronDown className="size-3 text-ink-muted" />}
          </button>
          {showReason && <p className="mt-1 text-ink-muted leading-relaxed pl-4 border-l-2 border-brand-champagne/50">{product.reason}</p>}
        </div>
      )}

      {/* Quick Action Chips */}
      {onSelectAction && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/30 pt-2 text-[0.75rem]">
          <button
            onClick={() => onSelectAction(`Je souhaite une alternative à ${product.name}`)}
            className="rounded-full border border-border px-2.5 py-1 font-medium text-ink-muted hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
          >
            Une alternative
          </button>
          <button
            onClick={() => onSelectAction(`Propose-moi une option moins chère que ${product.name}`)}
            className="rounded-full border border-border px-2.5 py-1 font-medium text-ink-muted hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
          >
            Moins cher
          </button>
        </div>
      )}
    </div>
  );
}
