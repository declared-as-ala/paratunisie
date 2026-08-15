"use client";

import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { ORDER_STATUS_MAP, type OrderStatus } from "@/lib/types";

export type FinancialStatusFilter = "ALL" | "CONFIRMEE" | "EN_ATTENTE" | "TENTATIVE_CONTACT" | "ANNULEE" | "LIVREE";

const FINANCIAL_FILTER_LABELS: Record<FinancialStatusFilter, string> = {
  ALL: "Toutes les commandes",
  CONFIRMEE: "Confirmées",
  EN_ATTENTE: "En attente",
  TENTATIVE_CONTACT: "Tentatives",
  ANNULEE: "Annulées",
  LIVREE: "Livrées",
};
const FINANCIAL_FILTER_OPTIONS: FinancialStatusFilter[] = ["ALL", "CONFIRMEE", "EN_ATTENTE", "TENTATIVE_CONTACT", "ANNULEE", "LIVREE"];

export interface ProfitabilityOrderRow {
  orderId: string;
  reference: string;
  customerName: string;
  date: string;
  itemCount: number;
  caMillimes: number;
  coutMillimes: number;
  gainMillimes: number | null;
  tauxMarge: number | null;
  status: OrderStatus;
  contribution: "eligible" | "excluded";
  reason: string | null;
}

interface ProfitabilityOrdersTableProps {
  rows: ProfitabilityOrderRow[];
  page: number;
  totalPages: number;
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  financialFilter: FinancialStatusFilter;
  onFinancialFilterChange: (filter: FinancialStatusFilter) => void;
}

export function ProfitabilityOrdersTable({
  rows,
  page,
  totalPages,
  total,
  search,
  onSearchChange,
  onPageChange,
  financialFilter,
  onFinancialFilterChange,
}: ProfitabilityOrdersTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">Rentabilité par commande</h2>
            <p className="text-xs text-ink-muted mt-0.5">{total} commande(s) sur la période sélectionnée</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Client, référence…"
              className="w-full rounded-lg border border-border bg-background pl-8 pr-2.5 py-1.5 text-xs placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-faint mr-1">Statut financier</span>
          {FINANCIAL_FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFinancialFilterChange(f)}
              className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold transition-all ${
                financialFilter === f ? "bg-primary text-white shadow-xs" : "bg-soft-nude text-ink-muted hover:text-ink"
              }`}
            >
              {FINANCIAL_FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
              <th className="py-2.5 px-3">Commande</th>
              <th className="py-2.5 px-3">Client</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3 text-right">Articles</th>
              <th className="py-2.5 px-3 text-right">CA produits</th>
              <th className="py-2.5 px-3 text-right">Coût achat</th>
              <th className="py-2.5 px-3 text-right">Gain</th>
              <th className="py-2.5 px-3 text-right">Marge</th>
              <th className="py-2.5 px-3">Statut</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-ink-faint font-semibold">
                  Aucune commande sur cette période.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const statusInfo = ORDER_STATUS_MAP[row.status];
              const isExcluded = row.contribution === "excluded";
              return (
                <tr key={row.orderId} className={`hover:bg-soft-nude/30 transition-colors ${isExcluded ? "opacity-70" : ""}`}>
                  <td className="py-2.5 px-3 font-mono font-semibold text-primary">{row.reference}</td>
                  <td className="py-2.5 px-3 font-semibold text-ink">{row.customerName}</td>
                  <td className="py-2.5 px-3 text-ink-muted">{formatDate(row.date)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{row.itemCount}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(row.caMillimes / 1000)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(row.coutMillimes / 1000)}</td>
                  <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${row.gainMillimes !== null ? "text-success" : "text-ink-faint"}`}>
                    {row.gainMillimes !== null ? formatCurrency(row.gainMillimes / 1000) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums" title={row.tauxMarge === null ? "Impossible à calculer : coût d'achat manquant." : undefined}>
                    {row.tauxMarge !== null ? formatPercent(row.tauxMarge) : "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${statusInfo?.badge ?? "badge-neutral"}`}>
                      {statusInfo?.label ?? row.status}
                    </span>
                    {row.reason && <p className="mt-0.5 text-[0.625rem] text-ink-faint">{row.reason}</p>}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link href={`/admin/commandes?view=${row.orderId}`} className="text-[0.6875rem] font-bold text-primary hover:underline">
                      Voir
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-[0.6875rem] text-ink-faint">Page {page} / {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg border border-border text-ink-muted hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg border border-border text-ink-muted hover:text-ink disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
