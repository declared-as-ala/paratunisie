"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { MarqueDrawer, type BrandModel } from "@/components/marque-drawer";
import { ConfirmModal } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import { apiClient, ApiError } from "@/lib/api-client";

export default function MarquesAdminPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<BrandModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [featuredFilter, setFeaturedFilter] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandModel | null>(null);
  const [blockedDeleteTarget, setBlockedDeleteTarget] = useState<BrandModel | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.get<BrandModel[]>("/catalogue/brands");
      setBrands(data);
    } catch (error) {
      setBrands([]);
      setLoadError(error instanceof ApiError ? error.message : "Impossible de charger les marques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void loadBrands(), 0);
    return () => window.clearTimeout(task);
  }, [loadBrands]);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();
    return brands.filter((brand) => {
      const matchesQuery =
        !query ||
        brand.name.toLowerCase().includes(query) ||
        brand.slug.toLowerCase().includes(query) ||
        brand.origin?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || brand.status === statusFilter;
      const matchesFeatured = featuredFilter === "ALL" || Boolean(brand.featured);
      return matchesQuery && matchesStatus && matchesFeatured;
    });
  }, [brands, search, statusFilter, featuredFilter]);

  const visibleIds = useMemo(() => filteredBrands.map((b) => b.id), [filteredBrands]);
  const visibleSelectedCount = useMemo(
    () => visibleIds.reduce((count, id) => count + (selectedIds.has(id) ? 1 : 0), 0),
    [visibleIds, selectedIds],
  );
  const allVisibleSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldSelect = visibleIds.some((id) => !next.has(id));
      visibleIds.forEach((id) => (shouldSelect ? next.add(id) : next.delete(id)));
      return next;
    });
  }, [visibleIds]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await apiClient.post("/catalogue/brands/bulk-delete", { ids });
      setBrands((current) => current.filter((b) => !selectedIds.has(b.id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast("success", `${ids.length} marque(s) supprimée(s) avec succès`);
    } catch (error) {
      toast("error", error instanceof ApiError ? error.message : "Échec de la suppression groupée");
    }
  }, [selectedIds, toast]);

  const stats = useMemo(
    () => ({
      total: brands.length,
      active: brands.filter((brand) => brand.status === "ACTIVE").length,
      iconic: brands.filter((brand) => brand.featured).length,
      draft: brands.filter((brand) => brand.status === "DRAFT").length,
    }),
    [brands],
  );

  const handleSaveBrand = useCallback(
    async (brand: BrandModel) => {
      const isNew = brand.id === "NEW-BRAND";
      const saved = isNew
        ? await apiClient.post<BrandModel>("/catalogue/brands", brand)
        : await apiClient.patch<BrandModel>(`/catalogue/brands/${brand.id}`, brand);

      setBrands((current) => {
        if (isNew) return [...current, saved].sort((a, b) => a.name.localeCompare(b.name, "fr"));
        return current.map((item) => (item.id === saved.id ? saved : item));
      });
      toast("success", `Marque « ${saved.name} » enregistrée avec succès`);
      setDrawerOpen(false);
      setEditingBrand(null);
    },
    [toast],
  );

  const handleDeleteAttempt = useCallback((brand: BrandModel) => {
    if ((brand.productCount ?? 0) > 0) setBlockedDeleteTarget(brand);
    else setDeleteTarget(brand);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/catalogue/brands/${deleteTarget.id}`);
      setBrands((current) => current.filter((brand) => brand.id !== deleteTarget.id));
      toast("success", `Marque « ${deleteTarget.name} » supprimée`);
      setDeleteTarget(null);
    } catch (error) {
      toast("error", error instanceof ApiError ? error.message : "La suppression a échoué.");
    }
  }, [deleteTarget, toast]);

  return (
    <div className="min-h-screen space-y-6 bg-[#FFF5F5]/40 p-2 text-slate-800 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E11D48] text-white shadow-md">
            <Building2 size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#881337]">Marques</h1>
            <p className="mt-0.5 text-sm font-bold text-slate-700">{stats.total} marques réelles au catalogue</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Actives ({stats.active}) · Vitrine iconique ({stats.iconic}) · Brouillons ({stats.draft})
            </p>
          </div>
        </div>
        <button type="button" onClick={() => { setEditingBrand(null); setDrawerOpen(true); }} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#BE123C]">
          <Plus size={18} strokeWidth={3} aria-hidden="true" /> Ajouter une marque
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
        <div className="relative min-w-[240px] max-w-md flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une marque…" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-rose-500/20" />
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold outline-none focus:border-[#E11D48]">
          <option value="ALL">Tous les statuts ({stats.total})</option>
          <option value="ACTIVE">Actif ({stats.active})</option>
          <option value="DRAFT">Brouillon ({stats.draft})</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <select value={featuredFilter} onChange={(event) => setFeaturedFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold outline-none focus:border-[#E11D48]">
          <option value="ALL">Toutes les marques</option>
          <option value="FEATURED">Marques iconiques ({stats.iconic})</option>
        </select>
        <button type="button" onClick={() => void loadBrands()} disabled={loading} className="flex size-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#E11D48] disabled:cursor-not-allowed" aria-label="Actualiser les marques">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />
        </button>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex items-center gap-2"><AlertCircle size={16} aria-hidden="true" />{loadError}</span>
          <button type="button" onClick={() => void loadBrands()} className="min-h-11 font-bold underline">Réessayer</button>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <p className="text-sm font-bold text-rose-900">{selectedIds.size} marque{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedIds(new Set())} className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-rose-100">Annuler la sélection</button>
            <button type="button" onClick={() => setBulkDeleteOpen(true)} className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700"><Trash2 className="mr-2 inline size-4" />Supprimer la sélection</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-rose-50/30 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" checked={allVisibleSelected} disabled={visibleIds.length === 0} onChange={toggleAllVisible} aria-label="Sélectionner toutes les marques visibles" className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed" />
                </th>
                <th className="px-4 py-3.5">Marque</th>
                <th className="px-4 py-3.5">Slug URL</th>
                <th className="px-4 py-3.5 text-center">Produits réels</th>
                <th className="px-4 py-3.5">Positionnement</th>
                <th className="px-4 py-3.5">Vitrine</th>
                <th className="px-4 py-3.5">Statut</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr><td colSpan={8} className="py-14 text-center"><LoaderCircle className="mx-auto size-6 animate-spin text-[#E11D48]" aria-label="Chargement" /></td></tr>
              ) : filteredBrands.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-500">Aucune marque enregistrée.</td></tr>
              ) : filteredBrands.map((brand) => (
                <tr key={brand.id} className={`transition-colors ${selectedIds.has(brand.id) ? "bg-rose-50/70" : "hover:bg-rose-50/20"}`}>
                  <td className="py-3.5 px-4">
                    <input type="checkbox" checked={selectedIds.has(brand.id)} onChange={() => toggleOne(brand.id)} aria-label={`Sélectionner ${brand.name}`} className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                  </td>
                  <td className="px-4 py-3.5"><div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                      {brand.logo ? <Image src={brand.logo} alt="" width={40} height={40} unoptimized className="size-full object-contain" /> : <span className="font-black text-[#E11D48]">{brand.name.slice(0, 2).toUpperCase()}</span>}
                    </div>
                    <div><p className="font-bold text-slate-900">{brand.name}</p><p className="mt-0.5 max-w-[210px] truncate text-[0.6875rem] text-slate-500">{brand.tagline || brand.origin || "—"}</p></div>
                  </div></td>
                  <td className="px-4 py-3.5 font-mono text-[0.6875rem]">/marques/{brand.slug}</td>
                  <td className="px-4 py-3.5 text-center font-black text-slate-900">{brand.productCount ?? 0} réf.</td>
                  <td className="px-4 py-3.5"><div className="flex max-w-xs flex-wrap gap-1">{(brand.specialties ?? []).slice(0, 2).map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[0.625rem] font-bold">{item}</span>)}</div></td>
                  <td className="px-4 py-3.5">{brand.featured ? <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[0.6875rem] font-bold text-amber-700"><Sparkles size={11} aria-hidden="true" /> Iconique</span> : "—"}</td>
                  <td className="px-4 py-3.5">{brand.status === "ACTIVE" ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[0.6875rem] font-semibold text-emerald-600"><CheckCircle2 size={12} aria-hidden="true" /> Actif</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{brand.status === "DRAFT" ? "Brouillon" : "Archivé"}</span>}</td>
                  <td className="px-4 py-3.5"><div className="flex justify-end gap-1 text-slate-400">
                    <button type="button" onClick={() => { setEditingBrand(brand); setDrawerOpen(true); }} className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700" aria-label={`Voir ${brand.name}`}><Eye size={16} /></button>
                    <button type="button" onClick={() => { setEditingBrand(brand); setDrawerOpen(true); }} className="flex size-10 items-center justify-center rounded-lg hover:bg-rose-50 hover:text-[#E11D48]" aria-label={`Modifier ${brand.name}`}><Pencil size={16} /></button>
                    <button type="button" onClick={() => handleDeleteAttempt(brand)} className="flex size-10 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700" aria-label={`Supprimer ${brand.name}`}><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MarqueDrawer key={editingBrand?.id ?? "new"} open={drawerOpen} brand={editingBrand} onClose={() => { setDrawerOpen(false); setEditingBrand(null); }} onSave={handleSaveBrand} />
      <ConfirmModal open={Boolean(blockedDeleteTarget)} title="Impossible de supprimer cette marque" description={`La marque « ${blockedDeleteTarget?.name} » possède ${blockedDeleteTarget?.productCount ?? 0} produit(s) réel(s). Réassignez-les avant de supprimer la marque.`} confirmLabel="Compris" variant="warning" onConfirm={() => setBlockedDeleteTarget(null)} onCancel={() => setBlockedDeleteTarget(null)} />
      <ConfirmModal open={Boolean(deleteTarget)} title="Supprimer la marque ?" description={`Voulez-vous vraiment supprimer « ${deleteTarget?.name} » ?`} confirmLabel="Supprimer" variant="danger" onConfirm={() => void confirmDelete()} onCancel={() => setDeleteTarget(null)} />
      <ConfirmModal open={bulkDeleteOpen} title={`Supprimer ${selectedIds.size} marque${selectedIds.size > 1 ? "s" : ""} ?`} description="Les marques sans produits rattachés seront supprimées. Cette action est irréversible." confirmLabel="Supprimer la sélection" variant="danger" onConfirm={() => void handleBulkDelete()} onCancel={() => setBulkDeleteOpen(false)} />
    </div>
  );
}
