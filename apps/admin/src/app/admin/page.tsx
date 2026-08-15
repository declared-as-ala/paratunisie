"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Truck,
  Users,
  RotateCcw,
  RefreshCw,
  Plus,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/sparkline";
import { DashboardChart, type DashboardChartDataPoint } from "@/components/dashboard-chart";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { onOrdersChanged } from "@/lib/order-events";

/* ─── API response shapes (apps/api/src/reporting) ─────────────────────── */

type DashboardPeriod = "today" | "7d" | "30d";

interface DashboardOverview {
  period: string;
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
  statusCounts: Record<string, number>;
  funnel: { label: string; count: number; pct: number }[];
  salesChart: { date: string; caMillimes: number; margeMillimes: number; orderCount: number }[];
  topProducts: { productId: string; name: string; brand: string; units: number; revenueMillimes: number; margeMillimes: number | null }[];
  customerKpis: { newCustomers: number; returningCustomers: number; repeatRate: number };
  alerts: { type: "danger" | "warning" | "info"; message: string; link: string }[];
}

interface ApiOrder {
  id: string;
  createdAt: string;
  gouvernorat: string;
  totalMillimes: number;
  status: string;
  user?: { name?: string };
  items?: { quantity?: number }[];
}

interface ProfitabilitySummary {
  kpis: { caConfirmeeMillimes: number; gainEstimeMillimes: number | null; tauxMarge: number | null };
}

interface RecentOrderRow {
  id: string;
  customer: string;
  initials: string;
  city: string;
  total: string;
  itemsCount: number;
  status: string;
  time: string;
}

/* ─── Status Badge Helper ──────────────────────────────────────────────── */

const statusBadgeMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  EN_ATTENTE: { label: "En attente", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-700", dot: "bg-amber-500" },
  TENTATIVE_CONTACT: { label: "À confirmer", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-700", dot: "bg-blue-500" },
  CONFIRMEE: { label: "Confirmée", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-700", dot: "bg-emerald-500" },
  PREPARATION: { label: "Préparation", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-700", dot: "bg-indigo-500" },
  PRETE_EXPEDITION: { label: "Prête", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-700", dot: "bg-indigo-500" },
  EXPEDIEE: { label: "Expédiée", bg: "bg-sky-500/10 border-sky-500/30", text: "text-sky-700", dot: "bg-sky-500" },
  LIVREE: { label: "Livrée", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-700", dot: "bg-emerald-500" },
  ECHEC_LIVRAISON: { label: "Échec livraison", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700", dot: "bg-rose-500" },
  RETOURNEE: { label: "Retournée", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700", dot: "bg-rose-500" },
  ANNULEE: { label: "Annulée", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700", dot: "bg-rose-500" },
  REFUSEE: { label: "Refusée", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700", dot: "bg-rose-500" },
};

function StatusPill({ status }: { status: string }) {
  const s = statusBadgeMap[status] ?? { label: status, bg: "bg-slate-500/10 border-slate-500/30", text: "text-slate-700", dot: "bg-slate-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold border ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} pulse-dot`} />
      {s.label}
    </span>
  );
}

const ALERT_STYLE: Record<string, { bg: string; iconBg: string; iconColor: string; actionBg: string; icon: typeof AlertTriangle }> = {
  danger: { bg: "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40", iconBg: "bg-rose-500/10", iconColor: "text-rose-600", actionBg: "bg-rose-600 text-white border-rose-600 hover:bg-rose-700", icon: AlertTriangle },
  warning: { bg: "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40", iconBg: "bg-amber-500/10", iconColor: "text-amber-600", actionBg: "bg-amber-600 text-white border-amber-600 hover:bg-amber-700", icon: Clock },
  info: { bg: "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40", iconBg: "bg-blue-500/10", iconColor: "text-blue-600", actionBg: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700", icon: Info },
};

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<DashboardPeriod>("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profitabilityToday, setProfitabilityToday] = useState<ProfitabilitySummary | null>(null);

  const loadProfitabilitySummary = useCallback(async () => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const data = await apiClient.get<ProfitabilitySummary>(
        `/profitability/overview?from=${startOfDay.toISOString()}&to=${new Date().toISOString()}`,
      );
      setProfitabilityToday(data);
    } catch {
      // Non-fatal — dashboard renders fine without this optional summary card.
    }
  }, []);

  const loadData = useCallback(async (period: DashboardPeriod) => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      const [overviewData, ordersData] = await Promise.all([
        apiClient.get<DashboardOverview>(`/reporting/dashboard/overview?period=${period}`),
        apiClient.get<ApiOrder[]>("/orders"),
      ]);
      setOverview(overviewData);
      setRecentOrders(
        ordersData.slice(0, 5).map((o, i) => {
          const customer = o.user?.name || `Client #${i + 1}`;
          const initials = customer.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "CL";
          return {
            id: `#${o.id.slice(-6)}`,
            customer,
            initials,
            city: o.gouvernorat || "—",
            total: formatCurrency(o.totalMillimes / 1000),
            itemsCount: o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1,
            status: o.status,
            time: new Date(o.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          };
        }),
      );
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger le tableau de bord");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange, loadData]);

  useEffect(() => {
    loadProfitabilitySummary();
  }, [loadProfitabilitySummary]);

  // Order create/status-change/delete elsewhere (Commandes page) invalidates
  // the dashboard's order-driven KPIs too — no manual reload needed.
  useEffect(
    () =>
      onOrdersChanged(() => {
        loadData(timeRange);
        loadProfitabilitySummary();
      }),
    [loadData, loadProfitabilitySummary, timeRange],
  );

  const salesSeries: DashboardChartDataPoint[] =
    overview?.salesChart.map((d) => ({
      label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      ca: d.caMillimes / 1000,
      orders: d.orderCount,
      marge: d.margeMillimes / 1000,
    })) ?? [];

  const periodLabelMap: Record<DashboardPeriod, string> = { today: "Aujourd'hui", "7d": "7 derniers jours", "30d": "30 derniers jours" };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink">Tableau de Bord Operations</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Système Actif
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {loadError ?? "Aperçu en temps réel des ventes, commandes et livraisons ParaTunisie"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="inline-flex items-center rounded-xl bg-surface-alt border border-border p-1 shadow-2xs">
            {(["today", "7d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  timeRange === range ? "bg-primary text-white font-semibold shadow-xs" : "text-ink-muted hover:text-ink"
                }`}
              >
                {range === "today" ? "Aujourd'hui" : range === "7d" ? "7 Jours" : "30 Jours"}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              loadData(timeRange);
              loadProfitabilitySummary();
            }}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-border bg-surface-alt text-ink-muted hover:text-ink hover:border-border-strong transition-all"
            title="Rafraîchir les données"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary" : ""} />
          </button>

          {/* Create Order Button */}
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            Commandes
          </Link>
        </div>
      </div>

      {/* Hero Top KPI Cards with Embedded Sparklines */}
      <section aria-label="Indicateurs clés de performance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Chiffre d'Affaires",
              value: formatCurrency((overview?.kpis.caMillimes ?? 0) / 1000),
              secondary: `${overview?.kpis.orderCount ?? 0} commande(s)`,
              icon: TrendingUp,
              bgGlow: "bg-primary/10 text-primary",
              sparkColor: "primary" as const,
              sparklineData: salesSeries.map((d) => d.ca),
            },
            {
              label: "Marge Brute Estimée",
              value: formatCurrency((overview?.kpis.margeBruteEstimeeMillimes ?? 0) / 1000),
              secondary:
                overview?.kpis.marginCoverage != null
                  ? `estimée sur ${Math.round(overview.kpis.marginCoverage * 100)}% des lignes`
                  : "coût d'acquisition non renseigné",
              icon: Zap,
              bgGlow: "bg-emerald-500/10 text-emerald-600",
              sparkColor: "success" as const,
              sparklineData: salesSeries.map((d) => d.marge),
            },
            {
              label: "Commandes",
              value: `${overview?.kpis.orderCount ?? 0}`,
              secondary: `${overview?.statusCounts.EN_ATTENTE ?? 0} en attente`,
              icon: ShoppingCart,
              bgGlow: "bg-amber-500/10 text-amber-600",
              sparkColor: "warning" as const,
              sparklineData: salesSeries.map((d) => d.orders),
            },
            {
              label: "Taux de Livraison COD",
              value: formatPercent(overview?.kpis.tauxLivraison ?? 0),
              secondary: `${formatPercent(overview?.kpis.tauxConfirmation ?? 0)} confirmation`,
              icon: Truck,
              bgGlow: "bg-blue-500/10 text-blue-600",
              sparkColor: "primary" as const,
              sparklineData: [],
            },
          ].map((kpi) => {
            const IconComponent = kpi.icon;
            return (
              <div key={kpi.label} className="glass-card p-4 relative overflow-hidden flex flex-col justify-between group">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[0.6875rem] font-semibold tracking-wider uppercase text-ink-muted">{kpi.label}</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold tracking-tight text-ink tabular-nums">{kpi.value}</span>
                    </div>
                  </div>
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${kpi.bgGlow} transition-transform group-hover:scale-105`}>
                    <IconComponent size={18} />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50 flex items-end justify-between gap-2">
                  <span className="text-[0.6875rem] font-semibold text-ink-muted">{kpi.secondary}</span>
                  <Sparkline data={kpi.sparklineData} color={kpi.sparkColor} width={90} height={26} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Secondary Quick Metrics Row */}
      <section aria-label="Statistiques secondaires">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { label: "Panier moyen", value: formatCurrency((overview?.kpis.panierMoyenMillimes ?? 0) / 1000), icon: ShoppingCart },
            { label: "Nouveaux clients", value: `${overview?.customerKpis.newCustomers ?? 0}`, icon: Users },
            { label: "Clients récurrents", value: `${overview?.customerKpis.returningCustomers ?? 0}`, icon: ShieldCheck },
            { label: "Taux confirmation", value: formatPercent(overview?.kpis.tauxConfirmation ?? 0), icon: ShieldCheck },
            { label: "Taux annulation", value: formatPercent(overview?.kpis.tauxAnnulation ?? 0), icon: RotateCcw },
            { label: "Taux retour", value: formatPercent(overview?.kpis.tauxRetour ?? 0), icon: Package },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-alt/60 p-3 hover:bg-surface-alt transition-colors">
              <div className="flex items-center gap-1.5 text-ink-faint mb-1">
                <s.icon size={12} />
                <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-muted truncate">{s.label}</span>
              </div>
              <span className="text-sm font-bold text-ink tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Grid: Left (Chart + Orders) | Right (Alerts + Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardChart data={salesSeries} periodLabel={periodLabelMap[timeRange]} />

          {/* Recent Orders Section */}
          <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                  <span>Commandes Récentes</span>
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">Gestion directe des confirmations et envois COD</p>
              </div>
              <Link href="/admin/commandes" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                <span>Toutes les commandes</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
                    <th className="py-3 px-3.5">Référence</th>
                    <th className="py-3 px-3.5">Client</th>
                    <th className="py-3 px-3.5">Gouvernorat</th>
                    <th className="py-3 px-3.5 text-right">Montant Total</th>
                    <th className="py-3 px-3.5">Statut COD</th>
                    <th className="py-3 px-3.5 text-right">Délai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-ink-faint font-semibold">Aucune commande récente.</td>
                    </tr>
                  )}
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-soft-nude/30 transition-colors cursor-pointer">
                      <td className="py-3 px-3.5 font-mono text-xs font-semibold text-primary group-hover:underline">{order.id}</td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-[0.6875rem] flex items-center justify-center shrink-0">
                            {order.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-ink">{order.customer}</div>
                            <div className="text-[0.625rem] text-ink-faint">{order.itemsCount} article(s)</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-ink-muted">{order.city}</td>
                      <td className="py-3 px-3.5 text-right font-bold text-ink tabular-nums">{order.total}</td>
                      <td className="py-3 px-3.5"><StatusPill status={order.status} /></td>
                      <td className="py-3 px-3.5 text-right text-ink-faint text-[0.6875rem] whitespace-nowrap">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Operational Alerts Hub */}
          <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                <span>Alertes Opérationnelles</span>
              </h2>
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[0.625rem] font-bold text-rose-700">
                {overview?.alerts.length ?? 0} prioritaires
              </span>
            </div>

            <div className="space-y-2.5">
              {(overview?.alerts.length ?? 0) === 0 && (
                <p className="text-xs text-ink-faint text-center py-4">Aucune alerte — tout est sous contrôle.</p>
              )}
              {overview?.alerts.map((item, i) => {
                const style = ALERT_STYLE[item.type];
                const Icon = style.icon;
                return (
                  <div key={i} className={`p-3 rounded-xl border transition-all ${style.bg}`}>
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 p-1 rounded-md shrink-0 ${style.iconBg} ${style.iconColor}`}>
                        <Icon size={13} />
                      </div>
                      <p className="text-xs font-bold text-ink leading-snug">{item.message}</p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-end">
                      <Link href={item.link} className={`inline-flex items-center gap-1 text-[0.6875rem] font-bold px-2.5 py-1 rounded-lg border transition-all ${style.actionBg}`}>
                        <span>Voir</span>
                        <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COD Conversion Funnel */}
          <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-ink">Entonnoir COD</h2>
              <span className="text-xs font-semibold text-emerald-600">
                {overview && overview.funnel[0]?.count > 0
                  ? formatPercent((overview.funnel[overview.funnel.length - 1].count / overview.funnel[0].count) * 100)
                  : "—"}{" "}
                Conversion
              </span>
            </div>

            <div className="space-y-3">
              {(overview?.funnel ?? []).map((step, i) => {
                const colors = ["bg-primary", "bg-emerald-600", "bg-blue-600", "bg-emerald-500"];
                return (
                  <div key={step.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-muted font-medium">{step.label}</span>
                      <span className="font-bold text-ink tabular-nums">
                        {step.count} <span className="text-ink-faint text-[0.6875rem] font-normal">({formatPercent(step.pct)})</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-soft-nude overflow-hidden p-0.5">
                      <div className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`} style={{ width: `${step.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-ink-muted">
              <span>Taux de retour COD :</span>
              <span className="font-bold text-rose-600">{formatPercent(overview?.kpis.tauxRetour ?? 0)}</span>
            </div>
          </div>

          {/* Rentabilité summary — compact, links out to the full page (no duplication) */}
          <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                <Wallet size={15} className="text-primary" />
                <span>Rentabilité (aujourd&apos;hui)</span>
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint">CA confirmé</p>
                <p className="text-sm font-extrabold text-ink tabular-nums">{formatCurrency((profitabilityToday?.kpis.caConfirmeeMillimes ?? 0) / 1000)}</p>
              </div>
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint">Gain estimé</p>
                <p className={`text-sm font-extrabold tabular-nums ${profitabilityToday?.kpis.gainEstimeMillimes != null ? "text-success" : "text-ink-faint"}`}>
                  {profitabilityToday?.kpis.gainEstimeMillimes != null ? formatCurrency(profitabilityToday.kpis.gainEstimeMillimes / 1000) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint">Marge</p>
                <p
                  className="text-sm font-extrabold text-ink tabular-nums"
                  title={profitabilityToday?.kpis.tauxMarge == null ? "Impossible à calculer : coût d'achat manquant." : undefined}
                >
                  {profitabilityToday?.kpis.tauxMarge != null ? formatPercent(profitabilityToday.kpis.tauxMarge) : "—"}
                </p>
              </div>
            </div>
            <Link href="/admin/rentabilite" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              <span>Voir la rentabilité</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
