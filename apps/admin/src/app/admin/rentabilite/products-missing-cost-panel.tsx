"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface ProductMissingCostRow {
  productId: string;
  name: string;
  sku: string | null;
  sellingPriceMillimes: number;
  units: number;
  revenueMillimes: number;
}

// REQUIREMENTS.md §19 — a real, working action beats another warning banner.
// Links to /admin/achats: the only UI path that actually persists a purchase
// cost (goods receipt → PurchasePriceHistory). The product edit drawer's
// "Prix d'achat" field is local-only and never saves anywhere, so wiring this
// action there would look like it works while silently doing nothing.
export function ProductsMissingCostPanel({ products }: { products: ProductMissingCostRow[] }) {
  return (
    <div className="rounded-2xl border border-warning-bg bg-warning-bg/40 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-ink flex items-center gap-2">
          <AlertCircle size={15} className="text-warning" />
          Produits sans coût d&apos;achat
        </h2>
        <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[0.625rem] font-bold text-warning">
          {products.length} produit{products.length > 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-[0.6875rem] text-ink-faint mb-3">
        Ces ventes sont exclues du gain estimé tant qu&apos;aucun coût d&apos;achat n&apos;est renseigné.
      </p>

      <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface-alt">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
              <th className="py-2.5 px-3">Produit</th>
              <th className="py-2.5 px-3 text-right">Prix de vente</th>
              <th className="py-2.5 px-3 text-right">Unités confirmées</th>
              <th className="py-2.5 px-3 text-right">CA concerné</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {products.map((p) => (
              <tr key={p.productId} className="hover:bg-soft-nude/30 transition-colors">
                <td className="py-2.5 px-3">
                  <p className="font-bold text-ink">{p.name}</p>
                  {p.sku && <p className="text-[0.625rem] text-ink-faint font-mono">{p.sku}</p>}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(p.sellingPriceMillimes / 1000)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{p.units}</td>
                <td className="py-2.5 px-3 text-right font-bold tabular-nums text-warning">{formatCurrency(p.revenueMillimes / 1000)}</td>
                <td className="py-2.5 px-3 text-right">
                  <Link href="/admin/achats" className="text-[0.6875rem] font-bold text-primary hover:underline">
                    Renseigner le coût
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
