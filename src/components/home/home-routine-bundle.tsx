"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Sparkles, Sliders, ArrowRight } from "lucide-react";
import { products, formatPrice } from "@/lib/data/products";
import { useCart } from "@/hooks/use-cart";

const ROUTINE_STEPS = [
  { step: 1, name: "1. Nettoyage", role: "Prépare la peau", product: products[1] }, // Sensibio H2O
  { step: 2, name: "2. Traitement", role: "Sérum ciblé", product: products[3] }, // Vitamine C Vichy
  { step: 3, name: "3. Hydratation", role: "Renforce la barrière", product: products[2] }, // CeraVe
  { step: 4, name: "4. Protection", role: "Écran SPF50+", product: products[0] }, // Anthelios
];

export function HomeRoutineBundle() {
  const { addItem } = useCart();
  const [addedAll, setAddedAll] = useState(false);

  const totalMillimes = ROUTINE_STEPS.reduce((sum, step) => sum + step.product.priceMillimes, 0);

  const handleAddAll = useCallback(() => {
    ROUTINE_STEPS.forEach((step) => {
      addItem(step.product);
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 3000);
  }, [addItem]);

  return (
    <section className="bg-gradient-to-br from-primary/5 via-soft-nude/40 to-brand-champagne/10 py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-surface-alt/90 p-6 sm:p-10 lg:p-12 shadow-sm">
          {/* Bundle Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-border/60 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Sparkles size={13} />
                  Routine recommandée • 4 produits
                </span>
              </div>
              <h2 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:text-4xl">
                Routine Éclat & Protection
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted max-w-xl leading-relaxed">
                Quatre soins dermatologiques complémentaires conçus pour nettoyer, traiter, hydrater et protéger votre peau au quotidien.
              </p>
            </div>

            {/* Price & Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-border/80 shrink-0 shadow-xs">
              <div className="pr-4 border-r-0 sm:border-r border-border/60">
                <p className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Prix de la routine (4 soins)</p>
                <p className="text-2xl font-extrabold text-primary font-tabular">
                  {formatPrice(totalMillimes)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-primary-hover transition-all shadow-sm active:scale-[0.98]"
                >
                  {addedAll ? <Check size={16} /> : <ShoppingBag size={16} />}
                  {addedAll ? "Routine ajoutée !" : "Ajouter toute la routine"}
                </button>
              </div>
            </div>
          </div>

          {/* 4 Routine Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROUTINE_STEPS.map((step) => (
              <div
                key={step.step}
                className="flex flex-col rounded-2xl border border-border bg-white p-4 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-primary">
                    Étape {step.step}
                  </span>
                  <span className="text-[0.625rem] font-semibold text-ink-faint">{step.role}</span>
                </div>

                <div className="relative aspect-square w-full rounded-xl bg-soft-nude overflow-hidden mb-3">
                  <Image
                    src={step.product.image}
                    alt={step.product.name}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>

                <p className="text-[0.6875rem] font-semibold text-primary uppercase">{step.product.brand}</p>
                <h4 className="text-xs font-bold text-ink line-clamp-1 mt-0.5">{step.product.name}</h4>
                <p className="text-[0.625rem] text-ink-muted line-clamp-1 mt-0.5">{step.product.benefit}</p>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
                  <span className="text-xs font-extrabold text-ink font-tabular">
                    {formatPrice(step.product.priceMillimes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(step.product)}
                    className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                  >
                    Ajouter <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
