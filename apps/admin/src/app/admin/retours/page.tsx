"use client";

import { useState, useMemo } from "react";
import {
  Search,
  RotateCcw,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Package,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";

/* ─── Types ────────────────────────────────────────────────────────────── */

type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED" | "EXCHANGED" | "CLOSED";

interface ReturnRequest {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  products: { productName: string; brand: string; quantity: number; unitPrice: number; reason: string }[];
  status: ReturnStatus;
  reason: string;
  conditionOnReturn?: string;
  customerNotes?: string;
  staffNotes?: string;
  refundValue: number;
  restockingDecision?: "RESTOCK" | "DAMAGED" | "DISPOSED";
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ────────────────────────────────────────────────────────── */

const RETURN_STATUS_MAP: Record<ReturnStatus, { label: string; bg: string; text: string }> = {
  REQUESTED: { label: "Demandé", bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-700" },
  APPROVED: { label: "Approuvé", bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-700" },
  REJECTED: { label: "Rejeté", bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-700" },
  RECEIVED: { label: "Reçu", bg: "bg-indigo-500/10 border-indigo-500/30", text: "text-indigo-700" },
  REFUNDED: { label: "Remboursé", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-700" },
  EXCHANGED: { label: "Échangé", bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-700" },
  CLOSED: { label: "Fermé", bg: "bg-slate-500/10 border-slate-500/30", text: "text-slate-700" },
};

const REASON_MAP: Record<string, string> = {
  WRONG_PRODUCT: "Mauvais produit",
  DEFECTIVE: "Défaut de fabrication",
  NOT_AS_DESCRIBED: "Ne correspond pas à la description",
  DAMAGED_IN_TRANSIT: "Endommagé pendant le transport",
  ALLERGY_REACTION: "Réaction allergique",
  CHANGED_MIND: "Changement d'avis",
  OTHER: "Autre",
};

const ALLOWED_TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED"],
  REJECTED: [],
  RECEIVED: ["REFUNDED", "EXCHANGED"],
  REFUNDED: ["CLOSED"],
  EXCHANGED: ["CLOSED"],
  CLOSED: [],
};

/* ─── Mock data ────────────────────────────────────────────────────────── */

const initialReturns: ReturnRequest[] = [
  {
    id: "ret1", orderReference: "CMD-2024-0832", customerName: "Fatma Mansour", customerPhone: "+216 55 678 901",
    products: [
      { productName: "Sensibio H2O 500ml", brand: "Bioderma", quantity: 1, unitPrice: 62.500, reason: "ALLERGY_REACTION" },
    ],
    status: "REQUESTED", reason: "ALLERGY_REACTION",
    customerNotes: "Rougeurs après 2 utilisations — peau très sensible",
    refundValue: 62.500, createdAt: "2026-08-07T10:00:00Z", updatedAt: "2026-08-07T10:00:00Z",
  },
  {
    id: "ret2", orderReference: "CMD-2024-0819", customerName: "Mohamed Sassi", customerPhone: "+216 73 456 789",
    products: [
      { productName: "CeraVe Cleanser 236ml", brand: "CeraVe", quantity: 2, unitPrice: 32.000, reason: "DAMAGED_IN_TRANSIT" },
      { productName: "Mineral 89 Sérum 30ml", brand: "Vichy", quantity: 1, unitPrice: 55.000, reason: "DAMAGED_IN_TRANSIT" },
    ],
    status: "APPROVED", reason: "DAMAGED_IN_TRANSIT",
    customerNotes: "Colis arrivé ouvert, 2 produits cassés",
    staffNotes: "Photos reçues — colis endommagé confirmé",
    refundValue: 119.000, createdAt: "2026-08-05T14:00:00Z", updatedAt: "2026-08-06T09:00:00Z",
  },
  {
    id: "ret3", orderReference: "CMD-2024-0805", customerName: "Amira Ben Salah", customerPhone: "+216 55 123 456",
    products: [
      { productName: "Effaclar Duo+ 40ml", brand: "La Roche-Posay", quantity: 1, unitPrice: 45.500, reason: "NOT_AS_DESCRIBED" },
    ],
    status: "RECEIVED", reason: "NOT_AS_DESCRIBED",
    conditionOnReturn: "Neuf, emballage d'origine",
    customerNotes: "Ne convient pas à ma peau, pas comme sur la description",
    staffNotes: "Produit reçu en bon état — remboursement validé",
    refundValue: 45.500, restockingDecision: "RESTOCK",
    createdAt: "2026-08-01T08:00:00Z", updatedAt: "2026-08-04T11:00:00Z",
  },
  {
    id: "ret4", orderReference: "CMD-2024-0798", customerName: "Youssef Trabelsi", customerPhone: "+216 71 234 567",
    products: [
      { productName: "Hydrating Cleanser 236ml", brand: "CeraVe", quantity: 1, unitPrice: 32.000, reason: "CHANGED_MIND" },
    ],
    status: "REJECTED", reason: "CHANGED_MIND",
    staffNotes: "Délai de retour dépassé (>14 jours)",
    refundValue: 0, createdAt: "2026-07-28T16:00:00Z", updatedAt: "2026-07-30T10:00:00Z",
  },
  {
    id: "ret5", orderReference: "CMD-2024-0840", customerName: "Nour Haddad", customerPhone: "+216 52 345 678",
    products: [
      { productName: "X30 Crème SPF50+ 50ml", brand: "SVR", quantity: 1, unitPrice: 52.000, reason: "DEFECTIVE" },
    ],
    status: "REFUNDED", reason: "DEFECTIVE",
    conditionOnReturn: "Produit defectueux — pompe cassée",
    staffNotes: "Remboursement effectué via CCP",
    refundValue: 52.000, restockingDecision: "DISPOSED",
    createdAt: "2026-07-20T09:00:00Z", updatedAt: "2026-07-25T14:00:00Z",
  },
];

export default function RetoursPage() {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequest[]>(initialReturns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<{ ret: ReturnRequest; action: ReturnStatus } | null>(null);

  /* KPIs */
  const requested = returns.filter((r) => r.status === "REQUESTED").length;
  const approved = returns.filter((r) => ["APPROVED", "RECEIVED"].includes(r.status)).length;
  const totalRefunded = returns.filter((r) => r.status === "REFUNDED").reduce((s, r) => s + r.refundValue, 0);
  const rejected = returns.filter((r) => r.status === "REJECTED").length;

  const filtered = useMemo(() => {
    let list = [...returns];
    if (statusFilter !== "ALL") list = list.filter((r) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.orderReference.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q) || r.products.some((p) => p.productName.toLowerCase().includes(q)));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [returns, search, statusFilter]);

  function handleTransition() {
    if (!transitionTarget) return;
    const { ret, action } = transitionTarget;
    setReturns((prev) => prev.map((r) => r.id === ret.id ? { ...r, status: action, updatedAt: new Date().toISOString() } : r));
    toast("success", `Retour ${ret.orderReference} → ${RETURN_STATUS_MAP[action].label}`);
    setTransitionTarget(null);
    if (selectedReturn?.id === ret.id) {
      setSelectedReturn((prev) => prev ? { ...prev, status: action, updatedAt: new Date().toISOString() } : null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink">Service Clients & Retours</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              {returns.length} demandes
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Traitement des demandes de retour, vérifications cosmétiques et avoirs
          </p>
        </div>
      </div>

      {/* Modern KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 border-l-2 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-amber-700 uppercase tracking-wider">À Traiter</span>
            <ShieldAlert size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 mt-1 tabular-nums">{requested}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-blue-700 uppercase tracking-wider">En Cours</span>
            <RotateCcw size={16} className="text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">{approved}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-emerald-700 uppercase tracking-wider">Total Remboursé</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-1 tabular-nums">{formatCurrency(totalRefunded)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Rejetés</span>
            <XCircle size={16} className="text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-ink mt-1 tabular-nums">{rejected}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Commande, client, produit…"
            className="w-full rounded-xl border border-border bg-surface-alt pl-9 pr-3 py-2 text-xs placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none">
          <option value="ALL">Tous les statuts</option>
          {Object.entries(RETURN_STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Returns table + detail */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Table */}
        <div className="rounded-xl border border-border bg-surface-alt overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
                <th className="py-3 px-4">Commande</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 hidden md:table-cell">Produit(s)</th>
                <th className="py-3 px-4 text-right">Remboursement</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((ret) => {
                const statusInfo = RETURN_STATUS_MAP[ret.status];
                return (
                  <tr
                    key={ret.id}
                    className={`cursor-pointer hover:bg-soft-nude/30 transition-colors ${selectedReturn?.id === ret.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedReturn(ret)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{ret.orderReference}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-ink">{ret.customerName}</p>
                        <p className="text-[0.625rem] text-ink-faint">{timeAgo(ret.createdAt)}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-ink-muted">
                      {ret.products.length} produit{ret.products.length > 1 ? "s" : ""}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-ink">{formatCurrency(ret.refundValue)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ALLOWED_TRANSITIONS[ret.status].length > 0 && (
                        <button type="button" className="p-1 rounded-lg hover:bg-soft-nude text-ink-muted" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selectedReturn && (
          <div className="rounded-2xl border border-border bg-surface-alt p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-ink">{selectedReturn.orderReference}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border ${RETURN_STATUS_MAP[selectedReturn.status].bg} ${RETURN_STATUS_MAP[selectedReturn.status].text}`}>
                {RETURN_STATUS_MAP[selectedReturn.status].label}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-muted">Client</p>
              <p className="font-bold text-ink">{selectedReturn.customerName}</p>
              <p className="text-ink-muted">{selectedReturn.customerPhone}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-muted">Articles Concernés</p>
              {selectedReturn.products.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div>
                    <p className="font-bold text-ink">{p.productName}</p>
                    <p className="text-[0.625rem] text-ink-faint">{p.brand} • {p.quantity} unité(s)</p>
                  </div>
                  <p className="font-bold tabular-nums text-ink">{formatCurrency(p.unitPrice * p.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-muted">Motif de retour</p>
              <p className="font-semibold text-primary">{REASON_MAP[selectedReturn.reason] ?? selectedReturn.reason}</p>
            </div>

            {selectedReturn.customerNotes && (
              <div className="space-y-1 text-xs">
                <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-ink-muted">Remarque Client</p>
                <p className="bg-soft-nude/50 rounded-xl p-2.5 text-ink-muted">{selectedReturn.customerNotes}</p>
              </div>
            )}

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Valeur Remboursement :</span>
              <span className="text-sm font-extrabold text-primary tabular-nums">{formatCurrency(selectedReturn.refundValue)}</span>
            </div>

            {/* Actions */}
            {ALLOWED_TRANSITIONS[selectedReturn.status].length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border/60">
                {ALLOWED_TRANSITIONS[selectedReturn.status].map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setTransitionTarget({ ret: selectedReturn, action })}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-xs"
                  >
                    Passer à {RETURN_STATUS_MAP[action].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transition confirmation */}
      <ConfirmModal
        open={!!transitionTarget}
        title={transitionTarget ? RETURN_STATUS_MAP[transitionTarget.action].label : ""}
        description={
          transitionTarget
            ? `Confirmer la mise à jour pour ${transitionTarget.ret.orderReference} ?`
            : ""
        }
        confirmLabel={transitionTarget ? RETURN_STATUS_MAP[transitionTarget.action].label : "Confirmer"}
        variant={transitionTarget?.action === "REJECTED" ? "danger" : "default"}
        onConfirm={handleTransition}
        onCancel={() => setTransitionTarget(null)}
      />
    </div>
  );
}
