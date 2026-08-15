"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Tags,
  FolderTree,
  Layers,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  List,
  LayoutGrid,
} from "lucide-react";
import { CategoryDrawer, type CategoryModel } from "@/components/category-drawer";
import { ConfirmModal } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import { apiClient } from "@/lib/api-client";

/* ─── Initial mock category tree dataset matching shop ───────────────── */

const initialCategories: CategoryModel[] = [
  {
    id: "c1",
    name: "Visage",
    slug: "visage",
    parentId: null,
    shortDescription: "Nettoyants, soins hydratants et sérums dermatologiques pour le visage.",
    description: "Retrouvez tous les soins visage pour peaux sensibles, sèches, grasses ou sujettes aux imperfections.",
    image: "/assets/product-jar.webp",
    position: 1,
    featured: true,
    status: "ACTIVE",
    productCount: 10,
    subcategoriesCount: 4,
    subcategories: [
      { name: "Nettoyage & Démaquillage", slug: "nettoyage-demaquillage", productCount: 3 },
      { name: "Sérums & Boosters", slug: "serums-boosters", productCount: 3 },
      { name: "Hydratants & Crèmes", slug: "hydratants-cremes", productCount: 3 },
      { name: "Soins Réparateurs", slug: "soins-reparateurs", productCount: 1 },
    ],
  },
  {
    id: "c2",
    name: "Solaire",
    slug: "solaire",
    parentId: null,
    shortDescription: "Protections solaires invisibles SPF50+ et soins après-soleil.",
    description: "Protection UVA/UVB haute efficacité pour le visage, le corps et les peaux sensibles.",
    image: "/assets/product-tube.webp",
    position: 2,
    featured: true,
    status: "ACTIVE",
    productCount: 4,
    subcategoriesCount: 2,
    subcategories: [
      { name: "Fluides Invisibles SPF50+", slug: "fluides-invisibles-spf50", productCount: 2 },
      { name: "Après-soleil & Apaisants", slug: "apres-soleil", productCount: 2 },
    ],
  },
  {
    id: "c3",
    name: "Corps",
    slug: "corps",
    parentId: null,
    shortDescription: "Gels douche surgras, huiles sèches et baumes émollients.",
    description: "Nettoyage doux et nutrition intense du corps pour toute la famille.",
    image: "/assets/product-micellar.webp",
    position: 3,
    featured: true,
    status: "ACTIVE",
    productCount: 3,
    subcategoriesCount: 2,
    subcategories: [
      { name: "Gels Douche Surgras", slug: "gels-douche-surgras", productCount: 2 },
      { name: "Huiles & Baumes Corps", slug: "huiles-baumes-corps", productCount: 1 },
    ],
  },
  {
    id: "c4",
    name: "Cheveux",
    slug: "cheveux",
    parentId: null,
    shortDescription: "Shampooings fortifiants et soins anti-chute capillaire.",
    description: "Soins capillaires traitants pour fortifier la fibre et limiter la chute de cheveux.",
    image: "/assets/product-tube.webp",
    position: 4,
    featured: false,
    status: "ACTIVE",
    productCount: 2,
    subcategoriesCount: 1,
    subcategories: [
      { name: "Shampooings Anti-Chute", slug: "shampooings-anti-chute", productCount: 2 },
    ],
  },
];

export default function CategoriesAdminPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryModel | null>(null);
  const [blockedDeleteTarget, setBlockedDeleteTarget] = useState<CategoryModel | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    async function loadApiCategories() {
      try {
        const data = await apiClient.get<any[]>("/catalogue/categories");
        if (Array.isArray(data)) {
          const mapped: CategoryModel[] = data.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentId: c.parentId || null,
            shortDescription: c.shortDescription || "Gamme parapharmaceutique",
            description: c.description || "",
            image: c.image || "/assets/product-tube.webp",
            position: c.position || 1,
            featured: Boolean(c.featured),
            status: c.status || "ACTIVE",
            productCount: c._count?.products ?? c.productCount ?? 0,
            subcategoriesCount: c.children?.length ?? c._count?.children ?? 0,
            subcategories: (c.children || []).map((sub: any) => ({
              name: sub.name,
              slug: sub.slug,
              productCount: sub._count?.products ?? 0,
            })),
          }));
          setCategories(mapped);
          // Default expand top 3 parent categories
          const exp: Record<string, boolean> = {};
          mapped.slice(0, 5).forEach((item) => { exp[item.id] = true; });
          setExpandedCats(exp);
        }
      } catch (err) {
        console.warn("Failed to load API categories", err);
      }
    }
    loadApiCategories();
  }, []);

  const parentOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    if (!search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.subcategories?.some((s) => s.name.toLowerCase().includes(q))
    );
  }, [categories, search]);

  const visibleIds = useMemo(() => filteredCategories.map((c) => c.id), [filteredCategories]);
  const visibleSelectedCount = useMemo(
    () => visibleIds.reduce((count, id) => count + (selectedIds.has(id) ? 1 : 0), 0),
    [visibleIds, selectedIds]
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

  const stats = useMemo(() => {
    const totalMain = categories.length;
    const totalSubs = categories.reduce((acc, c) => acc + (c.subcategoriesCount || 0), 0);
    const totalProducts = categories.reduce((acc, c) => acc + (c.productCount || 0), 0);
    return { totalMain, totalSubs, totalProducts };
  }, [categories]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingCategory(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((cat: CategoryModel) => {
    setEditingCategory(cat);
    setDrawerOpen(true);
  }, []);

  const handleSaveCategory = useCallback(
    (cat: CategoryModel) => {
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === cat.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = cat;
          return next;
        }
        return [...prev, cat];
      });
      toast("success", `Catégorie « ${cat.name} » enregistrée`);
      setDrawerOpen(false);
      setEditingCategory(null);
    },
    [toast]
  );

  const handleDeleteAttempt = useCallback((cat: CategoryModel) => {
    if ((cat.productCount && cat.productCount > 0) || (cat.subcategoriesCount && cat.subcategoriesCount > 0)) {
      setBlockedDeleteTarget(cat);
    } else {
      setDeleteTarget(cat);
    }
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/catalogue/categories/${deleteTarget.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast("success", `Catégorie « ${deleteTarget.name} » supprimée`);
    } catch {
      toast("error", "Échec de la suppression de la catégorie");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, toast]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    try {
      await apiClient.post("/catalogue/categories/bulk-delete", { ids });
      setCategories((prev) => prev.filter((c) => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast("success", `${ids.length} catégorie(s) supprimée(s) avec succès`);
    } catch {
      toast("error", "Échec de la suppression groupée des catégories");
    }
  }, [selectedIds, toast]);

  return (
    <div className="space-y-6 min-h-screen bg-[#FFF5F5]/40 p-2 sm:p-6 text-slate-800">
      {/* ── Top Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
            <Tags size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#881337]">Catégories</h1>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {stats.totalMain} catégories principales • {stats.totalSubs} sous-catégories
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {stats.totalProducts} références produits associées au catalogue
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#BE123C] transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={3} />
          Ajouter une catégorie
        </button>
      </div>

      {/* ── Filter Bar & View Toggle ─────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48] transition-all"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "tree" ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderTree size={14} /> Vue Arborescente
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "table" ? "bg-white text-[#E11D48] shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List size={14} /> Vue Tableau
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <p className="text-sm font-bold text-rose-900">{selectedIds.size} catégorie{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedIds(new Set())} className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-rose-100">Annuler la sélection</button>
            <button type="button" onClick={() => setBulkDeleteOpen(true)} className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700"><Trash2 className="mr-2 inline size-4" />Supprimer la sélection</button>
          </div>
        </div>
      )}

      {/* ── Content Area: Tree or Table View ─────────────────────────── */}
      {viewMode === "tree" ? (
        <div className="space-y-4">
          {filteredCategories.map((cat) => {
            const isExpanded = Boolean(expandedCats[cat.id]);
            return (
              <div
                key={cat.id}
                className={`rounded-2xl bg-white border p-4 shadow-xs space-y-3 transition-all ${selectedIds.has(cat.id) ? "border-rose-300 bg-rose-50/40" : "border-slate-200/80 hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(cat.id)}
                      onChange={() => toggleOne(cat.id)}
                      aria-label={`Sélectionner ${cat.name}`}
                      className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-[#E11D48] transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="h-full w-full object-contain" />
                      ) : (
                        <Tags size={20} className="text-[#E11D48]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-extrabold text-slate-900 text-sm">{cat.name}</h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-2.5 py-0.5 text-[0.625rem] font-bold">
                          <CheckCircle2 size={11} /> Actif
                        </span>
                      </div>
                      <p className="text-[0.6875rem] font-mono text-slate-500 font-semibold">/{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-900 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl">
                      {cat.productCount} produit(s)
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="hover:text-slate-700 transition-colors p-1"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="hover:text-[#E11D48] transition-colors p-1"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttempt(cat)}
                        className="hover:text-rose-600 transition-colors p-1 text-rose-500"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Subcategories */}
                {isExpanded && cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 pl-12 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub.slug}
                        className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/60 px-3.5 py-2 text-xs font-semibold text-slate-800"
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="font-bold text-slate-500 text-[0.6875rem]">
                          {sub.productCount} ref
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-rose-50/30 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <input type="checkbox" checked={allVisibleSelected} disabled={visibleIds.length === 0} onChange={toggleAllVisible} aria-label="Sélectionner toutes les catégories" className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed" />
                  </th>
                  <th className="py-3.5 px-4">CATÉGORIE</th>
                  <th className="py-3.5 px-4">SLUG URL</th>
                  <th className="py-3.5 px-4 text-center">SOUS-CATÉGORIES</th>
                  <th className="py-3.5 px-4 text-center">PRODUITS</th>
                  <th className="py-3.5 px-4">STATUT</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className={`transition-colors ${selectedIds.has(c.id) ? "bg-rose-50/70" : "hover:bg-rose-50/20"}`}>
                    <td className="py-3.5 px-4">
                      <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleOne(c.id)} aria-label={`Sélectionner ${c.name}`} className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                          {c.image ? (
                            <img src={c.image} alt={c.name} className="h-full w-full object-contain" />
                          ) : (
                            <Tags size={20} className="text-[#E11D48]" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                          <p className="text-[0.6875rem] text-slate-500 font-medium truncate max-w-[200px]">
                            {c.shortDescription || "Gamme parapharmaceutique"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold text-[0.6875rem]">
                      /{c.slug}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {c.subcategoriesCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-slate-900">
                      {c.productCount || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-3 py-0.5 text-[0.6875rem] font-semibold">
                        <CheckCircle2 size={12} /> Actif
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="hover:text-slate-700 transition-colors p-1"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="hover:text-[#E11D48] transition-colors p-1"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttempt(c)}
                          className="hover:text-rose-600 transition-colors p-1 text-rose-500"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Category Drawer Component ────────────────────────────────── */}
      <CategoryDrawer
        open={drawerOpen}
        category={editingCategory}
        parentCategories={parentOptions}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* ── Blocked Delete Safety Modal ──────────────────────────────── */}
      <ConfirmModal
        open={!!blockedDeleteTarget}
        title="Impossible de supprimer cette catégorie"
        description={`Impossible de supprimer la catégorie « ${blockedDeleteTarget?.name} » car ${blockedDeleteTarget?.productCount || 0} produit(s) et ${blockedDeleteTarget?.subcategoriesCount || 0} sous-catégorie(s) y sont rattachés. Veuillez d'abord réassigner ou supprimer les éléments dépendants.`}
        confirmLabel="Compris"
        variant="warning"
        onConfirm={() => setBlockedDeleteTarget(null)}
        onCancel={() => setBlockedDeleteTarget(null)}
      />

      {/* ── Allowed Delete Confirm Modal ─────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer la catégorie ?"
        description={`Voulez-vous vraiment supprimer la catégorie « ${deleteTarget?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Bulk Delete Confirm Modal ───────────────────────────────── */}
      <ConfirmModal
        open={bulkDeleteOpen}
        title={`Supprimer ${selectedIds.size} catégorie${selectedIds.size > 1 ? "s" : ""} ?`}
        description="Seules les catégories sans produits ou sous-catégories rattachées seront supprimées. Cette action est irréversible."
        confirmLabel="Supprimer la sélection"
        variant="danger"
        onConfirm={() => void handleBulkDelete()}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
