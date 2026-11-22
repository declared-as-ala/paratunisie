import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { formatPrice, type ProductSummary } from "@/lib/data/products";

function Row({ p, reference }: { p: ProductSummary; reference?: boolean }) {
  return (
    <tr className={reference ? "bg-primary-soft/40" : "border-t border-border/60"}>
      <td className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-4">
          <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-card ring-1 ring-border/60">
            <Image src={p.image} alt="" fill sizes="64px" className="object-contain p-1.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold leading-snug text-foreground">{p.name}</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {p.brand}
              {p.size ? ` · ${p.size}` : ""}
            </p>
            {reference && <p className="mt-1 text-xs font-bold text-primary">Produit consulté</p>}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
        <span className="font-tabular text-base font-extrabold text-primary">{formatPrice(p.priceMillimes)}</span>
      </td>
      <td className="px-4 py-4 sm:px-5"><div className="flex flex-col items-end gap-2">
        {p.inStock === false ? (
          <span className="text-xs font-semibold text-amber-700">Sur commande</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Check className="size-3.5" aria-hidden /> En stock
          </span>
        )}
        {!reference && (
          <Link
            href={`/produits/${p.slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Voir le produit <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        )}
        </div>
      </td>
    </tr>
  );
}

/** Comparison of the viewed product with similar products of the same category (price and availability only: the catalogue has no nutrition data). */
export function ProductCompare({ product, similar }: { product: ProductSummary; similar: ProductSummary[] }) {
  if (similar.length === 0) return null;

  return (
    <section aria-labelledby="compare-title" className="mt-14">
      <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
        <span aria-hidden className="h-px w-6 bg-primary" /> Comparatif
      </p>
      <h2 id="compare-title" className="mt-2 font-serif text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl">
        Comparer avec des produits similaires
      </h2>
      <div className="mt-5 overflow-x-auto rounded-3xl bg-card ring-1 ring-border-strong/60">
        <table className="w-full min-w-[560px] text-start">
          <thead>
            <tr className="bg-muted/70 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
              <th scope="col" className="px-4 py-3 text-start sm:px-5">Produit</th>
              <th scope="col" className="px-4 py-3 text-start sm:px-5">Prix</th>
              <th scope="col" className="px-4 py-3 text-end sm:px-5">Choisir</th>
            </tr>
          </thead>
          <tbody>
            <Row p={product} reference />
            {similar.map((p) => (
              <Row key={p.id} p={p} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
