"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Truck,
  AlertTriangle,
  TrendingDown,
  Tag,
  Zap,
} from "lucide-react";
import { formatCurrency, formatPercent, calculateMargin, marginWarningClass } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";

/* ─── Types ────────────────────────────────────────────────────────────── */

type PromoType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
type PromoStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED";

interface Promotion {
  id: string;
  name: string;
  code: string;
  type: PromoType;
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  scopeType?: "ALL" | "CATEGORY" | "BRAND" | "PRODUCT";
  scopeValue?: string;
  startsAt: string;
  endsAt: string;
  status: PromoStatus;
}

const PROMO_TYPE_MAP: Record<PromoType, { label: string; icon: React.ReactNode }> = {
  PERCENTAGE: { label: "Pourcentage", icon: <Percent size={12} /> },
  FIXED: { label: "Montant fixe", icon: <DollarSign size={12} /> },
  FREE_SHIPPING: { label: "Livraison gratuite", icon: <Truck size={12} /> },
};

const PROMO_STATUS_MAP: Record<PromoStatus, { label: string; bg: string; text: string }> = {
  ACTIVE: { label: "Active", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-700" },
  SCHEDULED: { label: "Planifiée", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-700" },
  EXPIRED: { label: "Expirée", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-700" },
  DISABLED: { label: "Désactivée", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700" },
};

const initialPromotions: Promotion[] = [
  {
    id: "promo1", name: "Bienvenue -15%", code: "BIENVENUE15", type: "PERCENTAGE", value: 15,
    minOrderAmount: 50.000, usageLimit: 200, usedCount: 87, startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-12-31T23:59:59Z", status: "ACTIVE",
  },
  {
    id: "promo2", name: "Summer Solaire", code: "SOLEIL2026", type: "PERCENTAGE", value: 20,
    scopeType: "CATEGORY", scopeValue: "Solaire", minOrderAmount: 80.000, usageLimit: 100, usedCount: 34,
    startsAt: "2026-06-01T00:00:00Z", endsAt: "2026-08-31T23:59:59Z", status: "ACTIVE",
  },
  {
    id: "promo3", name: "Fidélité Bioderma", code: "BIO10DT", type: "FIXED", value: 10.000,
    scopeType: "BRAND", scopeValue: "Bioderma", minOrderAmount: 60.000, usedCount: 12,
    startsAt: "2026-07-01T00:00:00Z", endsAt: "2026-09-30T23:59:59Z", status: "ACTIVE",
  },
  {
    id: "promo4", name: "Livraison offerte", code: "FREESHIP", type: "FREE_SHIPPING", value: 0,
    minOrderAmount: 99.000, usedCount: 156,
    startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-12-31T23:59:59Z", status: "ACTIVE",
  },
  {
    id: "promo5", name: "Black Friday 2025", code: "BF2025", type: "PERCENTAGE", value: 30,
    minOrderAmount: 100.000, usageLimit: 50, usedCount: 50,
    startsAt: "2025-11-25T00:00:00Z", endsAt: "2025-11-30T23:59:59Z", status: "EXPIRED",
  },
  {
    id: "promo6", name: "Aide Scolaire", code: "ECOLE2026", type: "PERCENTAGE", value: 10,
    scopeType: "CATEGORY", scopeValue: "Bébé", minOrderAmount: 40.000, usedCount: 0,
    startsAt: "2026-09-01T00:00:00Z", endsAt: "2026-09-30T23:59:59Z", status: "SCHEDULED",
  },
];

function MarginImpactPreview({ promo, avgCost }: { promo: Promotion; avgCost: number }) {
  const avgSellingPrice = 45.000;
  const promoPrice = promo.type === "PERCENTAGE"
    ? avgSellingPrice * (1 - promo.value / 100)
    : promo.type === "FIXED"
    ? avgSellingPrice - promo.value
    : avgSellingPrice;
  const margin = calculateMargin(avgCost, avgSellingPrice, promoPrice < avgSellingPrice ? promoPrice : undefined);
  const costTauxMarque = margin.tauxMarque;

  return (
    <div className="rounded-xl border border-border bg-surface-alt p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink text-xs">{promo.name}</span>
        <span className="text-[0.6875rem] font-mono text-primary font-bold">{promo.code}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/60">
        <div>
          <p className="text-[0.5625rem] text-ink-faint uppercase font-semibold">Prix après promo</p>
          <p className="text-xs font-bold tabular-nums text-ink">{formatCurrency(promoPrice)}</p>
        </div>
        <div>
          <p className="text-[0.5625rem] text-ink-faint uppercase font-semibold">Marge restante</p>
          <p className={`text-xs font-extrabold tabular-nums ${marginWarningClass(margin)}`}>
            {formatCurrency(margin.margeBrute)}
          </p>
        </div>
        <div>
          <p className="text-[0.5625rem] text-ink-faint uppercase font-semibold">Taux de marque</p>
          <p className={`text-xs font-extrabold tabular-nums ${marginWarningClass(margin)}`}>
            {formatPercent(costTauxMarque)}
          </p>
        </div>
      </div>
      {costTauxMarque < 15 && (
        <p className="text-[0.625rem] text-amber-600 flex items-center gap-1 font-semibold">
          <AlertTriangle size={10} /> Marge faible sous le seuil cible (15%)
        </p>
      )}
      {costTauxMarque <= 0 && (
        <p className="text-[0.625rem] text-rose-600 flex items-center gap-1 font-semibold">
          <TrendingDown size={10} /> Marge négative — perte commerciale
        </p>
      )}
    </div>
  );
}

export default function PromotionsPage() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Promotion | null>(null);

  const activeCount = promotions.filter((p) => p.status === "ACTIVE").length;
  const scheduledCount = promotions.filter((p) => p.status === "SCHEDULED").length;
  const expiredCount = promotions.filter((p) => p.status === "EXPIRED").length;

  const filtered = useMemo(() => {
    let list = [...promotions];
    if (statusFilter !== "ALL") list = list.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  }, [promotions, search, statusFilter]);

  function handleDelete() {
    if (!deleteTarget) return;
    setPromotions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast("success", `Promotion « ${deleteTarget.name} » supprimée.`);
    setDeleteTarget(null);
  }

  function handleToggle() {
    if (!toggleTarget) return;
    setPromotions((prev) => prev.map((p) => p.id === toggleTarget.id ? {
      ...p, status: p.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
    } : p));
    toast("success", `Promotion « ${toggleTarget.name} » ${toggleTarget.status === "ACTIVE" ? "désactivée" : "activée"}.`);
    setToggleTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink">Codes Promo & Offres Spéciales</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              {promotions.length} campagnes
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Gestion des réductions, remises et simulation d&apos;impact sur les marges
          </p>
        </div>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-all shadow-xs">
          <Plus size={15} />
          + Nouvelle Promotion
        </button>
      </div>

      {/* Modern KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-emerald-700 uppercase tracking-wider">Promotions Actives</span>
            <Tag size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-1 tabular-nums">{activeCount}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-blue-700 uppercase tracking-wider">Planifiées</span>
            <Zap size={16} className="text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">{scheduledCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Expirées / Inactives</span>
            <Tag size={16} className="text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-ink mt-1 tabular-nums">{expiredCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, code promo…" className="w-full rounded-xl border border-border bg-surface-alt pl-9 pr-3 py-2 text-xs placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none">
          <option value="ALL">Tous les statuts</option>
          {Object.entries(PROMO_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-alt">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
              <th className="py-3 px-4">Offre / Code</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Valeur</th>
              <th className="py-3 px-4 hidden md:table-cell">Portée</th>
              <th className="py-3 px-4 hidden lg:table-cell text-center">Utilisations</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((promo) => {
              const typeInfo = PROMO_TYPE_MAP[promo.type];
              const statusInfo = PROMO_STATUS_MAP[promo.status];
              return (
                <tr key={promo.id} className="hover:bg-soft-nude/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-bold text-ink text-xs">{promo.name}</p>
                      <span className="font-mono text-[0.6875rem] font-bold text-primary">{promo.code}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs text-ink-muted font-medium">
                      {typeInfo.icon}
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-ink tabular-nums">
                    {promo.type === "PERCENTAGE" ? `-${promo.value}%` : promo.type === "FIXED" ? `-${formatCurrency(promo.value)}` : "Gratuite"}
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    {promo.scopeType && promo.scopeType !== "ALL" ? (
                      <span className="px-2 py-0.5 rounded-md bg-soft-nude text-ink-muted text-[0.625rem] font-semibold border border-border/40">
                        {promo.scopeValue}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-faint">Tout le catalogue</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 hidden lg:table-cell text-center font-bold tabular-nums">
                    {promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ""}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => setToggleTarget(promo)} className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted">
                        {promo.status === "ACTIVE" ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(promo)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Margin Impact Widget */}
      <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">Simulation d&apos;Impact sur les Marges (Offres Actives)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.filter((p) => p.status === "ACTIVE" && p.type === "PERCENTAGE").map((promo) => (
            <MarginImpactPreview key={promo.id} promo={promo} avgCost={28.000} />
          ))}
        </div>
      </div>

      <ConfirmModal open={!!deleteTarget} title="Supprimer la promotion" description={`Supprimer « ${deleteTarget?.name} » ?`} confirmLabel="Supprimer" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmModal open={!!toggleTarget} title={toggleTarget?.status === "ACTIVE" ? "Désactiver" : "Activer"} description={`Changer le statut de « ${toggleTarget?.name} » ?`} confirmLabel={toggleTarget?.status === "ACTIVE" ? "Désactiver" : "Activer"} variant={toggleTarget?.status === "ACTIVE" ? "warning" : "default"} onConfirm={handleToggle} onCancel={() => setToggleTarget(null)} />
    </div>
  );
}
