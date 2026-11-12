"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Clipboard,
  Clock,
  Download,
  Info,
  Receipt,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { onOrdersChanged } from "@/lib/order-events";
import { useToast } from "@/components/toast";
import { cn } from "@paratunisie/ui";
import { AnimatedNumber, AnimatedText, Reveal } from "@/components/dashboard/animated";
import { BarList, SalesChart, StatusDonut, type BarRow, type DashboardChartDataPoint } from "@/components/dashboard/charts";
import { KpiCard, KpiCardSkeleton, type KpiTrend } from "@/components/dashboard/kpi-card";
import { DataGrid, type GridColumn } from "@/components/ui/data-grid";
import { OrderStatusBadge } from "@/components/ui/status-badge";

/* ─── API response shapes (apps/api/src/reporting, orders, inventory) ───── */

type DashboardPeriod = "today" | "7d" | "30d" | "3mo" | "12mo";

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
  payment?: { method?: string } | null;
}

interface LowStockItem {
  id: string;
  quantityAvailable: number;
  reorderThreshold: number;
  variant?: { label?: string; product?: { name?: string; brand?: { name?: string } | null } | null } | null;
}

interface ProfitabilitySummary {
  kpis: { caConfirmeeMillimes: number; gainEstimeMillimes: number | null; tauxMarge: number | null };
}

interface RecentOrderRow {
  id: string;
  reference: string;
  customer: string;
  initials: string;
  city: string;
  totalMillimes: number;
  itemsCount: number;
  status: string;
  createdAt: string;
}

interface LowStockRow {
  id: string;
  product: string;
  brand: string;
  variant: string;
  available: number;
  threshold: number;
}

const PERIODS: { key: DashboardPeriod; label: string; long: string }[] = [
  { key: "today", label: "Aujourd'hui", long: "Aujourd'hui" },
  { key: "7d", label: "7 jours", long: "7 derniers jours" },
  { key: "30d", label: "30 jours", long: "30 derniers jours" },
  { key: "3mo", label: "3 mois", long: "3 derniers mois" },
  { key: "12mo", label: "12 mois", long: "12 derniers mois" },
];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

/** % change between the last half and the first half of the period (equal-length halves). Null when not computable. */
function halfTrend(values: number[]): KpiTrend {
  if (values.length < 4) return null;
  const half = Math.floor(values.length / 2);
  const before = sum(values.slice(0, half));
  const after = sum(values.slice(values.length - half));
  return before > 0 ? ((after - before) / before) * 100 : null;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + body], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PAYMENT_LABELS: Record<string, string> = { cod: "à la livraison", card: "par carte", transfer: "par virement" };

const ALERT_STYLE = {
  danger: { icon: AlertTriangle, label: "Urgent", bar: "bg-primary", chip: "bg-primary-soft text-coral-text" },
  warning: { icon: Clock, label: "À surveiller", bar: "bg-ink", chip: "bg-soft-nude text-ink" },
  info: { icon: Info, label: "Info", bar: "bg-border-strong", chip: "bg-soft-nude text-ink-muted" },
} as const;

/* ─── Main component ───────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<DashboardPeriod>("30d");
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profitabilityToday, setProfitabilityToday] = useState<ProfitabilitySummary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[] | null>(null);
  const [lowStockError, setLowStockError] = useState<string | null>(null);

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

  const loadLowStock = useCallback(async () => {
    setLowStockError(null);
    try {
      setLowStock(await apiClient.get<LowStockItem[]>("/inventory/alerts/low-stock"));
    } catch (err) {
      setLowStockError(err instanceof ApiError ? err.message : "Impossible de charger les stocks bas.");
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
      setOrders(ordersData);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger le tableau de bord");
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(timeRange);
  }, [timeRange, loadData]);

  useEffect(() => {
    loadProfitabilitySummary();
    loadLowStock();
  }, [loadProfitabilitySummary, loadLowStock]);

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

  const periodLong = PERIODS.find((p) => p.key === timeRange)!.long;

  const salesSeries: DashboardChartDataPoint[] = useMemo(
    () =>
      overview?.salesChart.map((d) => ({
        label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        ca: d.caMillimes / 1000,
        orders: d.orderCount,
        marge: d.margeMillimes / 1000,
      })) ?? [],
    [overview],
  );

  const trends = useMemo(() => {
    const ca = salesSeries.map((d) => d.ca);
    const cmd = salesSeries.map((d) => d.orders);
    const marge = salesSeries.map((d) => d.marge);
    const half = Math.floor(salesSeries.length / 2);
    let basket: KpiTrend = null;
    if (salesSeries.length >= 4) {
      const avg = (rows: DashboardChartDataPoint[]) => {
        const n = sum(rows.map((r) => r.orders));
        return n > 0 ? sum(rows.map((r) => r.ca)) / n : 0;
      };
      const before = avg(salesSeries.slice(0, half));
      const after = avg(salesSeries.slice(salesSeries.length - half));
      basket = before > 0 ? ((after - before) / before) * 100 : null;
    }
    return { ca: halfTrend(ca), orders: halfTrend(cmd), marge: halfTrend(marge), basket };
  }, [salesSeries]);

  const recentRows: RecentOrderRow[] = useMemo(
    () =>
      orders.slice(0, 24).map((o, i) => {
        const customer = o.user?.name || `Client #${i + 1}`;
        return {
          id: o.id,
          reference: `#${o.id.slice(-6).toUpperCase()}`,
          customer,
          initials: customer.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "CL",
          city: o.gouvernorat || "—",
          totalMillimes: o.totalMillimes,
          itemsCount: o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 1,
          status: o.status,
          createdAt: o.createdAt,
        };
      }),
    [orders],
  );

  const lowStockRows: LowStockRow[] = useMemo(
    () =>
      (lowStock ?? []).map((i) => ({
        id: i.id,
        product: i.variant?.product?.name ?? "Produit",
        brand: i.variant?.product?.brand?.name ?? "—",
        variant: i.variant?.label ?? "—",
        available: i.quantityAvailable,
        threshold: i.reorderThreshold,
      })),
    [lowStock],
  );

  const bestSellers: BarRow[] = useMemo(
    () =>
      [...(overview?.topProducts ?? [])]
        .sort((a, b) => b.revenueMillimes - a.revenueMillimes)
        .slice(0, 6)
        .map((p) => ({ key: p.productId, label: p.name, value: p.revenueMillimes, valueLabel: formatCurrency(p.revenueMillimes / 1000), sub: `${p.brand} · ${p.units} unité${p.units > 1 ? "s" : ""}` })),
    [overview],
  );

  const brands: BarRow[] = useMemo(() => {
    const by = new Map<string, { revenue: number; units: number }>();
    for (const p of overview?.topProducts ?? []) {
      const cur = by.get(p.brand) ?? { revenue: 0, units: 0 };
      by.set(p.brand, { revenue: cur.revenue + p.revenueMillimes, units: cur.units + p.units });
    }
    return [...by.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 6)
      .map(([brand, v]) => ({ key: brand, label: brand, value: v.revenue, valueLabel: formatCurrency(v.revenue / 1000), sub: `${v.units} unité${v.units > 1 ? "s" : ""}` }));
  }, [overview]);

  // Share of orders per payment method, from the orders already loaded (no extra call).
  const paymentFootnote = useMemo(() => {
    if (orders.length === 0) return undefined;
    const by = new Map<string, number>();
    for (const o of orders) by.set(o.payment?.method ?? "cod", (by.get(o.payment?.method ?? "cod") ?? 0) + 1);
    return "Paiement : " + [...by.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${Math.round((n / orders.length) * 100)} % ${PAYMENT_LABELS[m] ?? m}`).join(" · ");
  }, [orders]);

  /* ─── Tables ─── */

  const orderColumns: GridColumn<RecentOrderRow>[] = [
    { key: "ref", header: "Référence", sortValue: (r) => r.id, cell: (r) => <span className="num text-[0.75rem] font-medium text-ink">{r.reference}</span> },
    {
      key: "customer",
      header: "Client",
      sortValue: (r) => r.customer,
      cell: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft-nude text-[0.625rem] font-semibold text-ink" aria-hidden>{r.initials}</span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.customer}</p>
            <p className="text-[0.6875rem] text-ink-muted">{r.itemsCount} article{r.itemsCount > 1 ? "s" : ""}</p>
          </div>
        </div>
      ),
    },
    { key: "city", header: "Gouvernorat", defaultHidden: true, sortValue: (r) => r.city, cell: (r) => <span className="text-ink-muted">{r.city}</span> },
    { key: "total", header: "Montant", align: "right", className: "whitespace-nowrap", sortValue: (r) => r.totalMillimes, cell: (r) => <span className="num font-medium text-ink">{formatCurrency(r.totalMillimes / 1000)}</span> },
    { key: "status", header: "Statut", sortValue: (r) => r.status, cell: (r) => <OrderStatusBadge status={r.status} /> },
    {
      key: "date",
      header: "Date",
      align: "right",
      sortValue: (r) => r.createdAt,
      cell: (r) => (
        <span className="num whitespace-nowrap text-[0.75rem] text-ink-muted">
          {new Date(r.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
  ];

  const stockColumns: GridColumn<LowStockRow>[] = [
    {
      key: "product",
      header: "Produit",
      sortValue: (r) => r.product,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{r.product}</p>
          <p className="text-[0.6875rem] text-ink-muted">{r.brand}</p>
        </div>
      ),
    },
    { key: "variant", header: "Format", sortValue: (r) => r.variant, cell: (r) => <span className="text-ink-muted">{r.variant}</span> },
    {
      key: "available",
      header: "Disponible",
      align: "right",
      sortValue: (r) => r.available,
      cell: (r) => (
        <span className={cn("num inline-flex items-center gap-1.5 font-semibold", r.available <= 0 ? "text-danger" : "text-ink")}>
          {r.available <= 0 && <span className="rounded-full bg-danger-bg px-1.5 py-0.5 text-[0.625rem] font-semibold">Rupture</span>}
          {r.available}
        </span>
      ),
    },
    { key: "threshold", header: "Seuil", align: "right", sortValue: (r) => r.threshold, cell: (r) => <span className="num text-ink-muted">{r.threshold}</span> },
  ];

  const copyRefs = (refs: string[]) => {
    navigator.clipboard?.writeText(refs.join("\n")).then(
      () => toast("success", `${refs.length} référence${refs.length > 1 ? "s" : ""} copiée${refs.length > 1 ? "s" : ""}`),
      () => toast("error", "Copie impossible dans ce navigateur"),
    );
  };

  /* ─── Render ─── */

  if (loadError && !overview) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center" role="alert">
        <span className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger"><AlertTriangle size={22} aria-hidden /></span>
        <div>
          <AnimatedText as="h1" text="Impossible de charger le tableau de bord" className="page-title justify-center text-center !text-lg" />
          <p className="mt-2 text-sm text-ink-muted">{loadError}</p>
        </div>
        <button type="button" onClick={() => loadData(timeRange)} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.98]">
          Réessayer
        </button>
      </div>
    );
  }

  const ready = overview !== null;
  const k = overview?.kpis;

  return (
    <div className={cn("mx-auto max-w-[1600px] space-y-6 pb-10 transition-opacity duration-200", isRefreshing && ready && "opacity-80")}>
      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-bg p-3.5 text-danger">
          <div className="flex items-center gap-2.5 text-[0.8125rem]">
            <AlertTriangle size={16} className="shrink-0" aria-hidden />
            <span><strong className="font-semibold">Actualisation impossible.</strong> {loadError}</span>
          </div>
          <button type="button" onClick={() => loadData(timeRange)} className="h-8 shrink-0 rounded-lg bg-danger px-3 text-[0.75rem] font-semibold text-white">Réessayer</button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <AnimatedText as="h1" text="Tableau de bord" className="page-title" />
          <AnimatedText as="p" text="Ventes, commandes et livraisons ParaTunisie en un coup d'œil." className="mt-1.5 text-[0.9375rem] text-ink-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Période" className="flex max-w-full overflow-x-auto rounded-lg border border-border bg-surface-alt p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={timeRange === p.key}
                disabled={isRefreshing && timeRange !== p.key}
                onClick={() => setTimeRange(p.key)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
                  timeRange === p.key ? "bg-ink text-white" : "text-ink-muted hover:text-ink disabled:opacity-60",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              loadData(timeRange);
              loadProfitabilitySummary();
              loadLowStock();
            }}
            className="press flex size-9 items-center justify-center rounded-lg border border-border bg-surface-alt text-ink-muted"
            aria-label="Actualiser les données"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} aria-hidden />
          </button>
        </div>
      </header>

      {/* KPI cards */}
      <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6 2xl:grid-cols-5">
        {!ready || !k ? (
          Array.from({ length: 5 }, (_, i) => <KpiCardSkeleton key={i} className={i === 0 ? "col-span-2 lg:col-span-2 2xl:col-span-1" : i < 3 ? "lg:col-span-2 2xl:col-span-1" : "lg:col-span-3 2xl:col-span-1"} />)
        ) : (
          <>
            <KpiCard className="col-span-2 lg:col-span-2 2xl:col-span-1" label="Chiffre d'affaires" icon={TrendingUp} value={k.caMillimes / 1000} decimals={3} suffix={" DT"} trend={trends.ca} hint={`${k.orderCount} commande${k.orderCount > 1 ? "s" : ""}`} />
            <KpiCard className="lg:col-span-2 2xl:col-span-1" label="Commandes" icon={ShoppingCart} value={k.orderCount} trend={trends.orders} hint={`${overview.statusCounts.EN_ATTENTE ?? 0} en attente`} />
            <KpiCard className="lg:col-span-2 2xl:col-span-1" label="Panier moyen" icon={Receipt} value={k.panierMoyenMillimes / 1000} decimals={3} suffix={" DT"} trend={trends.basket} hint="par commande" />
            <KpiCard
              className="lg:col-span-3 2xl:col-span-1"
              label="Marge brute estimée"
              icon={Zap}
              value={k.margeBruteEstimeeMillimes / 1000}
              decimals={3}
              suffix={" DT"}
              trend={trends.marge}
              hint={k.marginCoverage != null ? `sur ${Math.round(k.marginCoverage * 100)} % des lignes` : "coût d'achat non renseigné"}
            />
            <KpiCard className="col-span-2 lg:col-span-3 2xl:col-span-1" label="Livraison COD" icon={Truck} value={k.tauxLivraison} decimals={1} suffix={" %"} hint={`${formatPercent(k.tauxConfirmation)} de confirmation`} />
          </>
        )}
      </section>

      {/* Sales + status */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-6">
        <Reveal className="h-full xl:col-span-8">
          {ready ? <SalesChart data={salesSeries} periodLabel={periodLong} /> : <div className="studio-card pt-skeleton h-[22rem]" aria-hidden />}
        </Reveal>
        <Reveal className="h-full xl:col-span-4" delay={0.06}>
          {ready ? <StatusDonut statusCounts={overview.statusCounts} footnote={paymentFootnote} /> : <div className="studio-card pt-skeleton h-[22rem]" aria-hidden />}
        </Reveal>
      </div>

      {/* Rankings + funnel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12 xl:gap-6">
        <Reveal className="h-full xl:col-span-5">
          <BarList title="Meilleures ventes" description="Produits classés par chiffre d'affaires" rows={bestSellers} empty="Aucune vente sur cette période." caption="Meilleures ventes par chiffre d'affaires" />
        </Reveal>
        <Reveal className="h-full xl:col-span-4" delay={0.05}>
          <BarList title="Marques" description="Chiffre d'affaires des meilleures ventes, par marque" rows={brands} empty="Aucune marque à afficher." caption="Chiffre d'affaires par marque" />
        </Reveal>
        <Reveal className="h-full lg:col-span-2 xl:col-span-3" delay={0.1}>
          <section className="studio-card h-full p-5" aria-label="Entonnoir COD">
            <div className="flex items-start justify-between gap-2">
              <AnimatedText as="h2" text="Entonnoir COD" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
              <span className="num text-[0.8125rem] font-semibold text-ink">
                {overview && overview.funnel[0]?.count > 0 ? formatPercent((overview.funnel[overview.funnel.length - 1].count / overview.funnel[0].count) * 100) : "—"}
              </span>
            </div>
            <p className="mt-1 text-[0.8125rem] text-ink-muted">Conversion de bout en bout</p>
            <ul className="mt-5 space-y-3.5">
              {(overview?.funnel ?? []).map((step, i, all) => (
                <li key={step.label}>
                  <div className="flex items-baseline justify-between text-[0.8125rem]">
                    <span className="text-ink">{step.label}</span>
                    <span className="num font-medium text-ink">{step.count} <span className="font-normal text-ink-muted">({formatPercent(step.pct)})</span></span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-soft-nude">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(3, step.pct)}%`, background: i === all.length - 1 ? "#E4572E" : "#171717" }} />
                  </div>
                </li>
              ))}
              {(overview?.funnel.length ?? 0) === 0 && <li className="py-6 text-center text-[0.8125rem] text-ink-muted">Pas encore de données.</li>}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-[0.8125rem] text-ink-muted">
              <span>Taux de retour</span>
              <span className="num font-semibold text-ink">{formatPercent(k?.tauxRetour ?? 0)}</span>
            </div>
          </section>
        </Reveal>
      </div>

      {/* Orders + alerts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-6">
        <Reveal className="h-full min-w-0 xl:col-span-8">
          <DataGrid<RecentOrderRow>
            caption="Commandes récentes"
            title={<AnimatedText as="h2" text="Commandes récentes" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />}
            description={<p className="mt-1 text-[0.8125rem] text-ink-muted">Confirmations et envois COD à traiter</p>}
            actions={
              <Link href="/admin/commandes" className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[0.75rem] font-semibold text-coral-text hover:underline">
                Toutes les commandes <ChevronRight size={13} aria-hidden />
              </Link>
            }
            columns={orderColumns}
            rows={recentRows}
            rowId={(r) => r.id}
            pageSize={6}
            loading={initialLoading && !ready}
            empty={
              <div className="rounded-lg border border-dashed border-border-strong py-10 text-center">
                <AnimatedText as="p" text="Aucune commande pour le moment." className="justify-center text-[0.8125rem] text-ink-muted" />
              </div>
            }
            bulkActions={[
              { label: "Copier les références", icon: Clipboard, run: (rows) => copyRefs(rows.map((r) => r.reference)) },
              {
                label: "Exporter CSV",
                icon: Download,
                run: (rows) => downloadCsv("commandes-selection.csv", ["Référence", "Client", "Gouvernorat", "Montant (DT)", "Statut", "Date"], rows.map((r) => [r.reference, r.customer, r.city, (r.totalMillimes / 1000).toFixed(3), r.status, r.createdAt])),
              },
            ]}
          />
        </Reveal>

        <Reveal className="h-full xl:col-span-4" delay={0.06}>
          <section className="studio-card h-full p-5" aria-label="Alertes opérationnelles">
            <div className="flex items-center justify-between gap-2">
              <AnimatedText as="h2" text="Alertes opérationnelles" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
              <span className="num rounded-full bg-soft-nude px-2 py-0.5 text-[0.6875rem] font-semibold text-ink">{overview?.alerts.length ?? 0}</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {ready && overview.alerts.length === 0 && (
                <li className="rounded-lg border border-dashed border-border-strong py-8 text-center">
                  <AnimatedText as="p" text="Aucune alerte, tout est sous contrôle." className="justify-center text-[0.8125rem] text-ink-muted" />
                </li>
              )}
              {overview?.alerts.map((a, i) => {
                const st = ALERT_STYLE[a.type];
                return (
                  <li key={i} className="relative overflow-hidden rounded-lg border border-border bg-background py-3 pl-4 pr-3">
                    <span className={cn("absolute inset-y-0 left-0 w-1", st.bar)} aria-hidden />
                    <div className="flex items-start gap-2.5">
                      <span className={cn("mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold", st.chip)}>
                        <st.icon size={10} aria-hidden /> {st.label}
                      </span>
                      <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-ink">{a.message}</p>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Link href={a.link} className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-ink hover:underline">
                        Voir <ChevronRight size={12} aria-hidden />
                      </Link>
                    </div>
                  </li>
                );
              })}
              {!ready && Array.from({ length: 3 }, (_, i) => <li key={i} className="pt-skeleton h-16" aria-hidden />)}
            </ul>
          </section>
        </Reveal>
      </div>

      {/* Low stock + customers/profit */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-6">
        <Reveal className="h-full min-w-0 xl:col-span-8">
          <DataGrid<LowStockRow>
            caption="Produits en stock bas"
            title={<AnimatedText as="h2" text="Stock bas" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />}
            description={<p className="mt-1 text-[0.8125rem] text-ink-muted">Produits à ou sous leur seuil de réapprovisionnement</p>}
            actions={
              <Link href="/admin/stocks" className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[0.75rem] font-semibold text-coral-text hover:underline">
                Gérer les stocks <ChevronRight size={13} aria-hidden />
              </Link>
            }
            columns={stockColumns}
            rows={lowStockRows}
            rowId={(r) => r.id}
            pageSize={6}
            loading={lowStock === null && !lowStockError}
            error={lowStockError}
            onRetry={loadLowStock}
            empty={
              <div className="rounded-lg border border-dashed border-border-strong py-10 text-center">
                <AnimatedText as="p" text="Aucun produit sous son seuil de stock." className="justify-center text-[0.8125rem] text-ink-muted" />
              </div>
            }
            bulkActions={[
              { label: "Copier les produits", icon: Clipboard, run: (rows) => copyRefs(rows.map((r) => `${r.product} (${r.variant})`)) },
              {
                label: "Exporter CSV",
                icon: Download,
                run: (rows) => downloadCsv("stock-bas-selection.csv", ["Produit", "Marque", "Format", "Disponible", "Seuil"], rows.map((r) => [r.product, r.brand, r.variant, r.available, r.threshold])),
              },
            ]}
          />
        </Reveal>

        <div className="space-y-4 xl:col-span-4 xl:space-y-6">
          <Reveal delay={0.04}>
            <section className="studio-card p-5" aria-label="Clients et qualité">
              <AnimatedText as="h2" text="Clients et qualité" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
              <dl className="mt-4 divide-y divide-border text-[0.8125rem]">
                {[
                  { label: "Nouveaux clients", value: overview?.customerKpis.newCustomers, fmt: (v: number) => String(v) },
                  { label: "Clients récurrents", value: overview?.customerKpis.returningCustomers, fmt: (v: number) => String(v) },
                  { label: "Taux de confirmation", value: k?.tauxConfirmation, fmt: formatPercent },
                  { label: "Taux d'annulation", value: k?.tauxAnnulation, fmt: formatPercent },
                  { label: "Taux de retour", value: k?.tauxRetour, fmt: formatPercent },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <dt className="text-ink-muted">{row.label}</dt>
                    <dd className="num font-medium text-ink">{row.value === undefined ? "—" : row.fmt(row.value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section className="studio-card p-5" aria-label="Rentabilité du jour">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-ink-muted" aria-hidden />
                <AnimatedText as="h2" text="Rentabilité aujourd'hui" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="min-w-0">
                  <p className="studio-eyebrow">CA confirmé</p>
                  <p className="mt-1 truncate text-[0.9375rem] font-semibold text-ink">
                    <AnimatedNumber value={(profitabilityToday?.kpis.caConfirmeeMillimes ?? 0) / 1000} decimals={3} className="num" />
                    <span className="num text-[0.6875rem] font-normal text-ink-muted"> DT</span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="studio-eyebrow">Gain estimé</p>
                  <p className="num mt-1 truncate text-[0.9375rem] font-semibold text-ink">
                    {profitabilityToday?.kpis.gainEstimeMillimes != null ? formatCurrency(profitabilityToday.kpis.gainEstimeMillimes / 1000) : "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="studio-eyebrow">Marge</p>
                  <p className="num mt-1 text-[0.9375rem] font-semibold text-ink" title={profitabilityToday?.kpis.tauxMarge == null ? "Impossible à calculer : coût d'achat manquant." : undefined}>
                    {profitabilityToday?.kpis.tauxMarge != null ? formatPercent(profitabilityToday.kpis.tauxMarge) : "—"}
                  </p>
                </div>
              </div>
              <Link href="/admin/rentabilite" className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-coral-text hover:underline">
                Voir la rentabilité <ChevronRight size={13} aria-hidden />
              </Link>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
