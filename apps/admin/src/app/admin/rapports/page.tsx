"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Percent,
  Info,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { apiClient, ApiError } from "@/lib/api-client";

type Period = "today" | "7d" | "30d" | "3mo" | "12mo";

interface DashboardOverview {
  kpis: {
    caMillimes: number;
    orderCount: number;
    panierMoyenMillimes: number;
    margeBruteEstimeeMillimes: number;
    marginCoverage: number | null;
    tauxConfirmation: number;
    tauxLivraison: number;
    tauxAnnulation: number;
    tauxRetour: number;
  };
  funnel: { label: string; count: number; pct: number }[];
  topProducts: { productId: string; name: string; brand: string; units: number; revenueMillimes: number; margeMillimes: number | null }[];
  alerts: { type: "danger" | "warning" | "info"; message: string; link: string }[];
}

const PERIOD_LABEL: Record<Period, string> = {
  today: "Aujourd'hui",
  "7d": "Semaine",
  "30d": "Mois",
  "3mo": "Trimestre",
  "12mo": "Année",
};

export default function RapportsPage() {
  const [period, setPeriod] = useState<Period>("today");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (p: Period) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.get<DashboardOverview>(`/reporting/dashboard/overview?period=${p}`);
      setOverview(data);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger les rapports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  const productsByMargin = useMemo(() => {
    if (!overview) return [];
    return [...overview.topProducts]
      .filter((p) => p.margeMillimes !== null)
      .map((p) => ({ ...p, tauxMarque: (p.margeMillimes! / p.revenueMillimes) * 100 }))
      .sort((a, b) => a.tauxMarque - b.tauxMarque)
      .slice(0, 5);
  }, [overview]);

  const funnel = overview?.funnel ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink">Rapports & Rentabilité Commerciale</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              Analyses Financières
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {loadError ?? "Suivi des marges brutes, taux de marque et performances des ventes COD"}
          </p>
        </div>

        <div className="inline-flex items-center rounded-xl bg-surface-alt border border-border p-1 shadow-2xs flex-wrap">
          {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                period === p ? "bg-primary text-white shadow-xs" : "text-ink-muted hover:text-ink"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Chiffre d&apos;Affaires</span>
            <TrendingUp size={16} className="text-primary" />
          </div>
          <p className="text-xl font-extrabold text-ink mt-1 tabular-nums">{formatCurrency((overview?.kpis.caMillimes ?? 0) / 1000)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Commandes</span>
            <ShoppingCart size={16} className="text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-ink mt-1 tabular-nums">{overview?.kpis.orderCount ?? 0}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-emerald-700 uppercase tracking-wider">Panier Moyen</span>
            <Target size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-1 tabular-nums">{formatCurrency((overview?.kpis.panierMoyenMillimes ?? 0) / 1000)}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-primary uppercase tracking-wider">Marge Brute</span>
            <Percent size={16} className="text-primary" />
          </div>
          <p className="text-xl font-extrabold text-primary mt-1 tabular-nums">{formatCurrency((overview?.kpis.margeBruteEstimeeMillimes ?? 0) / 1000)}</p>
          {overview?.kpis.marginCoverage != null && overview.kpis.marginCoverage < 1 && (
            <p className="text-[0.625rem] text-ink-faint mt-1">estimée sur {Math.round(overview.kpis.marginCoverage * 100)}% des lignes</p>
          )}
        </div>
      </div>

      {/* Operational Stream */}
      <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <span>Alertes Financières & Opérationnelles</span>
        </h2>
        {!loading && (overview?.alerts.length ?? 0) === 0 && (
          <p className="text-xs text-ink-faint text-center py-3">Aucune alerte pour cette période.</p>
        )}
        {overview?.alerts.map((alert, i) => (
          <div key={i} className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl border ${
            alert.type === "danger" ? "bg-rose-500/5 border-rose-500/20 text-rose-700" :
            alert.type === "warning" ? "bg-amber-500/5 border-amber-500/20 text-amber-700" :
            "bg-blue-500/5 border-blue-500/20 text-blue-700"
          }`}>
            <div className="flex items-center gap-2.5">
              {alert.type === "danger" && <AlertTriangle size={13} className="text-rose-600" />}
              {alert.type === "warning" && <Clock size={13} className="text-amber-600" />}
              {alert.type === "info" && <Info size={13} className="text-blue-600" />}
              <span className="text-xs font-semibold text-ink">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order funnel */}
        <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-primary" />
            <span>Entonnoir de Conversion COD</span>
          </h2>
          <div className="space-y-3">
            {funnel.map((step, i) => (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted font-medium">{step.label}</span>
                  <span className="font-bold text-ink tabular-nums">{step.count} ({formatPercent(step.pct)})</span>
                </div>
                <div className="h-2 bg-soft-nude rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${step.pct}%` }} />
                </div>
                {i < funnel.length - 1 && funnel[i].count > 0 && (
                  <p className="text-[0.625rem] text-ink-faint">
                    Rétention : {Math.round((funnel[i + 1].count / funnel[i].count) * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-[0.625rem] text-ink-faint uppercase font-semibold">Taux confirmation</p>
              <p className="text-sm font-extrabold tabular-nums text-emerald-600">{formatPercent(overview?.kpis.tauxConfirmation ?? 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-[0.625rem] text-ink-faint uppercase font-semibold">Taux livraison</p>
              <p className="text-sm font-extrabold tabular-nums text-emerald-600">{formatPercent(overview?.kpis.tauxLivraison ?? 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-[0.625rem] text-ink-faint uppercase font-semibold">Taux annulation</p>
              <p className="text-sm font-extrabold tabular-nums text-rose-600">{formatPercent(overview?.kpis.tauxAnnulation ?? 0)}</p>
            </div>
            <div className="text-center">
              <p className="text-[0.625rem] text-ink-faint uppercase font-semibold">Taux retour</p>
              <p className="text-sm font-extrabold tabular-nums text-amber-600">{formatPercent(overview?.kpis.tauxRetour ?? 0)}</p>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">Top Produits par Chiffre d&apos;Affaires</h2>
          <div className="space-y-2">
            {(overview?.topProducts.length ?? 0) === 0 && (
              <p className="text-xs text-ink-faint text-center py-3">Aucune vente sur cette période.</p>
            )}
            {overview?.topProducts.map((p, i) => {
              const tauxMarque = p.margeMillimes !== null ? (p.margeMillimes / p.revenueMillimes) * 100 : null;
              return (
                <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0 text-xs">
                  <span className="text-[0.625rem] font-bold text-primary w-4 text-right">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink truncate">{p.name}</p>
                    <p className="text-[0.625rem] text-ink-faint">{p.brand} • {p.units} unités</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold tabular-nums text-ink">{formatCurrency(p.revenueMillimes / 1000)}</p>
                    <p className={`text-[0.625rem] font-semibold tabular-nums ${tauxMarque === null ? "text-ink-faint" : tauxMarque >= 35 ? "text-emerald-600" : "text-amber-600"}`}>
                      {tauxMarque === null ? "coût inconnu" : `${formatPercent(tauxMarque)} marque`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low margin products */}
      <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">Vigilance : Marge Faible Parmi les Meilleures Ventes</h2>
        <p className="text-[0.6875rem] text-ink-faint mb-3">Basé sur le top 8 des ventes par chiffre d&apos;affaires de la période — pas un scan complet du catalogue.</p>
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Marque</th>
                <th className="py-3 px-4 text-right">Chiffre d&apos;Affaires</th>
                <th className="py-3 px-4 text-right">Marge Brute</th>
                <th className="py-3 px-4 text-right">Taux de Marque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {productsByMargin.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-ink-faint font-semibold">
                    Pas assez de données de coût pour cette période.
                  </td>
                </tr>
              )}
              {productsByMargin.map((p) => (
                <tr key={p.productId} className="hover:bg-soft-nude/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-ink">{p.name}</td>
                  <td className="py-3 px-4 text-ink-muted">{p.brand}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{formatCurrency(p.revenueMillimes / 1000)}</td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums text-primary">{formatCurrency((p.margeMillimes ?? 0) / 1000)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-bold tabular-nums ${p.tauxMarque < 35 ? "text-amber-600" : "text-emerald-600"}`}>
                      {formatPercent(p.tauxMarque)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
