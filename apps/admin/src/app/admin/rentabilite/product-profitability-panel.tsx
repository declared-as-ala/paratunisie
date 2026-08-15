"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownUp } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export interface ProductProfitabilityRow {
  productId: string;
  name: string;
  brand: string;
  units: number;
  caMillimes: number;
  coutMillimes: number | null;
  gainMillimes: number | null;
  tauxMarge: number | null;
}

type SortKey = "gain" | "ca" | "units";

const DEFAULT_THRESHOLD = 20;

export function ProductProfitabilityPanel({ products }: { products: ProductProfitabilityRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("gain");
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);

  const withCost = useMemo(() => products.filter((p) => p.gainMillimes !== null), [products]);
  const withoutCost = useMemo(() => products.filter((p) => p.gainMillimes === null), [products]);

  const topProducts = useMemo(() => {
    const sorted = [...withCost];
    if (sortKey === "gain") sorted.sort((a, b) => (b.gainMillimes ?? 0) - (a.gainMillimes ?? 0));
    else if (sortKey === "ca") sorted.sort((a, b) => b.caMillimes - a.caMillimes);
    else sorted.sort((a, b) => b.units - a.units);
    return sorted.slice(0, 10);
  }, [withCost, sortKey]);

  const lowMarginProducts = useMemo(
    () => withCost.filter((p) => p.tauxMarge !== null && p.tauxMarge <= threshold).sort((a, b) => (a.tauxMarge ?? 0) - (b.tauxMarge ?? 0)),
    [withCost, threshold],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Top profitable products */}
      <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Produits les plus rentables</h2>
          <div className="inline-flex items-center gap-1 rounded-lg bg-soft-nude/70 p-0.5 border border-border/40">
            {(["gain", "ca", "units"] as SortKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSortKey(key)}
                className={`rounded-md px-2 py-1 text-[0.6875rem] font-semibold transition-all ${
                  sortKey === key ? "bg-surface-alt text-primary shadow-xs" : "text-ink-muted hover:text-ink"
                }`}
              >
                {key === "gain" ? "Gain" : key === "ca" ? "CA" : "Quantité"}
              </button>
            ))}
          </div>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-6">Aucune donnée de coût sur cette période.</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0 text-xs">
                <span className="text-[0.625rem] font-bold text-primary w-4 text-right">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink truncate">{p.name}</p>
                  <p className="text-[0.625rem] text-ink-faint">{p.brand} • {p.units} vendus</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold tabular-nums text-ink">{formatCurrency((p.gainMillimes ?? 0) / 1000)} gain</p>
                  <p className="text-[0.625rem] text-ink-faint tabular-nums">
                    {formatCurrency(p.caMillimes / 1000)} CA • {formatPercent(p.tauxMarge ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {withoutCost.length > 0 && (
          <p className="text-[0.625rem] text-ink-faint mt-3 pt-3 border-t border-border">
            {withoutCost.length} produit(s) vendu(s) sans coût d&apos;achat renseigné — exclus de ce classement.
          </p>
        )}
      </div>

      {/* Low / negative margin products */}
      <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500" />
            Marge faible / négative
          </h2>
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[0.625rem] font-bold text-rose-700">
            {lowMarginProducts.length} produit(s)
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <ArrowDownUp size={12} className="text-ink-faint" />
          <label htmlFor="margin-threshold" className="text-[0.6875rem] text-ink-muted">
            Seuil d&apos;alerte : marge de vente ≤
          </label>
          <input
            id="margin-threshold"
            type="range"
            min={-20}
            max={50}
            step={5}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-[0.6875rem] font-bold text-ink tabular-nums w-10 text-right">{threshold}%</span>
        </div>

        {lowMarginProducts.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-6">Aucun produit sous ce seuil sur cette période.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
                  <th className="py-2.5 px-3">Produit</th>
                  <th className="py-2.5 px-3 text-right">Gain</th>
                  <th className="py-2.5 px-3 text-right">Marge</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {lowMarginProducts.map((p) => {
                  const isNegative = (p.gainMillimes ?? 0) < 0;
                  return (
                    <tr key={p.productId} className="hover:bg-soft-nude/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-ink">{p.name}</p>
                        <p className="text-[0.625rem] text-ink-faint">{p.brand}</p>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${isNegative ? "text-danger" : "text-amber-600"}`}>
                        {formatCurrency((p.gainMillimes ?? 0) / 1000)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatPercent(p.tauxMarge ?? 0)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${isNegative ? "bg-danger-bg text-danger" : "bg-warning-bg text-warning"}`}>
                          {isNegative ? "Marge négative" : "Marge faible"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
