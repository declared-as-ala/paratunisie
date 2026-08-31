"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  ShoppingCart,
  DollarSign,
  Percent,
  Compass,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Search,
  ArrowRight,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { cn } from "@paratunisie/ui";

// ─── Type Definitions ──────────────────────────────────────────────────

interface KpiCardMetric {
  current: number;
  previous: number;
  changePercent: number;
}

interface OverviewResponse {
  period: string;
  dateRange: {
    current: { from: string; to: string };
    previous: { from: string; to: string };
  };
  kpis: {
    visitors: KpiCardMetric;
    uniqueVisitors: KpiCardMetric;
    pageViews: KpiCardMetric;
    sessions: KpiCardMetric;
    orders: KpiCardMetric;
    revenue: KpiCardMetric;
    conversionRate: KpiCardMetric;
    avgOrderValue: KpiCardMetric;
    bounceRate: KpiCardMetric;
    avgPagesPerSession: number;
    avgDurationSeconds: number;
    newVisitorsCount: number;
    returningVisitorsCount: number;
  };
}

interface TimeseriesPoint {
  date: string;
  label: string;
  value: number;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  orders: number;
  revenue: number;
}

interface FunnelStep {
  step: number;
  name: string;
  count: number;
  conversionFromPrevious: number;
  overallConversion: number;
  dropOffRate: number;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  image: string;
  brandName: string;
  categoryName: string;
  currentPriceTnd: number;
  inStock: boolean;
  views: number;
  addToCart: number;
  purchases: number;
  revenueTnd: number;
  conversionRate: number;
  viewToCartRate: number;
  cartToPurchaseRate: number;
}

interface PageRow {
  pagePath: string;
  pageType: string;
  views: number;
  avgDurationSeconds: number;
}

interface CountryRow {
  country: string;
  countryCode: string;
  visitors: number;
  pageViews: number;
  orders: number;
  conversionRate: number;
  sharePercent: number;
}

interface SourceRow {
  channel: string;
  rawChannel: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  visitors: number;
  pageViews: number;
  orders: number;
  conversionRate: number;
}

interface DeviceDistribution {
  devices: { device: string; count: number; percent: number }[];
  browsers: { browser: string; count: number; percent: number }[];
}

interface SearchRow {
  keyword: string;
  count: number;
  avgResults: number;
}

interface RealtimeResponse {
  activeVisitorsNow: number;
  activePages: { path: string; count: number }[];
  activeCountries: { country: string; count: number }[];
}

const PERIOD_OPTIONS = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "7d", label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
  { value: "this_month", label: "Ce mois-ci" },
  { value: "last_month", label: "Mois dernier" },
  { value: "3mo", label: "3 derniers mois" },
  { value: "this_year", label: "Cette année" },
  { value: "custom", label: "Personnalisé" },
];

const METRIC_TABS = [
  { key: "visitors", label: "Visiteurs", icon: Users },
  { key: "unique_visitors", label: "Visiteurs Uniques", icon: Users },
  { key: "page_views", label: "Pages Vues", icon: Eye },
  { key: "sessions", label: "Sessions", icon: Compass },
  { key: "orders", label: "Commandes", icon: ShoppingCart },
  { key: "revenue", label: "Chiffre d'Affaires (DT)", icon: DollarSign },
];

export default function AnalyticsPage() {
  // Global Filters
  const [period, setPeriod] = useState<string>("7d");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [deviceFilter, setDeviceFilter] = useState<string>("");

  // Chart Metric
  const [activeChartMetric, setActiveChartMetric] = useState<string>("visitors");
  const [hoveredPoint, setHoveredPoint] = useState<TimeseriesPoint | null>(null);

  // Search & Pagination in Tables
  const [productSearch, setProductSearch] = useState<string>("");

  // Data States
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceDistribution | null>(null);
  const [searches, setSearches] = useState<{ topSearches: SearchRow[]; zeroResultSearches: SearchRow[] }>({
    topSearches: [],
    zeroResultSearches: [],
  });
  const [realtime, setRealtime] = useState<RealtimeResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Build query string based on active filters
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (period === "custom" && customFrom && customTo) {
      params.set("from", customFrom);
      params.set("to", customTo);
    }
    if (countryFilter) params.set("country", countryFilter);
    if (channelFilter) params.set("channel", channelFilter);
    if (deviceFilter) params.set("device", deviceFilter);
    return params.toString();
  }, [period, customFrom, customTo, countryFilter, channelFilter, deviceFilter]);

  // Load all analytics data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const qs = buildQueryString();

    try {
      const [
        overviewRes,
        timeseriesRes,
        funnelRes,
        productsRes,
        pagesRes,
        countriesRes,
        sourcesRes,
        devicesRes,
        searchesRes,
        realtimeRes,
      ] = await Promise.all([
        apiClient.get<OverviewResponse>(`/analytics/overview?${qs}`),
        apiClient.get<{ points: TimeseriesPoint[] }>(`/analytics/timeseries?${qs}&metric=${activeChartMetric}`),
        apiClient.get<{ steps: FunnelStep[] }>(`/analytics/funnel?${qs}`),
        apiClient.get<{ products: ProductRow[] }>(`/analytics/products?${qs}`),
        apiClient.get<{ pages: PageRow[] }>(`/analytics/pages?${qs}`),
        apiClient.get<{ countries: CountryRow[] }>(`/analytics/countries?${qs}`),
        apiClient.get<{ sources: SourceRow[] }>(`/analytics/sources?${qs}`),
        apiClient.get<DeviceDistribution>(`/analytics/devices?${qs}`),
        apiClient.get<{ topSearches: SearchRow[]; zeroResultSearches: SearchRow[] }>(`/analytics/searches?${qs}`),
        apiClient.get<RealtimeResponse>("/analytics/realtime"),
      ]);

      setOverview(overviewRes);
      setTimeseries(timeseriesRes.points || []);
      setFunnel(funnelRes.steps || []);
      setProducts(productsRes.products || []);
      setPages(pagesRes.pages || []);
      setCountries(countriesRes.countries || []);
      setSources(sourcesRes.sources || []);
      setDeviceStats(devicesRes);
      setSearches(searchesRes);
      setRealtime(realtimeRes);
    } catch (err: any) {
      setLoadError(err instanceof ApiError ? err.message : "Erreur de chargement des données analytiques.");
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, activeChartMetric]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Poll realtime metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const rt = await apiClient.get<RealtimeResponse>("/analytics/realtime");
        setRealtime(rt);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Trigger CSV Export
  const handleExport = (type: string) => {
    const qs = buildQueryString();
    window.open(`/api/v1/analytics/export?type=${type}&${qs}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Page Header & Realtime Badge ────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-ink">Analytics & Comportement Visiteurs</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {realtime ? `${realtime.activeVisitorsNow} en direct` : "Temps Réel"}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Analyse first-party confidentielle du trafic, de l'engagement produit et de la conversion e-commerce
          </p>
        </div>

        {/* Global Export & Refresh Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-ink hover:bg-surface-alt transition-colors shadow-2xs"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin text-primary")} />
            Actualiser
          </button>

          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink text-surface px-3.5 py-2 text-xs font-bold hover:bg-ink/90 transition-colors shadow-2xs"
            >
              <Download size={14} />
              Exporter CSV
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:block w-48 rounded-xl bg-white border border-border shadow-xl p-1 z-50 text-xs">
              <button
                type="button"
                onClick={() => handleExport("products")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt font-medium text-ink flex items-center justify-between"
              >
                Top Produits <ChevronRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleExport("pages")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt font-medium text-ink flex items-center justify-between"
              >
                Pages Consultées <ChevronRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleExport("countries")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt font-medium text-ink flex items-center justify-between"
              >
                Pays & Géographie <ChevronRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleExport("sources")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt font-medium text-ink flex items-center justify-between"
              >
                Sources & UTMs <ChevronRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleExport("searches")}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-alt font-medium text-ink flex items-center justify-between"
              >
                Recherches Internes <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Global Filter Bar ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <Filter size={14} className="text-primary" />
          Filtres Globaux
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Period Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-ink-muted mb-1">Période</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Country Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-ink-muted mb-1">Pays</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tous les pays</option>
              <option value="TN">🇹🇳 Tunisie</option>
              <option value="FR">🇫🇷 France</option>
              <option value="DZ">🇩🇿 Algérie</option>
              <option value="MA">🇲🇦 Maroc</option>
              <option value="LY">🇱🇾 Libye</option>
              <option value="DE">🇩🇪 Allemagne</option>
              <option value="IT">🇮🇹 Italie</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="US">🇺🇸 États-Unis</option>
            </select>
          </div>

          {/* Channel / Traffic Source Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-ink-muted mb-1">Canal d'Acquisition</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tous les canaux</option>
              <option value="direct">Accès Direct</option>
              <option value="organic_search">Google Organique</option>
              <option value="paid_search">Google Ads / CPC</option>
              <option value="social_facebook">Facebook</option>
              <option value="social_instagram">Instagram</option>
              <option value="social_tiktok">TikTok</option>
              <option value="referral">Sites Référents</option>
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-ink-muted mb-1">Appareil</label>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tous les appareils</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Ordinateur</option>
              <option value="tablet">Tablette</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker when "custom" is selected */}
        {period === "custom" && (
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Du :</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-border bg-surface-alt px-2.5 py-1 text-xs font-medium text-ink"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Au :</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-border bg-surface-alt px-2.5 py-1 text-xs font-medium text-ink"
              />
            </div>
            <button
              type="button"
              onClick={loadDashboard}
              className="rounded-lg bg-primary text-white px-3 py-1 text-xs font-bold hover:bg-primary/90"
            >
              Appliquer
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
          <AlertCircle size={16} />
          {loadError}
        </div>
      )}

      {/* ── 3. Top KPI Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visitors */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Visiteurs Totaux</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink">
              {overview?.kpis.visitors.current.toLocaleString() ?? "0"}
            </span>
            {overview && (
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-bold",
                  overview.kpis.visitors.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {overview.kpis.visitors.changePercent >= 0 ? "+" : ""}
                {overview.kpis.visitors.changePercent}%
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted flex items-center justify-between">
            <span>Uniques: {overview?.kpis.uniqueVisitors.current.toLocaleString() ?? 0}</span>
            <span>Rebond: {overview?.kpis.bounceRate.current ?? 0}%</span>
          </div>
        </div>

        {/* Page Views */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Pages Vues</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink">
              {overview?.kpis.pageViews.current.toLocaleString() ?? "0"}
            </span>
            {overview && (
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-bold",
                  overview.kpis.pageViews.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {overview.kpis.pageViews.changePercent >= 0 ? "+" : ""}
                {overview.kpis.pageViews.changePercent}%
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted flex items-center justify-between">
            <span>{overview?.kpis.avgPagesPerSession ?? 1} pages/session</span>
            <span>~{overview?.kpis.avgDurationSeconds ?? 0}s moy.</span>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Commandes Validées</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink">
              {overview?.kpis.orders.current.toLocaleString() ?? "0"}
            </span>
            {overview && (
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-bold",
                  overview.kpis.orders.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {overview.kpis.orders.changePercent >= 0 ? "+" : ""}
                {overview.kpis.orders.changePercent}%
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted flex items-center justify-between">
            <span>Taux conv: {overview?.kpis.conversionRate.current ?? 0}%</span>
            <span>Panier moy: {overview?.kpis.avgOrderValue.current ?? 0} DT</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Chiffre d'Affaires</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink">
              {overview?.kpis.revenue.current.toLocaleString() ?? "0"} <span className="text-sm font-bold">DT</span>
            </span>
            {overview && (
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-bold",
                  overview.kpis.revenue.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {overview.kpis.revenue.changePercent >= 0 ? "+" : ""}
                {overview.kpis.revenue.changePercent}%
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-ink-muted">
            vs {overview?.kpis.revenue.previous.toLocaleString() ?? 0} DT période préc.
          </div>
        </div>
      </div>

      {/* ── 4. Main Interactive Metric Timeseries Chart ─────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Évolution & Tendance Temporelle</h2>
            <p className="text-xs text-ink-muted">Visualisation interactive des métriques au fil du temps</p>
          </div>

          {/* Metric Switcher Tabs */}
          <div className="inline-flex items-center rounded-xl bg-surface-alt border border-border p-1 gap-1 flex-wrap">
            {METRIC_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeChartMetric === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveChartMetric(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                    isActive
                      ? "bg-white text-primary shadow-xs"
                      : "text-ink-muted hover:text-ink hover:bg-white/50"
                  )}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Interactive Area Chart */}
        <div className="relative h-64 w-full pt-4">
          {timeseries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">
              Aucune donnée pour la période sélectionnée
            </div>
          ) : (
            <svg
              className="h-full w-full overflow-visible"
              viewBox={`0 0 ${Math.max(100, (timeseries.length - 1) * 50)} 100`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="25" x2="100%" y2="25" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="100%" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="100%" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

              {/* Chart Path Logic */}
              {(() => {
                const maxVal = Math.max(...timeseries.map((t) => t.value), 1);
                const width = Math.max(100, (timeseries.length - 1) * 50);
                const stepX = timeseries.length > 1 ? width / (timeseries.length - 1) : 0;

                const points = timeseries.map((t, idx) => {
                  const x = idx * stepX;
                  const y = 95 - (t.value / maxVal) * 85;
                  return { x, y, item: t };
                });

                const pathData = points.reduce((acc, p, idx) => {
                  return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                }, "");

                const areaData = `${pathData} L ${points[points.length - 1]?.x ?? 0} 95 L 0 95 Z`;

                return (
                  <>
                    <path d={areaData} fill="url(#areaGradient)" />
                    <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        className="fill-white stroke-emerald-600 stroke-2 hover:r-6 hover:stroke-emerald-700 transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(p.item)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </>
                );
              })()}
            </svg>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 rounded-xl bg-ink/90 backdrop-blur-xs text-white p-3 text-xs shadow-xl pointer-events-none z-10 space-y-1 animate-in fade-in duration-150">
              <div className="font-bold border-b border-white/20 pb-1">{hoveredPoint.date}</div>
              <div className="flex justify-between gap-4">
                <span className="text-white/80">Valeur :</span>
                <span className="font-bold text-emerald-400">
                  {hoveredPoint.value} {activeChartMetric === "revenue" ? "DT" : ""}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[11px] text-white/70">
                <span>Visiteurs : {hoveredPoint.visitors}</span>
                <span>Commandes : {hoveredPoint.orders}</span>
              </div>
            </div>
          )}
        </div>

        {/* Date labels axis */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-ink-muted border-t border-border/50 pt-2 px-1">
          {timeseries.slice(0, 8).map((t, idx) => (
            <span key={idx}>{t.label}</span>
          ))}
        </div>
      </div>

      {/* ── 5. Funnel & Device Distributions ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Conversion Funnel (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">Entonnoir de Conversion E-Commerce</h2>
            <p className="text-xs text-ink-muted">Visualisation des 5 étapes du parcours d'achat et des déperditions</p>
          </div>

          <div className="space-y-3">
            {funnel.map((step) => (
              <div key={step.step} className="rounded-xl border border-border/60 bg-surface-alt p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px]">
                      {step.step}
                    </span>
                    <span>{step.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-ink">{step.count.toLocaleString()}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {step.overallConversion}% du total
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full rounded-full bg-border/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(5, step.overallConversion)}%` }}
                  />
                </div>

                {step.step > 1 && (
                  <div className="flex items-center justify-between text-[11px] text-ink-muted pt-0.5">
                    <span>Conv. étape préc.: {step.conversionFromPrevious}%</span>
                    <span className="text-rose-500 font-semibold">Abandon: {step.dropOffRate}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Device & Browser Distribution (1 Col) */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-ink">Appareils & Navigateurs</h2>
            <p className="text-xs text-ink-muted">Répartition technique du trafic visiteur</p>
          </div>

          {/* Devices */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink">Appareils</span>
            {deviceStats?.devices.map((d) => (
              <div key={d.device} className="space-y-1">
                <div className="flex justify-between text-xs text-ink font-medium">
                  <span className="capitalize">{d.device}</span>
                  <span className="font-bold">{d.percent}% ({d.count})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${d.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Browsers */}
          <div className="space-y-2 border-t border-border/60 pt-4">
            <span className="text-xs font-bold text-ink">Navigateurs</span>
            {deviceStats?.browsers.slice(0, 4).map((b) => (
              <div key={b.browser} className="space-y-1">
                <div className="flex justify-between text-xs text-ink font-medium">
                  <span>{b.browser}</span>
                  <span className="font-bold">{b.percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${b.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Top Products Analytics Table ─────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-ink">Performance des Produits</h2>
            <p className="text-xs text-ink-muted">Vues, ajouts panier, commandes et revenus générés par produit</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-alt pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-alt/50">
                <th className="py-3 px-3">Produit</th>
                <th className="py-3 px-3">Prix</th>
                <th className="py-3 px-3 text-center">Vues</th>
                <th className="py-3 px-3 text-center">Ajouts Panier</th>
                <th className="py-3 px-3 text-center">Ventes</th>
                <th className="py-3 px-3 text-right">Revenu</th>
                <th className="py-3 px-3 text-right">Taux Conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-muted">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-alt">
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" sizes="40px" />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/produits/${p.slug}`}
                            target="_blank"
                            className="font-bold text-ink hover:text-primary transition-colors truncate block"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-ink-muted truncate block">
                            {p.brandName} · {p.categoryName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-ink whitespace-nowrap">{p.currentPriceTnd} DT</td>
                    <td className="py-3 px-3 text-center font-bold text-ink">{p.views.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-bold text-primary">{p.addToCart.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">{p.purchases.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-black text-ink whitespace-nowrap">
                      {p.revenueTnd.toLocaleString()} DT
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold",
                          p.conversionRate >= 3
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.conversionRate > 0
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-surface-alt text-ink-muted"
                        )}
                      >
                        {p.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 7. Top Pages & Traffic Sources Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Pages Table */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">Pages les Plus Visitées</h2>
            <p className="text-xs text-ink-muted">Analyse de l'engagement par page</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-alt/50">
                  <th className="py-2.5 px-3">Chemin</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Vues</th>
                  <th className="py-2.5 px-3 text-right">Durée Moy.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {pages.slice(0, 10).map((pg, idx) => (
                  <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-ink font-mono text-[11px] truncate max-w-xs">
                      {pg.pagePath}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-md bg-surface-alt px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                        {pg.pageType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-ink">{pg.views.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-ink-muted">{pg.avgDurationSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources & Campaigns */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">Sources de Trafic & Campagnes</h2>
            <p className="text-xs text-ink-muted">Attribution des ventes par canal marketing</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-alt/50">
                  <th className="py-2.5 px-3">Canal</th>
                  <th className="py-2.5 px-3 text-center">Visiteurs</th>
                  <th className="py-2.5 px-3 text-center">Commandes</th>
                  <th className="py-2.5 px-3 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sources.slice(0, 10).map((src, idx) => (
                  <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-ink">
                      {src.channel}
                      {src.utmCampaign !== "-" && (
                        <span className="block text-[10px] font-normal text-ink-muted">
                          Campagne: {src.utmCampaign}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-ink">{src.visitors.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{src.orders}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-ink">{src.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 8. Geographic Countries & Search Analytics Grid ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Countries */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">Répartition Géographique</h2>
            <p className="text-xs text-ink-muted">Visiteurs et commandes par pays</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-alt/50">
                  <th className="py-2.5 px-3">Pays</th>
                  <th className="py-2.5 px-3 text-center">Visiteurs</th>
                  <th className="py-2.5 px-3 text-center">Commandes</th>
                  <th className="py-2.5 px-3 text-right">Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {countries.map((c) => (
                  <tr key={c.countryCode} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-ink">
                      {c.country} ({c.countryCode})
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-ink">{c.visitors.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{c.orders}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-ink">{c.sharePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Search Analytics & Zero-Results */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink">Recherches Internes sur le Site</h2>
            <p className="text-xs text-ink-muted">Termes les plus cherchés et recherches sans résultat</p>
          </div>

          {/* Zero results alert if any */}
          {searches.zeroResultSearches.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs space-y-1">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle size={14} />
                Opportunités de Catalogue (0 Résultat) :
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {searches.zeroResultSearches.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200"
                  >
                    « {s.keyword} » ({s.count}x)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Searches List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-alt/50">
                  <th className="py-2.5 px-3">Terme Recherché</th>
                  <th className="py-2.5 px-3 text-center">Fréquence</th>
                  <th className="py-2.5 px-3 text-right">Résultats Moy.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {searches.topSearches.slice(0, 8).map((s, idx) => (
                  <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-ink">« {s.keyword} »</td>
                    <td className="py-2.5 px-3 text-center font-bold text-primary">{s.count}</td>
                    <td className="py-2.5 px-3 text-right text-ink-muted">{s.avgResults} produits</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
