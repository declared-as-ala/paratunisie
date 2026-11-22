import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import type { CheapestByCategoryEntry } from "@/lib/api/client";

/**
 * "Les meilleurs petits prix par catégorie": one real in-stock product per main category (the lowest price among the
 * purchasable products of that category). This is also the mobile version of the hero module, which is desktop-only.
 * The card price and the add-to-cart price come from the same single variant (see fetchCheapestByCategory).
 */
export function HomeCheapestGrid({ entries }: { entries: CheapestByCategoryEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="home-cheapest" className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-primary" />
        <h2 id="home-cheapest" className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Les meilleurs <span className="italic text-primary">petits prix</span> par catégorie
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Pour chaque catégorie, le produit en stock au prix le plus bas. Les formats varient d&apos;un produit à l&apos;autre : vérifiez la taille avant de comparer.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {entries.map((entry) => (
            <li key={entry.categorySlug} className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <Link href={`/${entry.categorySlug}`} className="min-w-0 text-[0.6875rem] font-extrabold uppercase leading-tight tracking-[0.08em] text-secondary hover:text-primary">
                  {entry.categoryName}
                </Link>
                {entry.displaySize ? (
                  <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[0.625rem] font-bold text-secondary">{entry.displaySize}</span>
                ) : null}
              </div>
              <ProductCard product={entry.product} highlight={entry.cheapestProven ? "Prix le plus bas" : undefined} />
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary">
            Voir toute la boutique <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
