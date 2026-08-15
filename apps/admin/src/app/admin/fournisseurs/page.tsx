"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Building2,
  Phone,
  Clock,
  ArrowUpDown,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  Truck,
  Award,
} from "lucide-react";
import type { PurchasePriceHistory } from "@/lib/types";
import { SupplierDrawer, type SupplierFormData } from "@/components/supplier-drawer";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";
import { apiClient, ApiError } from "@/lib/api-client";

/* ─── API response shapes ──────────────────────────────────────────────── */

interface ApiSupplierProduct {
  variant: { product: { name: string; brand: { name: string } } };
}

interface ApiSupplier {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxInfo: string | null;
  leadTimeDays: number | null;
  paymentTerms: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  supplierProducts: ApiSupplierProduct[];
}

interface ApiPurchasePriceHistory {
  id: string;
  variantId: string;
  supplierId: string;
  purchasePriceMillimes: number;
  effectiveFrom: string;
  variant: { product: { name: string } };
  supplier: { name: string };
}

function mapHistory(entry: ApiPurchasePriceHistory): PurchasePriceHistory {
  return {
    id: entry.id,
    supplierId: entry.supplierId,
    supplierName: entry.supplier.name,
    productId: entry.variantId,
    productName: entry.variant.product.name,
    purchasePrice: entry.purchasePriceMillimes / 1000,
    effectiveDate: entry.effectiveFrom,
  };
}

function brandsOf(supplier: ApiSupplier): string[] {
  return [...new Set(supplier.supplierProducts.map((sp) => sp.variant.product.brand.name))];
}

export default function FournisseursPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<"name" | "brands" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ApiSupplier | null>(null);
  const [editingHistory, setEditingHistory] = useState<PurchasePriceHistory[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ApiSupplier | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ApiSupplier | null>(null);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.get<ApiSupplier[]>("/suppliers");
      setSuppliers(data);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  /* KPIs */
  const activeCount = suppliers.filter((s) => s.isActive).length;
  const inactiveCount = suppliers.filter((s) => !s.isActive).length;
  const totalBrands = new Set(suppliers.flatMap(brandsOf)).size;
  const avgLeadTime =
    suppliers.filter((s) => s.leadTimeDays).reduce((sum, s) => sum + (s.leadTimeDays ?? 0), 0) /
    (suppliers.filter((s) => s.leadTimeDays).length || 1);

  const filtered = useMemo(() => {
    let list = [...suppliers];
    if (statusFilter !== "ALL") list = list.filter((s) => (statusFilter === "ACTIVE" ? s.isActive : !s.isActive));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.contactPerson ?? "").toLowerCase().includes(q) ||
          brandsOf(s).some((b) => b.toLowerCase().includes(q)),
      );
    }
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "brands") return (brandsOf(a).length - brandsOf(b).length) * dir;
      return ((a.isActive ? 0 : 1) - (b.isActive ? 0 : 1)) * dir;
    });
    return list;
  }, [suppliers, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const openEditDrawer = useCallback(async (supplier: ApiSupplier | null) => {
    setEditingSupplier(supplier);
    setEditingHistory([]);
    setDrawerOpen(true);
    if (supplier) {
      try {
        const history = await apiClient.get<ApiPurchasePriceHistory[]>(
          `/suppliers/purchase-price-history?supplierId=${supplier.id}`,
        );
        setEditingHistory(history.map(mapHistory));
      } catch {
        // Non-fatal — drawer still usable without price history.
      }
    }
  }, []);

  async function handleSave(data: SupplierFormData) {
    try {
      if (editingSupplier) {
        await apiClient.patch(`/suppliers/${editingSupplier.id}`, data);
        toast("success", "Fournisseur modifié.");
      } else {
        await apiClient.post("/suppliers", data);
        toast("success", "Fournisseur créé.");
      }
      await loadSuppliers();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible d'enregistrer le fournisseur");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/suppliers/${deleteTarget.id}`);
      toast("success", `Fournisseur « ${deleteTarget.name} » supprimé.`);
      await loadSuppliers();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible de supprimer ce fournisseur");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleToggleStatus() {
    if (!toggleTarget) return;
    try {
      await apiClient.patch(`/suppliers/${toggleTarget.id}`, { isActive: !toggleTarget.isActive });
      toast("success", `Fournisseur « ${toggleTarget.name} » ${!toggleTarget.isActive ? "activé" : "désactivé"}.`);
      await loadSuppliers();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible de changer le statut");
    } finally {
      setToggleTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink">Fournisseurs & Approvisionnement</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              {suppliers.length} laboratoires
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            {loadError ?? "Gestion des laboratoires partenaires, conditions commerciales et délais d'approvisionnement"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditDrawer(null)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus size={15} />
          + Nouveau Fournisseur
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-emerald-700 uppercase tracking-wider">Actifs</span>
            <Building2 size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 mt-1 tabular-nums">{activeCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Inactifs</span>
            <Building2 size={16} className="text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-ink mt-1 tabular-nums">{inactiveCount}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-primary">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-primary uppercase tracking-wider">Marques Couvertes</span>
            <Award size={16} className="text-primary" />
          </div>
          <p className="text-xl font-extrabold text-primary mt-1 tabular-nums">{totalBrands}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold text-blue-700 uppercase tracking-wider">Délai Moyen</span>
            <Truck size={16} className="text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">{Math.round(avgLeadTime) || 0} jours</p>
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
            placeholder="Nom, contact, marque…"
            className="w-full rounded-xl border border-border bg-surface-alt pl-9 pr-3 py-2 text-xs placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ACTIVE">Actifs uniquement</option>
          <option value="INACTIVE">Inactifs uniquement</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-alt">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
              <th className="py-3 px-4">
                <button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-ink transition-colors">
                  Fournisseur <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="py-3 px-4 hidden md:table-cell">Contact Direct</th>
              <th className="py-3 px-4 hidden lg:table-cell">Marques Distribuées</th>
              <th className="py-3 px-4 hidden lg:table-cell text-center">Produits</th>
              <th className="py-3 px-4 hidden sm:table-cell">Délai Livraison</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-faint font-semibold">
                  Aucun fournisseur ne correspond à ces critères.
                </td>
              </tr>
            )}
            {filtered.map((supplier) => {
              const brands = brandsOf(supplier);
              return (
                <tr key={supplier.id} className="hover:bg-soft-nude/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 size={15} />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-xs">{supplier.name}</p>
                        <p className="text-[0.625rem] text-ink-faint">{supplier.taxInfo || "Pas de matricule"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <div>
                      <p className="font-semibold text-ink">{supplier.contactPerson || "—"}</p>
                      <p className="text-[0.6875rem] text-ink-faint flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {supplier.phone || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {brands.length === 0 && <span className="text-ink-faint">—</span>}
                      {brands.map((b) => (
                        <span key={b} className="px-2 py-0.5 rounded-md bg-soft-nude text-ink-muted text-[0.625rem] font-semibold border border-border/40">
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden lg:table-cell text-center font-bold tabular-nums">
                    {supplier.supplierProducts.length}
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-xs text-ink-muted font-medium">
                      <Clock size={11} />
                      {supplier.leadTimeDays ? `${supplier.leadTimeDays} jours` : "—"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border ${
                      supplier.isActive
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-700 border-slate-500/20"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${supplier.isActive ? "bg-emerald-500 pulse-dot" : "bg-slate-400"}`} />
                      {supplier.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(supplier)}
                        className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-ink transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToggleTarget(supplier)}
                        className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-ink transition-colors"
                        title={supplier.isActive ? "Désactiver" : "Activer"}
                      >
                        {supplier.isActive ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(supplier)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer & Modals */}
      <SupplierDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingSupplier(null); setEditingHistory([]); }}
        supplier={editingSupplier ? { ...editingSupplier, brandsSupplied: brandsOf(editingSupplier) } : null}
        history={editingHistory}
        onSave={handleSave}
      />
      <ConfirmModal open={!!deleteTarget} title="Supprimer le fournisseur" description={`Supprimer définitivement « ${deleteTarget?.name} » ?`} confirmLabel="Supprimer" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmModal open={!!toggleTarget} title={toggleTarget?.isActive ? "Désactiver" : "Activer"} description={`Changer le statut de « ${toggleTarget?.name} » ?`} confirmLabel={toggleTarget?.isActive ? "Désactiver" : "Activer"} variant={toggleTarget?.isActive ? "warning" : "default"} onConfirm={handleToggleStatus} onCancel={() => setToggleTarget(null)} />
    </div>
  );
}
