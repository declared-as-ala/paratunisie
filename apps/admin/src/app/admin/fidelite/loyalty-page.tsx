"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  History,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Coins,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";

type LoyaltyStats = {
  pointsPerTnd: number;
  pointValueTnd: number;
  totalAccounts: number;
  totalOutstandingPoints: number;
  totalLiabilityTnd: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  topCustomers: {
    userId: string;
    userName: string;
    userEmail: string;
    points: number;
    tier: string;
    valueTnd: string;
  }[];
  recentTransactions: {
    id: string;
    points: number;
    type: string;
    description: string | null;
    createdAt: string;
    orderId?: string | null;
  }[];
};

export function LoyaltyPage() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.get<LoyaltyStats>("/loyalty/admin/stats");
      setStats(data);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les statistiques du programme fidélité.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Programme Fidélité</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gestion, statistiques et historique des points attribués et utilisés.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Rules Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-800">
              <Gift className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Règles actives</p>
              <p className="text-sm font-extrabold text-ink mt-0.5">
                1 TND dépensé = 1 point · 20 points = 1 TND de réduction (1 pt = 0.05 TND)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
            <ShieldCheck className="size-4 text-emerald-600" />
            Attribution automatique sur commande livrée
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Points en circulation</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Coins className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-ink font-tabular">
            {stats?.totalOutstandingPoints?.toLocaleString("fr-FR") ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Sur {stats?.totalAccounts ?? 0} comptes clients</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Passif financier (DT)</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-ink font-tabular">
            {stats?.totalLiabilityTnd ? stats.totalLiabilityTnd.toFixed(3) : "0.000"} DT
          </p>
          <p className="mt-1 text-xs text-ink-muted">Valeur de réduction potentielle</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Total points émis</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-ink font-tabular">
            {stats?.totalPointsIssued?.toLocaleString("fr-FR") ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Cumul historique</p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted">Points utilisés</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <TrendingDown className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-ink font-tabular">
            {stats?.totalPointsRedeemed?.toLocaleString("fr-FR") ?? 0}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Convertis en réductions</p>
        </div>
      </div>

      {/* Grid: Top Customers + Recent Ledger */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-ink-muted" />
              <h2 className="text-base font-bold text-ink">Top soldes clients</h2>
            </div>
            <span className="text-xs font-semibold text-ink-muted">10 premiers</span>
          </div>

          {!stats?.topCustomers || stats.topCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              Aucun solde de points pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {stats.topCustomers.map((cust, idx) => (
                <div key={cust.userId} className="flex items-center justify-between py-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-ink-muted">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{cust.userName}</p>
                      <p className="text-[11px] text-ink-muted">{cust.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-ink font-tabular">{cust.points} pts</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">{cust.valueTnd} DT</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="size-4 text-ink-muted" />
              <h2 className="text-base font-bold text-ink">Journal des transactions</h2>
            </div>
            <span className="text-xs font-semibold text-ink-muted">Dernières opérations</span>
          </div>

          {!stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              Aucune transaction enregistrée.
            </div>
          ) : (
            <div className="divide-y divide-border/60 max-h-[420px] overflow-y-auto pr-1">
              {stats.recentTransactions.map((tx) => {
                const isPositive = tx.points > 0;
                return (
                  <div key={tx.id} className="flex items-center justify-between py-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex size-7 items-center justify-center rounded-lg ${
                          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                      </span>
                      <div>
                        <p className="font-medium text-ink line-clamp-1">{tx.description || tx.type}</p>
                        <p className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                          <Clock className="size-2.5" />
                          {new Intl.DateTimeFormat("fr-TN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(tx.createdAt))}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold font-tabular text-xs ${
                        isPositive ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isPositive ? `+${tx.points}` : tx.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
