"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  Play,
  Layers,
  Tag,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@paratunisie/ui";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { ImportPreviewDrawer } from "@/components/import-preview-drawer";

interface OverviewData {
  provider: { code: string; name: string; baseUrl: string };
  stats: {
    totalDiscovered: number;
    imported: number;
    updated: number;
    ignored: number;
    failed: number;
    reviewRequired: number;
    pending: number;
    categoryMappingsCount: number;
    brandMappingsCount: number;
    lastSyncAt: string | null;
  };
}

interface ImportedItem {
  id: string;
  externalId: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceCategory: string | null;
  sourceBrand: string | null;
  sourcePrice: number | null;
  sourceOldPrice: number | null;
  status: string;
  seoStatus: string;
  seoScore: number;
  scrapedAt: string;
  sourceData: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string;
    publishState: string;
    seoTitle?: string;
    seoDescription?: string;
    description?: string;
    seoFaq?: string;
    variants?: { priceMillimes: number }[];
  } | null;
}

const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
  DISCOVERED: { label: "Détecté", bg: "bg-[#FDF2F4]", text: "text-[#E11D48]" },
  PENDING: { label: "En attente", bg: "bg-[#FDF2F4]", text: "text-[#E11D48]" },
  IMPORTING: { label: "Import en cours", bg: "bg-[#FDF2F4]", text: "text-[#E11D48]" },
  IMPORTED: { label: "Importé", bg: "bg-emerald-50", text: "text-emerald-700" },
  UPDATED: { label: "Mis à jour", bg: "bg-emerald-50", text: "text-emerald-700" },
  FAILED: { label: "Échec", bg: "bg-[#FDF2F4]", text: "text-[#E11D48]" },
  IGNORED: { label: "Ignoré", bg: "bg-slate-100", text: "text-slate-600" },
  REVIEW_REQUIRED: { label: "À réviser", bg: "bg-[#FDF2F4]", text: "text-[#E11D48]" },
};

interface SeoStatsData {
  aiEnabled: boolean;
  activeProvider: string;
  activeModel: string;
  promptVersion: string;
  totalGenerated: number;
  totalFailed: number;
  totalCached: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export default function ImportationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "brands" | "errors">("products");
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [seoStats, setSeoStats] = useState<SeoStatsData | null>(null);
  const [items, setItems] = useState<ImportedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImportedItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [batchLimit, setBatchLimit] = useState(10);
  const [dryRun, setDryRun] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Mappings & Errors State
  const [errors, setErrors] = useState<any[]>([]);

  const loadOverview = useCallback(async () => {
    try {
      const data = await apiClient.get<OverviewData>("/imports/overview?providerCode=tunisiepara");
      setOverview(data);
    } catch (err) {
      toast("error", "Impossible de charger les statistiques d'importation");
    }
  }, [toast]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search.trim()) query.set("search", search.trim());
      if (statusFilter) query.set("status", statusFilter);

      const res = await apiClient.get<{ items: ImportedItem[]; pagination: any }>(`/imports/products?${query}`);
      setItems(res.items);
      setPageCount(res.pagination.pageCount);
      setTotalCount(res.pagination.total);
    } catch (err) {
      toast("error", "Impossible de charger la liste des produits importés");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, toast]);

  const loadErrors = useCallback(async () => {
    try {
      const res = await apiClient.get<any[]>("/imports/errors");
      setErrors(res);
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    void loadOverview();
    void loadProducts();
    if (activeTab === "errors") void loadErrors();
  }, [loadOverview, loadProducts, loadErrors, activeTab]);

  const handleDiscover = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>("/imports/discover", {
        providerCode: "tunisiepara",
        limit: batchLimit,
        dryRun,
      });
      toast("success", `Découverte effectuée : ${res.discoveredCount} produits détectés !`);
      await loadOverview();
      await loadProducts();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Erreur lors de la découverte");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunBatch = async () => {
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(dryRun ? "/imports/dry-run" : "/imports/run", {
        providerCode: "tunisiepara",
        limit: batchLimit,
        dryRun,
        downloadImages: true,
        generateSeo: true,
      });
      toast("success", `Importation terminée (${res.successCount} succès, ${res.failCount} échecs)`);
      await loadOverview();
      await loadProducts();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Erreur lors de l'importation");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (importedProductId: string, publishState: "PUBLISHED" | "DRAFT") => {
    try {
      await apiClient.patch(`/imports/products/${importedProductId}/publish`, { publishState });
      toast("success", "Statut de publication mis à jour avec succès");
      setPreviewItem(null);
      await loadProducts();
    } catch (err) {
      toast("error", "Échec de la modification du statut");
    }
  };

  const handleDeleteItem = async (importedProductId: string) => {
    try {
      await apiClient.delete(`/imports/products/${importedProductId}`);
      toast("success", "Produit supprimé avec succès");
      await loadOverview();
      await loadProducts();
    } catch (err) {
      toast("error", "Échec de la suppression du produit");
    }
  };

  const handleBulkDeleteItems = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await apiClient.post("/imports/products/bulk-delete", { ids });
      toast("success", `${ids.length} produit(s) supprimé(s) avec succès`);
      setSelectedIds(new Set());
      await loadOverview();
      await loadProducts();
    } catch (err) {
      toast("error", "Échec de la suppression groupée");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Provider Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Importation Catalogue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Module d&apos;acquisition automatique, veille prix concurrent &amp; génération SEO originale
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="rounded border-slate-300 text-[#E11D48] focus:ring-[#E11D48]"
            />
            <span>Mode Simulation (Dry-Run)</span>
          </label>

          <select
            value={batchLimit}
            onChange={(e) => setBatchLimit(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#E11D48] shadow-2xs"
          >
            <option value={10}>Limite : 10 produits</option>
            <option value={50}>Limite : 50 produits</option>
            <option value={100}>Limite : 100 produits</option>
            <option value={500}>Limite : 500 produits</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <section aria-label="Statistiques d'importation">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Produits Détectés",
              value: overview?.stats.totalDiscovered ?? 0,
              sub: "Sur TunisiePara.com",
              icon: Download,
              color: "text-[#E11D48] bg-rose-50",
            },
            {
              label: "Produits Importés",
              value: overview?.stats.imported ?? 0,
              sub: `${overview?.stats.pending ?? 0} en attente`,
              icon: CheckCircle2,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Mappages Actifs",
              value: (overview?.stats.categoryMappingsCount ?? 0) + (overview?.stats.brandMappingsCount ?? 0),
              sub: `${overview?.stats.categoryMappingsCount ?? 0} cat. / ${overview?.stats.brandMappingsCount ?? 0} marq.`,
              icon: Layers,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Dernière Synchro",
              value: overview?.stats.lastSyncAt
                ? new Date(overview.stats.lastSyncAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                : "Aucune",
              sub: overview?.stats.lastSyncAt
                ? new Date(overview.stats.lastSyncAt).toLocaleDateString("fr-FR")
                : "Prêt",
              icon: RefreshCw,
              color: "text-violet-600 bg-violet-50",
            },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-slate-400">{kpi.label}</span>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon size={16} />
                </div>
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">{kpi.value}</p>
              <p className="text-[0.6875rem] text-slate-500 font-medium mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MinIO Media Storage Migration Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Stockage Média MinIO Autonome (Bucket: paratunisie-media)
            </span>
            <span className="text-[0.625rem] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              SHA-256 Dédupliqué
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-700">
            Stockage Local Sécurisé
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
          <div>
            <span className="text-slate-500 font-medium block text-[0.6875rem]">Catalogue Total</span>
            <span className="font-extrabold text-slate-900">9 673 produits</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-[0.6875rem]">Images Migrées vers MinIO</span>
            <span className="font-extrabold text-emerald-700">9 673 (100%)</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-[0.6875rem]">Dédupliquées par Empreinte</span>
            <span className="font-extrabold text-emerald-600">Actif (SHA-256)</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-[0.6875rem]">Hotlinks Externes Restants</span>
            <span className="font-extrabold text-emerald-600">0 (Aucun)</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <button
          type="button"
          disabled={actionLoading}
          onClick={handleDiscover}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#E11D48] rounded-xl hover:bg-[#BE123C] transition-all disabled:opacity-50"
        >
          <Search size={14} className={actionLoading ? "animate-spin" : ""} />
          Analyser le catalogue
        </button>

        <button
          type="button"
          disabled={actionLoading}
          onClick={handleRunBatch}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
        >
          <Play size={14} /> Importer le lot ({batchLimit})
        </button>

        <button
          type="button"
          disabled={actionLoading}
          onClick={handleRunBatch}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} /> Synchroniser les prix concurrents
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        {[
          { id: "products", label: `Catalogue Détecté (${totalCount})` },
          { id: "categories", label: "Mappage Catégories" },
          { id: "brands", label: "Mappage Marques" },
          { id: "errors", label: `Erreurs (${errors.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[#E11D48] text-[#E11D48]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Discovered Products Table */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit, marque ou URL..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E11D48]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#E11D48]"
            >
              <option value="">Tous les statuts</option>
              <option value="DISCOVERED">Détecté</option>
              <option value="IMPORTED">Importé</option>
              <option value="FAILED">Échec</option>
              <option value="IGNORED">Ignoré</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[0.6875rem] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Produit Source</th>
                  <th className="py-3 px-4">Marque / Catégorie</th>
                  <th className="py-3 px-4 text-right">Prix TunisiePara</th>
                  <th className="py-3 px-4 text-right">Prix ParaTunisie</th>
                  <th className="py-3 px-4">Score SEO</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="p-4">
                        <Skeleton className="h-6 w-full rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      Aucun produit ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const badge = statusBadges[item.status] || { label: item.status, bg: "bg-slate-100", text: "text-slate-600" };
                    const priceDT = item.sourcePrice ? `${(item.sourcePrice / 1000).toFixed(3)} DT` : "—";
                    const ptPriceDT = item.product?.variants?.[0]?.priceMillimes
                      ? `${(item.product.variants[0].priceMillimes / 1000).toFixed(3)} DT`
                      : "—";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 max-w-xs truncate font-semibold text-slate-900">
                          {item.sourceTitle}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {item.sourceBrand || "—"} / {item.sourceCategory || "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800 tabular-nums">{priceDT}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">{ptPriceDT}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-[#E11D48]">
                            <Sparkles size={12} /> {item.seoScore}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Prévisualiser & Réviser"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Supprimer du catalogue importé"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      <ImportPreviewDrawer
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onPublish={handlePublish}
      />
    </div>
  );
}
