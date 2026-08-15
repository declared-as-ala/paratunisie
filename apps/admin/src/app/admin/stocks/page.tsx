"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Boxes,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { STOCK_MOVEMENT_MAP, type StockMovementType } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { apiClient, ApiError } from "@/lib/api-client";
import { StockDrawer, type StockProductModel, type StockAdjustmentSubmitData } from "@/components/stock-drawer";

/* ─── API response shapes ──────────────────────────────────────────────── */

interface ApiBatch {
  id: string;
  batchNumber: string;
  expirationDate: string | null;
  quantity: number;
  purchasePriceHistory?: { purchasePriceMillimes: number; supplier?: { name: string } } | null;
}

interface ApiInventoryItem {
  id: string;
  variantId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderThreshold: number;
  warehouse: { name: string };
  variant: {
    id: string;
    label: string;
    sku: string | null;
    product: { id: string; name: string; image: string; brand: { name: string } };
  };
  batches: ApiBatch[];
}

interface ApiStockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
  inventoryItem: { variant: { product: { name: string } } };
}

function mapInventoryItem(item: ApiInventoryItem): StockProductModel {
  const earliestBatch = item.batches[0];
  return {
    id: item.id,
    productId: item.variantId,
    productName: item.variant.product.name,
    brand: item.variant.product.brand.name,
    sku: item.variant.sku || item.variant.label,
    image: item.variant.product.image,
    warehouse: item.warehouse.name,
    quantityOnHand: item.quantityOnHand,
    quantityReserved: item.quantityReserved,
    reorderThreshold: item.reorderThreshold,
    batchNumber: earliestBatch?.batchNumber,
    expiryDate: earliestBatch?.expirationDate ?? undefined,
    purchaseCost: earliestBatch?.purchasePriceHistory ? earliestBatch.purchasePriceHistory.purchasePriceMillimes / 1000 : 0,
    supplierName: earliestBatch?.purchasePriceHistory?.supplier?.name,
  };
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function getDaysUntilExpiry(date?: string): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ date }: { date?: string }) {
  const days = getDaysUntilExpiry(date);
  if (days === null) return <span className="text-xs text-slate-400">—</span>;
  if (days < 0) return <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-rose-50 text-rose-700 border border-rose-200">Expiré</span>;
  if (days <= 30) return <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-rose-50 text-rose-700 border border-rose-200">{days}j</span>;
  if (days <= 60) return <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-amber-50 text-amber-700 border border-amber-200">{days}j</span>;
  if (days <= 90) return <span className="px-2 py-0.5 rounded-full text-[0.625rem] font-bold bg-blue-50 text-blue-700 border border-blue-200">{days}j</span>;
  return <span className="text-xs text-slate-600 font-semibold tabular-nums">{days}j</span>;
}

export default function StocksAdminPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = useState<StockProductModel[]>([]);
  const [movements, setMovements] = useState<ApiStockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("ALL");
  const [view, setView] = useState<"inventory" | "movements">("inventory");
  const [sortKey, setSortKey] = useState<"name" | "stock" | "expiry">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<StockProductModel | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [items, moves] = await Promise.all([
        apiClient.get<ApiInventoryItem[]>("/inventory"),
        apiClient.get<ApiStockMovement[]>("/inventory/movements"),
      ]);
      setInventory(items.map(mapInventoryItem));
      setMovements(moves);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger les stocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // KPIs
  const totalOnHand = inventory.reduce((s, i) => s + i.quantityOnHand, 0);
  const totalReserved = inventory.reduce((s, i) => s + i.quantityReserved, 0);
  const totalAvailable = totalOnHand - totalReserved;
  const outOfStock = inventory.filter((i) => i.quantityOnHand === 0).length;
  const lowStock = inventory.filter((i) => i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderThreshold).length;
  const stockValue = inventory.reduce((s, i) => s + i.quantityOnHand * i.purchaseCost, 0);

  // Filter & sort
  const filteredInventory = useMemo(() => {
    let list = [...inventory];
    if (stockFilter === "OUT") list = list.filter((i) => i.quantityOnHand === 0);
    else if (stockFilter === "LOW") list = list.filter((i) => i.quantityOnHand > 0 && i.quantityOnHand <= i.reorderThreshold);
    else if (stockFilter === "EXPIRY") list = list.filter((i) => { const d = getDaysUntilExpiry(i.expiryDate); return d !== null && d >= 0 && d <= 90; });
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.productName.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.productName.localeCompare(b.productName) * dir;
      if (sortKey === "stock") return (a.quantityOnHand - b.quantityOnHand) * dir;
      const ea = getDaysUntilExpiry(a.expiryDate) ?? 9999;
      const eb = getDaysUntilExpiry(b.expiryDate) ?? 9999;
      return (ea - eb) * dir;
    });
    return list;
  }, [inventory, search, stockFilter, sortKey, sortDir]);

  const filteredMovements = useMemo(() => {
    let list = [...movements];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.inventoryItem.variant.product.name.toLowerCase().includes(q) || m.reference?.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [movements, search]);

  const toggleSort = useCallback((key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }, [sortKey]);

  const handleOpenDrawer = useCallback((item: StockProductModel) => {
    setAdjustTarget(item);
    setDrawerOpen(true);
  }, []);

  const handleSaveAdjustment = useCallback(
    async (data: StockAdjustmentSubmitData) => {
      if (!adjustTarget) return;
      try {
        await apiClient.post("/inventory/adjust", {
          variantId: adjustTarget.productId,
          type: data.movementType,
          quantity: data.quantity,
          reference: data.reference,
          note: data.note,
        });
        await loadData();
        toast("success", `Stock de « ${adjustTarget.productName} » ajusté de ${data.quantity > 0 ? "+" : ""}${data.quantity}`);
        setDrawerOpen(false);
        setAdjustTarget(null);
      } catch (err) {
        toast("error", err instanceof ApiError ? err.message : "Impossible d'ajuster le stock");
      }
    },
    [adjustTarget, toast, loadData],
  );

  return (
    <div className="space-y-6 min-h-screen bg-[#FFF5F5]/40 p-2 sm:p-6 text-slate-800">
      {/* ── Top Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
            <Boxes size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#881337]">Gestion des Stocks</h1>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {loadError ? loadError : `${inventory.length} produits synchronisés en temps réel depuis l'API`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#E11D48]" : ""} />
            Actualiser
          </button>
          <button
            type="button"
            onClick={() => setView(view === "inventory" ? "movements" : "inventory")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E11D48] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#BE123C] transition-all active:scale-95"
          >
            <SlidersHorizontal size={14} />
            {view === "inventory" ? "Journal des Mouvements" : "Vue Inventaire"}
          </button>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl bg-white p-3.5 shadow-xs border-l-4 border-l-emerald-500 border border-slate-200/80">
          <span className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">En stock</span>
          <p className="text-xl font-black text-slate-900 mt-0.5 tabular-nums">{totalOnHand}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 shadow-xs border-l-4 border-l-blue-500 border border-slate-200/80">
          <span className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">Réservé</span>
          <p className="text-xl font-black text-slate-900 mt-0.5 tabular-nums">{totalReserved}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 shadow-xs border-l-4 border-l-[#E11D48] border border-slate-200/80">
          <span className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">Disponible</span>
          <p className="text-xl font-black text-[#E11D48] mt-0.5 tabular-nums">{totalAvailable}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 shadow-xs border-l-4 border-l-rose-600 border border-slate-200/80">
          <span className="text-[0.6875rem] font-bold text-rose-700 uppercase tracking-wider">Ruptures</span>
          <p className="text-xl font-black text-rose-600 mt-0.5 tabular-nums">{outOfStock}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 shadow-xs border-l-4 border-l-amber-500 border border-slate-200/80">
          <span className="text-[0.6875rem] font-bold text-amber-700 uppercase tracking-wider">Stock faible</span>
          <p className="text-xl font-black text-amber-600 mt-0.5 tabular-nums">{lowStock}</p>
        </div>
        <div className="rounded-2xl bg-white p-3.5 shadow-xs border-l-4 border-l-slate-400 border border-slate-200/80">
          <span className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">Valeur Stock</span>
          <p className="text-xl font-black text-slate-900 mt-0.5 tabular-nums">
            {Math.round(stockValue).toLocaleString("fr-TN")} DT
          </p>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom de produit, marque, SKU..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48] transition-all"
          />
        </div>

        {view === "inventory" && (
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48]"
          >
            <option value="ALL">Tous les niveaux de stock</option>
            <option value="OUT">Ruptures ({outOfStock})</option>
            <option value="LOW">Stock faible ({lowStock})</option>
          </select>
        )}
      </div>

      {/* ── Inventory Table with Product Images ───────────────────────── */}
      {view === "inventory" && (
        <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-rose-50/30 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">
                    <button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                      PRODUIT <ArrowUpDown size={11} />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 hidden md:table-cell">SKU</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">NUMÉRO DE LOT</th>
                  <th className="py-3.5 px-4">
                    <button type="button" onClick={() => toggleSort("stock")} className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
                      STOCK DISPONIBLE <ArrowUpDown size={11} />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">SEUIL D&apos;ALERTE</th>
                  <th className="py-3.5 px-4">PÉREMPTION</th>
                  <th className="py-3.5 px-4 text-right">AJUSTER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {!loading && filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                      Aucun produit en stock ne correspond à ces critères.
                    </td>
                  </tr>
                )}
                {filteredInventory.map((item) => {
                  const available = item.quantityOnHand - item.quantityReserved;
                  const isOut = item.quantityOnHand === 0;
                  const isLow = item.quantityOnHand > 0 && item.quantityOnHand <= item.reorderThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                      {/* Product Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                            <img
                              src={item.image || "/assets/product-tube.webp"}
                              alt={item.productName}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{item.productName}</p>
                            <p className="text-[0.6875rem] font-bold text-slate-500">{item.brand}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell font-mono text-slate-600 text-[0.6875rem] font-semibold">
                        {item.sku}
                      </td>

                      <td className="py-3.5 px-4 hidden lg:table-cell font-mono text-slate-600 text-[0.6875rem]">
                        {item.batchNumber || "—"}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tabular-nums ${
                              isOut
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : isLow
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isOut ? "bg-rose-600 pulse-dot" : isLow ? "bg-amber-600 pulse-dot" : "bg-emerald-500"}`} />
                            {item.quantityOnHand} unit.
                          </span>
                          <span className="text-[0.6875rem] font-bold text-slate-500">
                            (Dispo: {available})
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden sm:table-cell font-bold text-slate-700 tabular-nums">
                        {item.reorderThreshold} unit.
                      </td>

                      <td className="py-3.5 px-4">
                        <ExpiryBadge date={item.expiryDate} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#E11D48] hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
                        >
                          <Pencil size={13} />
                          Ajuster
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Stock Movement History Journal ───────────────────────────── */}
      {view === "movements" && (
        <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-rose-50/30 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">HORODATAGE</th>
                  <th className="py-3.5 px-4">PRODUIT</th>
                  <th className="py-3.5 px-4">TYPE DE MOUVEMENT</th>
                  <th className="py-3.5 px-4 text-right">VARIATION QUANTITÉ</th>
                  <th className="py-3.5 px-4">RÉFÉRENCE</th>
                  <th className="py-3.5 px-4">MOTIF / REMARQUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {!loading && filteredMovements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                      Aucun mouvement de stock enregistré.
                    </td>
                  </tr>
                )}
                {filteredMovements.map((m) => {
                  const typeInfo = STOCK_MOVEMENT_MAP[m.type] || { label: m.type, badge: "bg-slate-100 text-slate-700" };
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{formatDate(m.createdAt)}</p>
                        <p className="text-[0.6875rem] text-slate-500 font-medium">{timeAgo(m.createdAt)}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{m.inventoryItem.variant.product.name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[0.6875rem] font-bold border ${typeInfo.badge}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm tabular-nums">
                        <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
                          {isPositive ? "+" : ""}{m.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-bold text-[0.6875rem]">
                        {m.reference || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{m.note || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Stock Drawer Component ───────────────────────────────────── */}
      <StockDrawer
        open={drawerOpen}
        item={adjustTarget}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveAdjustment}
      />
    </div>
  );
}
