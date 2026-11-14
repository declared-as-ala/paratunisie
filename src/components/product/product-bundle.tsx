"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { formatPrice, type ProductSummary } from "@/lib/data/products";

/** "Complétez votre commande": the viewed product plus related products, added to the cart in one click. */
export function ProductBundle({ product, suggestions }: { product: ProductSummary; suggestions: ProductSummary[] }) {
  const { addItem } = useCart();
  const available = suggestions.filter((p) => p.inStock !== false && p.id !== product.id).slice(0, 3);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(available.map((p) => p.id)));
  const [done, setDone] = useState(false);

  if (available.length === 0 || product.inStock === false) return null;

  const chosen = [product, ...available.filter((p) => selected.has(p.id))];
  const total = chosen.reduce((sum, p) => sum + p.priceMillimes, 0);

  const toggle = (id: string) => {
    setDone(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addSelection = () => {
    chosen.forEach((p) => addItem(p));
    setDone(true);
  };

  const rows = [{ p: product, current: true }, ...available.map((p) => ({ p, current: false }))];

  return (
    <section aria-labelledby="bundle-title" className="mt-14 overflow-hidden rounded-3xl bg-card ring-1 ring-border-strong/60">
      <div className="px-6 py-6 text-center">
        <h2 id="bundle-title" className="font-serif text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
          Complétez votre commande
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Choisissez les produits à ajouter.</p>
      </div>
      <ul className="divide-y divide-border/60 border-t border-border/60">
        {rows.map(({ p, current }) => (
          <li key={p.id} className="flex items-center gap-4 px-5 py-3 sm:px-6">
            <input
              type="checkbox"
              checked={current || selected.has(p.id)}
              disabled={current}
              onChange={() => toggle(p.id)}
              aria-label={`Ajouter ${p.name}`}
              className="size-5 shrink-0 accent-primary disabled:opacity-60"
            />
            <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted/60 ring-1 ring-border/60">
              <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1.5" />
            </span>
            <span className="min-w-0 flex-1">
              {current && <span className="block text-[0.6875rem] font-bold uppercase tracking-wide text-ink-muted">Cet article</span>}
              <Link href={`/produits/${p.slug}`} className="block truncate text-sm font-bold text-foreground hover:text-primary">
                {p.name}
              </Link>
              <span className="block text-xs text-ink-muted">{p.category}</span>
            </span>
            <span className="shrink-0 font-tabular text-sm font-extrabold text-foreground">{formatPrice(p.priceMillimes)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-3 border-t border-border/60 px-6 py-6">
        <p className="text-sm text-ink-muted">
          Total pour {chosen.length} article{chosen.length > 1 ? "s" : ""} :{" "}
          <strong className="font-tabular text-lg text-primary">{formatPrice(total)}</strong>
        </p>
        <button
          type="button"
          onClick={addSelection}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.98] cursor-pointer"
        >
          {done ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
          {done ? "Sélection ajoutée" : "Ajouter la sélection"}
        </button>
      </div>
    </section>
  );
}
