import Link from "next/link";

import { formatPrice } from "@/lib/data/products";
import { buildComparison, type ComparableProduct } from "@/lib/category/comparison";

/**
 * Live "price per 100 g" table built from the products that are in stock right now. The figures come from the real variant
 * price and the weight read from the size label or the product name; products without a readable weight are listed without a
 * per-100 g value. Rendered only inside the category guide, so it never pushes the product grid down.
 */
export function CategoryPriceComparison({ products, categoryName }: { products: ComparableProduct[]; categoryName: string }) {
  const { rows, bestSlugs } = buildComparison(products);
  // A per-100 g table only makes sense when at least two products have a readable weight (not for capsules or vitamins).
  if (rows.filter((r) => r.per100gDt !== null).length < 2) return null;
  const label = (grams: number | null) => (grams === null ? "—" : grams >= 1000 ? `${(grams / 1000).toString().replace(".", ",")} kg` : `${Math.round(grams)} g`);
  return (
    <section id="comparatif-prix" aria-labelledby="comparatif-prix-title" className="scroll-mt-28">
      <h2 id="comparatif-prix-title" className="font-serif text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
        Comparatif : {categoryName.toLowerCase()} en stock, prix au 100 g
      </h2>
      <p className="mt-2 text-sm leading-7 text-ink-muted">
        Pour comparer des formats différents, ramenez le prix à 100 g de produit. Le tableau ci-dessous est calculé à partir des prix et des poids affichés sur chaque fiche, pour les références affichées en stock sur le site. Il s&apos;agit du prix du produit, pas d&apos;une quantité de substance active.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border/80 bg-white">
        <table className="w-full text-left text-sm sm:min-w-[560px]">
          <caption className="sr-only">Comparatif des {categoryName.toLowerCase()} en stock avec prix au 100 g</caption>
          <thead className="bg-[#FAF7F5] text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-bold">Produit</th>
              <th scope="col" className="hidden px-3 py-2.5 font-bold sm:table-cell">Marque</th>
              <th scope="col" className="hidden px-3 py-2.5 font-bold sm:table-cell">Format</th>
              <th scope="col" className="px-3 py-2.5 text-right font-bold">Prix</th>
              <th scope="col" className="px-3 py-2.5 text-right font-bold">Prix / 100 g</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.slug} className={bestSlugs.includes(row.slug) ? "bg-primary-soft/40" : undefined}>
                <th scope="row" className="px-3 py-2.5 font-semibold text-ink">
                  <Link href={`/produits/${row.slug}`} className="hover:text-primary hover:underline">{row.name}</Link>
                  {bestSlugs.includes(row.slug) ? <span className="ms-2 inline-block rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-bold uppercase text-white">Prix au 100 g le plus bas</span> : null}
                  <span className="mt-0.5 block text-xs font-normal text-ink-muted sm:hidden">{row.brand} · {label(row.grams)}</span>
                </th>
                <td className="hidden px-3 py-2.5 text-ink-muted sm:table-cell">{row.brand}</td>
                <td className="hidden px-3 py-2.5 text-ink-muted sm:table-cell">{label(row.grams)}</td>
                <td className="px-3 py-2.5 text-right font-tabular font-bold text-ink">{formatPrice(row.priceMillimes)}</td>
                <td className="px-3 py-2.5 text-right font-tabular text-ink">{row.per100gDt === null ? "—" : `${row.per100gDt.toFixed(1).replace(".", ",")} DT`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-muted">Prix et stock susceptibles de changer : le prix affiché sur la fiche produit fait foi.</p>
    </section>
  );
}
