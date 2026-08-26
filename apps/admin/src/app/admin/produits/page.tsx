"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ProductDrawer } from "@/components/product-drawer";
import { BulkSeoGenerator } from "@/components/bulk-seo-generator";
import { ConfirmModal } from "@/components/confirm-modal";
import { useToast } from "@/components/toast";
import { apiClient, resolveMediaUrl } from "@/lib/api-client";
import type { Product, Supplier, PurchasePriceHistory } from "@/lib/types";

/* ─── Real products matching http://localhost:3000/shop ──────────────── */

const shopProducts: (Product & { image?: string })[] = [
  {
    id: "p01",
    name: "Anthelios Fluide Invisible SPF50+",
    brand: "La Roche-Posay",
    category: "Solaire",
    price: 58.900,
    costPrice: 38.000,
    sku: "LRP-ANT-50",
    stock: 24,
    status: "ACTIVE",
    image: "/assets/product-tube.webp",
  },
  {
    id: "p02",
    name: "Sensibio H2O",
    brand: "Bioderma",
    category: "Visage",
    price: 36.900,
    costPrice: 22.000,
    sku: "BIO-SH2O-250",
    stock: 18,
    status: "ACTIVE",
    image: "/assets/product-micellar.webp",
  },
  {
    id: "p03",
    name: "Crème Hydratante Visage",
    brand: "CeraVe",
    category: "Visage",
    price: 42.500,
    costPrice: 26.000,
    sku: "CER-CHV-52",
    stock: 15,
    status: "ACTIVE",
    image: "/assets/product-jar.webp",
  },
  {
    id: "p04",
    name: "Liftactiv Sérum Vitamine C",
    brand: "Vichy",
    category: "Visage",
    price: 91.000,
    costPrice: 58.000,
    sku: "VIC-LVC-20",
    stock: 8,
    status: "ACTIVE",
    image: "/assets/product-serum.webp",
  },
  {
    id: "p05",
    name: "Cleanance Gel Nettoyant",
    brand: "Avène",
    category: "Visage",
    price: 39.500,
    costPrice: 24.000,
    sku: "AVE-CGN-200",
    stock: 12,
    status: "ACTIVE",
    image: "/assets/product-micellar.webp",
  },
  {
    id: "p06",
    name: "Eau Thermale Gel-Crème",
    brand: "Uriage",
    category: "Visage",
    price: 48.900,
    costPrice: 30.000,
    sku: "URI-ETG-40",
    stock: 10,
    status: "ACTIVE",
    image: "/assets/product-jar.webp",
  },
  {
    id: "p07",
    name: "Sebiaclear Sérum",
    brand: "SVR",
    category: "Visage",
    price: 64.900,
    costPrice: 40.000,
    sku: "SVR-SBS-30",
    stock: 6,
    status: "ACTIVE",
    image: "/assets/product-serum.webp",
  },
  {
    id: "p08",
    name: "Huile Prodigieuse",
    brand: "Nuxe",
    category: "Corps",
    price: 79.500,
    costPrice: 50.000,
    sku: "NUX-HP-100",
    stock: 14,
    status: "ACTIVE",
    image: "/assets/product-serum.webp",
  },
  {
    id: "p09",
    name: "DermoPure Fluide Matifiant",
    brand: "Eucerin",
    category: "Visage",
    price: 55.900,
    costPrice: 34.000,
    sku: "EUC-DFM-50",
    stock: 9,
    status: "ACTIVE",
    image: "/assets/product-tube.webp",
  },
  {
    id: "p10",
    name: "Anaphase+ Shampooing",
    brand: "Ducray",
    category: "Cheveux",
    price: 46.500,
    costPrice: 28.000,
    sku: "DUC-APS-200",
    stock: 11,
    status: "ACTIVE",
    image: "/assets/product-tube.webp",
  },
  {
    id: "p11",
    name: "Atoderm Gel Douche",
    brand: "Bioderma",
    category: "Corps",
    price: 44.900,
    costPrice: 27.000,
    sku: "BIO-AGD-500",
    stock: 20,
    status: "ACTIVE",
    image: "/assets/product-micellar.webp",
  },
  {
    id: "p12",
    name: "Cicaplast Baume B5+",
    brand: "La Roche-Posay",
    category: "Visage",
    price: 34.900,
    costPrice: 21.000,
    sku: "LRP-CBB-40",
    stock: 30,
    status: "ACTIVE",
    image: "/assets/product-tube.webp",
  },
  {
    id: "p13",
    name: "Capital Soleil UV-Age Daily",
    brand: "Vichy",
    category: "Solaire",
    price: 72.500,
    costPrice: 45.000,
    sku: "VIC-CSU-40",
    stock: 7,
    status: "ACTIVE",
    image: "/assets/product-tube.webp",
  },
  {
    id: "p14",
    name: "XeraCalm A.D Baume",
    brand: "Avène",
    category: "Corps",
    price: 68.900,
    costPrice: 42.000,
    sku: "AVE-XCB-200",
    stock: 5,
    status: "ACTIVE",
    image: "/assets/product-micellar.webp",
  },
  {
    id: "p15",
    name: "Minéral 89 Booster",
    brand: "Vichy",
    category: "Visage",
    price: 79.900,
    costPrice: 49.000,
    sku: "VIC-M89-50",
    stock: 16,
    status: "ACTIVE",
    image: "/assets/product-serum.webp",
  },
  {
    id: "p16",
    name: "Bariéderm Cica-Crème",
    brand: "Uriage",
    category: "Visage",
    price: 32.900,
    costPrice: 19.000,
    sku: "URI-BCC-40",
    stock: 0,
    status: "ACTIVE",
    image: "/assets/product-tube.webp",
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: "sup1",
    name: "Laboratoires Vian",
    contactPerson: "Mme. Leila Vian",
    phone: "+216 71 234 567",
    email: "contact@labvian.tn",
    brandsSupplied: ["Bioderma", "Avène"],
    status: "ACTIVE",
    createdAt: "2025-06-15T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "sup2",
    name: "PharmaDistrib TN",
    contactPerson: "M. Karim Benzarti",
    phone: "+216 71 876 543",
    email: "kb@pharmadistrib.tn",
    brandsSupplied: ["CeraVe", "La Roche-Posay"],
    status: "ACTIVE",
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2026-05-20T00:00:00Z",
  },
];

const mockPurchaseHistory: PurchasePriceHistory[] = [];

export default function ProduitsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<(Product & { image?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [availableBrands, setAvailableBrands] = useState<{ name: string; slug: string }[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ name: string; slug: string }[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Fetch filter options (brands & categories) from API
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [bData, cData] = await Promise.all([
          apiClient.get<any[]>("/catalogue/brands"),
          apiClient.get<any[]>("/catalogue/categories"),
        ]);
        if (Array.isArray(bData)) setAvailableBrands(bData.map((b) => ({ name: b.name, slug: b.slug })));
        if (Array.isArray(cData)) setAvailableCategories(cData.map((c) => ({ name: c.name, slug: c.slug })));
      } catch (err) {
        console.warn("Could not fetch filter options from API", err);
      }
    }
    fetchFilterOptions();
  }, []);

  // Fetch server-paginated products from API
  useEffect(() => {
    async function fetchApiProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", String(pageSize));
        if (search.trim()) params.set("q", search.trim());
        if (brandFilter) params.set("brand", brandFilter);
        if (categoryFilter) params.set("category", categoryFilter);

        const res = await apiClient.get<any>(`/catalogue/products?${params.toString()}`);
        let rawList: any[] = [];
        let total = 0;
        let tPages = 1;

        if (res && Array.isArray(res.data)) {
          rawList = res.data;
          total = res.meta?.total || rawList.length;
          tPages = res.meta?.totalPages || 1;
        } else if (Array.isArray(res)) {
          rawList = res;
          total = rawList.length;
        }

        const mapped: (Product & { image?: string })[] = rawList.map((p, i) => ({
          id: p.id || `p${i}`,
          name: p.name,
          brand: p.brand?.name || "ParaTunisie",
          category: p.category?.name || "Visage",
          price: p.variants?.[0]?.priceMillimes ? p.variants[0].priceMillimes / 1000 : 0,
          costPrice: 0,
          sku: p.variants?.[0]?.sku || p.slug?.toUpperCase() || `SKU-${i}`,
          stock: p.variants?.[0]?.stock ?? 50,
          status: p.publishState === "PUBLISHED" ? "ACTIVE" : p.publishState === "NOINDEX" ? "ARCHIVED" : "DRAFT",
          image: p.image || "/assets/product-tube.webp",
          slug: p.slug,
          shortDescription: p.benefit,
          description: p.description,
          usage: p.usage,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          metaDescription: p.seoDescription,
          seoH1: p.seoH1,
          seoIntro: p.seoIntro,
          seoContent: p.seoContent,
          seoKeywords: p.seoKeywords,
          canonicalUrl: p.canonicalUrl,
          ogTitle: p.ogTitle,
          ogDescription: p.ogDescription,
          ogImage: p.ogImage,
          imageAlt: p.imageAlt,
          indexable: p.indexable,
          followLinks: p.followLinks,
        }));

        setProducts(mapped);
        setTotalProducts(total);
        setTotalPages(tPages);
      } catch (err) {
        console.warn("Could not fetch API products", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchApiProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [currentPage, pageSize, search, brandFilter, categoryFilter]);

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleBrandChange = (val: string) => {
    setBrandFilter(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const counts = useMemo(
    () => ({
      total: totalProducts,
      inStock: products.filter((p) => p.stock > 5).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    }),
    [products, totalProducts]
  );

  const visibleIds = useMemo(() => products.map((product) => product.id), [products]);
  const visibleSelectedCount = useMemo(
    () => visibleIds.reduce((count: number, id: string) => count + (selectedIds.has(id) ? 1 : 0), 0),
    [visibleIds, selectedIds]
  );
  const allVisibleSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = visibleSelectedCount > 0 && !allVisibleSelected;
    }
  }, [visibleSelectedCount, allVisibleSelected]);

  useEffect(() => {
    const existingIds = new Set(products.map((product) => product.id));
    setSelectedIds((current) => new Set([...current].filter((id) => existingIds.has(id))));
  }, [products]);

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
      visibleIds.forEach((id) => shouldSelect ? next.add(id) : next.delete(id));
      return next;
    });
  }, [visibleIds]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkDeleting(true);
    try {
      const result = await apiClient.post<{ count: number }>("/catalogue/products/bulk-delete", { ids });
      if (result.count !== ids.length) throw new Error("Suppression incomplète");
      setProducts((current) => current.filter((product) => !selectedIds.has(product.id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast("success", `${ids.length} produit${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""}`);
    } catch {
      toast("error", "Impossible de supprimer les produits sélectionnés");
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedIds, toast]);

  const handleSave = useCallback(
    async (product: Product) => {
      const savedRaw = editingProduct
        ? await apiClient.patch<any>(`/catalogue/products/${product.id}`, product)
        : await apiClient.post<any>("/catalogue/products", product);
      const saved = { ...product, id: savedRaw.id || product.id };
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...saved } : p)));
        toast("success", `Produit « ${product.name} » mis à jour`);
      } else {
        const newP = { ...saved, image: saved.image || "/assets/product-tube.webp" };
        setProducts((prev) => [newP, ...prev]);
        toast("success", `Produit « ${product.name} » créé avec succès`);
      }
      setEditingProduct(null);
      setDrawerOpen(false);
    },
    [editingProduct, toast]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/catalogue/products/${deleteTarget.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast("success", `Produit « ${deleteTarget.name} » supprimé`);
    } catch {
      toast("error", "Impossible de supprimer ce produit");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, toast]);

  const openEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setDrawerOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setEditingProduct(null);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="space-y-6 min-h-screen bg-[#FFF5F5]/40 p-2 sm:p-6 text-slate-800">
      {/* ── Top Header matching Commandes ────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#881337]">Produits</h1>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {counts.total} produits au catalogue (Boutique client)
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              En stock ({counts.inStock}) • Faible stock ({counts.lowStock}) • Ruptures ({counts.outOfStock})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => setCurrentPage(1)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            title="Actualiser la liste"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#E11D48]" : ""} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#BE123C] transition-all active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={3} />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* ── Filter Bar matching Commandes ────────────────────────────── */}
      <BulkSeoGenerator type="product" label="tous les produits" />
      <div className="rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200/80 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher un produit (nom, marque, SKU)..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48] transition-all"
          />
        </div>

        <select
          value={brandFilter}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48]"
        >
          <option value="">Toutes les marques</option>
          {availableBrands.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48]"
        >
          <option value="">Toutes les catégories</option>
          {availableCategories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <p className="text-sm font-bold text-rose-900">{selectedIds.size} produit{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedIds(new Set())} className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-rose-100">Annuler la sélection</button>
            <button type="button" disabled={bulkDeleting} onClick={() => setBulkDeleteOpen(true)} className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="mr-2 inline size-4" />Supprimer la sélection</button>
          </div>
        </div>
      )}

      {/* ── Table matching Commandes style ────────────────────────────── */}
      <div className="relative rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-100/60 overflow-hidden z-20">
            <div className="h-full bg-gradient-to-r from-[#E11D48] via-rose-400 to-[#E11D48] animate-pulse w-full" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-rose-50/30 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input ref={selectAllRef} type="checkbox" checked={allVisibleSelected} disabled={visibleIds.length === 0} onChange={toggleAllVisible} aria-label="Sélectionner tous les produits visibles" className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed" />
                </th>
                <th className="py-3.5 px-4">PRODUIT</th>
                <th className="py-3.5 px-4">MARQUE</th>
                <th className="py-3.5 px-4">CATÉGORIE</th>
                <th className="py-3.5 px-4">PRIX</th>
                <th className="py-3.5 px-4">STOCK</th>
                <th className="py-3.5 px-4">STATUT</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse border-b border-slate-100/80">
                    <td className="py-4 px-4">
                      <div className="size-4 rounded bg-slate-200/80" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-xl bg-slate-200/80 shrink-0" />
                        <div className="space-y-2 flex-1 max-w-xs">
                          <div className="h-3.5 w-3/4 rounded bg-slate-200/80" />
                          <div className="h-3 w-1/3 rounded bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-24 rounded bg-slate-200/80" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 w-28 rounded bg-slate-200/80" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-20 rounded bg-slate-200/80 font-bold" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-24 rounded-full bg-slate-200/80" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 w-16 rounded-full bg-slate-200/80" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-200/80" />
                        <div className="h-7 w-7 rounded-lg bg-slate-200/80" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className={`transition-colors ${selectedIds.has(product.id) ? "bg-rose-50/70" : "hover:bg-rose-50/20"}`}>
                    <td className="py-3.5 px-4">
                      <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleOne(product.id)} aria-label={`Sélectionner ${product.name}`} className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <img
                            src={resolveMediaUrl(product.image)}
                            alt={product.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs line-clamp-2">{product.name}</p>
                          <p className="text-[0.6875rem] text-slate-400 font-mono mt-0.5">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{product.brand}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{product.category}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{product.price.toFixed(3)} DT</td>
                    <td className="py-3.5 px-4">
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <AlertTriangle size={14} /> Ruptures
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <AlertTriangle size={14} /> {product.stock} restants
                        </span>
                      ) : (
                        <span className="font-bold text-slate-800">{product.stock} en stock</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {product.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.6875rem] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[0.6875rem] font-bold text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Server-Side Pagination Bar ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3 sm:px-6 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Affichage par page :</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-[#E11D48]"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-500 font-medium hidden sm:inline">
              Affichage de <strong className="text-slate-800">{totalProducts > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> à <strong className="text-slate-800">{Math.min(currentPage * pageSize, totalProducts)}</strong> sur <strong className="text-slate-800">{totalProducts}</strong> produits
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Précédent
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let pNum = currentPage;
                if (totalPages <= 5) {
                  pNum = idx + 1;
                } else if (currentPage <= 3) {
                  pNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pNum = totalPages - 4 + idx;
                } else {
                  pNum = currentPage - 2 + idx;
                }
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setCurrentPage(pNum)}
                    className={`min-w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pNum
                        ? "bg-[#E11D48] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* ── Product Drawer Component ── */}
      <ProductDrawer
        open={drawerOpen}
        product={editingProduct}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        suppliers={mockSuppliers}
        purchaseHistory={mockPurchaseHistory}
      />

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer ce produit ?"
        description={`Voulez-vous vraiment supprimer « ${deleteTarget?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        open={bulkDeleteOpen}
        title={`Supprimer ${selectedIds.size} produit${selectedIds.size > 1 ? "s" : ""} ?`}
        description={bulkDeleting ? "Suppression dans la base de données…" : "Les produits sélectionnés seront définitivement supprimés de la base. Cette action est irréversible."}
        confirmLabel={bulkDeleting ? "Suppression…" : "Supprimer la sélection"}
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => { if (!bulkDeleting) setBulkDeleteOpen(false); }}
      />
    </div>
  );
}
