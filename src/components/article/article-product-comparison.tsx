import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Star, Sparkles } from "lucide-react";
import { getProductBySlug, formatPrice, type ProductSummary } from "@/lib/data/products";

interface ComparisonItem {
  slug: string;
  badge?: string;
  format?: string;
  servingCount?: number;
  highlight?: string;
}

interface ArticleProductComparisonProps {
  title?: string;
  description?: string;
  items: (string | ComparisonItem)[];
}

export function ArticleProductComparison({
  title = "Tableau Comparatif des Produits Disponibles",
  description = "Comparatif en temps réel basé sur les stocks et tarifs actuels en Tunisie :",
  items,
}: ArticleProductComparisonProps) {
  const normalizedItems: ComparisonItem[] = items.map((it) =>
    typeof it === "string" ? { slug: it } : it,
  );

  const productData = normalizedItems
    .map((item) => {
      const product = getProductBySlug(item.slug);
      if (!product) return null;
      return { item, product };
    })
    .filter((entry): entry is { item: ComparisonItem; product: ProductSummary } => entry !== null);

  if (productData.length === 0) return null;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
      <div className="border-b border-border/60 bg-soft-nude/30 px-5 py-4">
        <h4 className="font-serif text-base font-bold text-ink sm:text-lg flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          {title}
        </h4>
        {description && <p className="mt-1 text-xs text-ink-muted">{description}</p>}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-ink">
          <thead className="bg-surface-alt/70 text-[11px] font-bold uppercase tracking-wider text-ink-muted border-b border-border/60">
            <tr>
              <th className="py-3 px-4">Produit</th>
              <th className="py-3 px-4">Marque</th>
              <th className="py-3 px-4">Format</th>
              <th className="py-3 px-4">Prix Actuel</th>
              <th className="py-3 px-4">Points Clés</th>
              <th className="py-3 px-4">Disponibilité</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {productData.map(({ item, product }, idx) => {
              const inStock = product.inStock !== false;
              const formatLabel = item.format || product.size || "Standard";

              return (
                <tr key={product.id || idx} className="hover:bg-soft-nude/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <div className="relative size-12 shrink-0 rounded-lg border border-border bg-white overflow-hidden p-1">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                      ) : null}
                      <div>
                        {item.badge && (
                          <span className="inline-block rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                            {item.badge}
                          </span>
                        )}
                        <Link
                          href={`/produits/${product.slug}`}
                          className="font-bold text-ink hover:text-primary transition-colors block line-clamp-1"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-primary">{product.brand}</td>
                  <td className="py-3.5 px-4 font-tabular font-medium">{formatLabel}</td>
                  <td className="py-3.5 px-4 font-tabular font-bold text-ink text-sm">
                    {formatPrice(product.priceMillimes)}
                  </td>
                  <td className="py-3.5 px-4 text-ink-muted text-[11px] max-w-[200px] line-clamp-2">
                    {item.highlight || product.benefit || "Formule originale certifiée"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        inStock ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {inStock ? (
                        <>
                          <Check className="size-3" /> En stock
                        </>
                      ) : (
                        "Sur commande"
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/produits/${product.slug}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      Voir
                      <ArrowRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="block md:hidden divide-y divide-border/60 p-4 space-y-4">
        {productData.map(({ item, product }, idx) => {
          const inStock = product.inStock !== false;
          return (
            <div key={product.id || idx} className="pt-4 first:pt-0">
              <div className="flex gap-3">
                {product.image && (
                  <div className="relative size-16 shrink-0 rounded-lg border border-border bg-white p-1">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {product.brand}
                    </span>
                    {item.badge && (
                      <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/produits/${product.slug}`}
                    className="font-bold text-xs text-ink hover:text-primary line-clamp-1 mt-0.5 block"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Format : <strong>{item.format || product.size || "Standard"}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                <div>
                  <span className="font-tabular font-extrabold text-sm text-ink">
                    {formatPrice(product.priceMillimes)}
                  </span>
                  <span
                    className={`ml-2 text-[10px] font-semibold ${
                      inStock ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {inStock ? "En stock" : "Sur commande"}
                  </span>
                </div>
                <Link
                  href={`/produits/${product.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Voir le produit
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
