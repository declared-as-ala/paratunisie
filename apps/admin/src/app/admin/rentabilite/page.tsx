"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Percent, ShoppingCart, Receipt, Info, ListChecks } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { apiClient, ApiError } from "@/lib/api-client";
import { onOrdersChanged } from "@/lib/order-events";
import { PeriodFilter, resolvePeriodRange, statusScopeToStatuses, type PeriodPreset, type StatusScope } from "./period-filter";
import { ProfitabilityChart, type ProfitabilitySeriesPoint } from "./profitability-chart";
import { ProductProfitabilityPanel, type ProductProfitabilityRow } from "./product-profitability-panel";
import { ProductsMissingCostPanel, type ProductMissingCostRow } from "./products-missing-cost-panel";
import { ProfitabilityOrdersTable, type ProfitabilityOrderRow, type FinancialStatusFilter } from "./profitability-orders-table";

interface OrderCounts {
  total: number;
  contributing: number;
  confirmed: number;
  pending: number;
  tentative: number;
  cancelled: number;
  refused: number;
  livree: number;
}

interface OverviewResponse {
  orderCounts: OrderCounts;
  kpis: {
    caConfirmeeMillimes: number;
    caEligibleMillimes: number;
    coutAchatMillimes: number;
    gainEstimeMillimes: number | null;
    tauxMarge: number | null;
    commandesConfirmees: number;
    panierMoyenMillimes: number;
    costCoverage: number;
    itemsWithCost: number;
    itemsTotal: number;
  };
  series: { date: string; caMillimes: number; coutMillimes: number; gainMillimes: number; hasEligibleData: boolean }[];
  productProfitability: ProductProfitabilityRow[];
  productsMissingCost: ProductMissingCostRow[];
}

interface OrdersResponse {
  rows: ProfitabilityOrderRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 15;

const FINANCIAL_FILTER_TO_STATUSES: Record<FinancialStatusFilter, string[] | undefined> = {
  ALL: undefined, // backend defaults "ALL" (omitted statuses) to every real status for this endpoint
  CONFIRMEE: ["CONFIRMEE"],
  EN_ATTENTE: ["EN_ATTENTE"],
  TENTATIVE_CONTACT: ["TENTATIVE_CONTACT"],
  ANNULEE: ["ANNULEE"],
  LIVREE: ["LIVREE"],
};

export default function RentabilitePage() {
  const [preset, setPreset] = useState<PeriodPreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [statusScope, setStatusScope] = useState<StatusScope>("CONFIRMEE");
  const [financialFilter, setFinancialFilter] = useState<FinancialStatusFilter>("CONFIRMEE");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [orders, setOrders] = useState<OrdersResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => resolvePeriodRange(preset, customFrom, customTo), [preset, customFrom, customTo]);
  const statuses = useMemo(() => statusScopeToStatuses(statusScope), [statusScope]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const periodParams = `from=${range.from.toISOString()}&to=${range.to.toISOString()}`;
    const overviewParams = `${periodParams}&statuses=${statuses.join(",")}`;
    const orderStatuses = FINANCIAL_FILTER_TO_STATUSES[financialFilter];
    const ordersParams =
      `${periodParams}${orderStatuses ? `&statuses=${orderStatuses.join(",")}` : ""}` +
      `&page=${page}&pageSize=${PAGE_SIZE}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    try {
      const [overviewData, ordersData] = await Promise.all([
        apiClient.get<OverviewResponse>(`/profitability/overview?${overviewParams}`),
        apiClient.get<OrdersResponse>(`/profitability/orders?${ordersParams}`),
      ]);
      setOverview(overviewData);
      setOrders(ordersData);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger la rentabilité");
    } finally {
      setLoading(false);
    }
    // range/statuses are derived from preset/customFrom/customTo/statusScope — depending on those primitives
    // avoids re-fetching on every render from a new Date object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customFrom, customTo, statusScope, financialFilter, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Refetch when an order is created/confirmed/cancelled elsewhere (Commandes
  // page) — no manual page reload needed to see updated totals.
  useEffect(() => onOrdersChanged(load), [load]);

  // Reset to page 1 whenever the period/status/search changes (not on page changes themselves).
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, customFrom, customTo, statusScope, financialFilter, search]);

  const chartSeries: ProfitabilitySeriesPoint[] =
    overview?.series.map((d) => ({
      label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      caDT: d.caMillimes / 1000,
      coutDT: d.coutMillimes / 1000,
      gainDT: d.gainMillimes / 1000,
      incomplete: !d.hasEligibleData,
    })) ?? [];

  const periodLabelText = `${range.from.toLocaleDateString("fr-FR")} → ${range.to.toLocaleDateString("fr-FR")}`;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
            <Wallet size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">Rentabilité</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              {loadError ?? "Gain estimé sur commandes confirmées — CA moins coût d'achat des produits"}
            </p>
          </div>
        </div>
      </div>

      <PeriodFilter
        preset={preset}
        onPresetChange={setPreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        statusScope={statusScope}
        onStatusScopeChange={setStatusScope}
      />

      {/* Order-context summary — orders always shown, never hidden just because
          they don't contribute to gain (REQUIREMENTS.md §5/§23). */}
      {overview && (
        <div className="rounded-2xl border border-border bg-surface-alt p-4 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-2.5">
            <ListChecks size={13} className="text-ink-faint" />
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-faint">Contexte des commandes de la période</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <ContextStat label="Total" value={overview.orderCounts.total} />
            <ContextStat label="Confirmées" value={overview.orderCounts.confirmed} accent="text-success" />
            <ContextStat label="En attente" value={overview.orderCounts.pending} />
            <ContextStat label="Tentatives" value={overview.orderCounts.tentative} />
            <ContextStat label="Annulées" value={overview.orderCounts.cancelled} accent="text-danger" />
            <ContextStat label="Livrées" value={overview.orderCounts.livree} />
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KpiCard label="CA confirmé" value={formatCurrency((overview?.kpis.caConfirmeeMillimes ?? 0) / 1000)} icon={Receipt} accent="text-primary" />
        <KpiCard label="Coût d'achat" value={formatCurrency((overview?.kpis.coutAchatMillimes ?? 0) / 1000)} icon={TrendingDown} accent="text-ink-muted" />
        <KpiCard
          label="Gain estimé"
          value={overview?.kpis.gainEstimeMillimes != null ? formatCurrency(overview.kpis.gainEstimeMillimes / 1000) : "—"}
          icon={TrendingUp}
          accent="text-success"
          title={overview?.kpis.gainEstimeMillimes == null ? "Impossible à calculer : coût d'achat manquant." : undefined}
        />
        <KpiCard
          label="Taux de marge"
          value={overview?.kpis.tauxMarge != null ? formatPercent(overview.kpis.tauxMarge) : "—"}
          icon={Percent}
          accent="text-primary"
          title={overview?.kpis.tauxMarge == null ? "Impossible à calculer : coût d'achat manquant." : undefined}
        />
        <KpiCard label="Commandes" value={`${overview?.kpis.commandesConfirmees ?? 0}`} icon={ShoppingCart} accent="text-ink-muted" />
        <KpiCard label="Contribuant au gain" value={`${overview?.orderCounts.contributing ?? 0}`} icon={ListChecks} accent="text-success" />
        <KpiCard label="Panier moyen" value={formatCurrency((overview?.kpis.panierMoyenMillimes ?? 0) / 1000)} icon={Wallet} accent="text-primary" />
      </div>

      {overview && overview.kpis.costCoverage < 1 && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-info-bg bg-info-bg/60 px-3.5 py-2.5 text-xs text-ink sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-info shrink-0 mt-0.5" />
            <span>
              Le gain estimé est calculé uniquement sur les articles dont le coût d&apos;achat est connu — pas sur l&apos;ensemble des ventes.
            </span>
          </div>
          <span className="font-semibold whitespace-nowrap">
            Articles avec coût renseigné : {overview.kpis.itemsWithCost} / {overview.kpis.itemsTotal} ({Math.round(overview.kpis.costCoverage * 100)}%)
          </span>
        </div>
      )}

      <ProfitabilityChart data={chartSeries} periodLabel={periodLabelText} />

      {overview && <ProductProfitabilityPanel products={overview.productProfitability} />}

      {overview && overview.productsMissingCost.length > 0 && (
        <ProductsMissingCostPanel products={overview.productsMissingCost} />
      )}

      {orders && (
        <ProfitabilityOrdersTable
          rows={orders.rows}
          page={orders.page}
          totalPages={orders.totalPages}
          total={orders.total}
          search={search}
          onSearchChange={setSearch}
          onPageChange={setPage}
          financialFilter={financialFilter}
          onFinancialFilterChange={setFinancialFilter}
        />
      )}

      {loading && !overview && <p className="text-xs text-ink-faint text-center py-8">Chargement de la rentabilité…</p>}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  title,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  accent: string;
  title?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt p-3.5 shadow-2xs" title={title}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint truncate">{label}</span>
        <Icon size={14} className={accent} />
      </div>
      <p className="text-lg font-extrabold text-ink tabular-nums">{value}</p>
    </div>
  );
}

function ContextStat({ label, value, accent = "text-ink" }: { label: string; value: number; accent?: string }) {
  return (
    <div>
      <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`text-sm font-extrabold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}
