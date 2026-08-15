"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ClipboardList, Plus, Send, XCircle, PackageCheck } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from "@paratunisie/ui";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/toast";
import { formatDate } from "@/lib/utils";
import { PurchaseOrderDrawer, type CreatePurchaseOrderInput } from "@/components/purchase-order-drawer";
import { ReceivePurchaseOrderDrawer, type ReceiveLineInput } from "@/components/receive-purchase-order-drawer";

/* ─── API response shapes ──────────────────────────────────────────────── */

type PurchaseOrderStatus = "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

interface ApiPurchaseOrderLine {
  id: string;
  variantId: string;
  quantity: number;
  unitCostMillimes: number;
  quantityReceived: number;
  variant: { label: string; product: { name: string } };
}

interface ApiPurchaseOrder {
  id: string;
  status: PurchaseOrderStatus;
  expectedDate: string | null;
  createdAt: string;
  supplier: { id: string; name: string };
  lines: ApiPurchaseOrderLine[];
}

interface ApiSupplier {
  id: string;
  name: string;
}

interface ApiCatalogProduct {
  id: string;
  name: string;
  brand?: { name: string };
  variants?: { id: string; label: string }[];
}

const STATUS_LABEL: Record<PurchaseOrderStatus, { label: string; variant: "neutral" | "info" | "warning" | "success" | "danger" }> = {
  DRAFT: { label: "Brouillon", variant: "neutral" },
  SENT: { label: "Envoyé", variant: "info" },
  PARTIALLY_RECEIVED: { label: "Partiellement reçu", variant: "warning" },
  RECEIVED: { label: "Reçu", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "danger" },
};

function poReference(po: ApiPurchaseOrder) {
  return `BC-${po.id.slice(-6).toUpperCase()}`;
}

function poTotalMillimes(po: ApiPurchaseOrder) {
  return po.lines.reduce((sum, l) => sum + l.quantity * l.unitCostMillimes, 0);
}

export default function AchatsPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ApiPurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [variants, setVariants] = useState<{ variantId: string; productName: string; brand: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState<ApiPurchaseOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.get<ApiPurchaseOrder[]>("/purchasing/purchase-orders");
      setOrders(data);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Impossible de charger les bons de commande");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    apiClient.get<ApiSupplier[]>("/suppliers").then(setSuppliers).catch(() => {});
    // /catalogue/products returns a paginated envelope ({ data, meta }), not
    // a bare array — .flatMap() on the raw response threw (silently swallowed
    // by the empty .catch below), so this picker was always empty (D-0035).
    apiClient.get<{ data: ApiCatalogProduct[] }>("/catalogue/products?limit=500").then((res) => {
      const opts = (res?.data ?? []).flatMap((p) =>
        (p.variants ?? []).map((v) => ({
          variantId: v.id,
          productName: p.name,
          brand: p.brand?.name ?? "—",
          label: v.label,
        })),
      );
      setVariants(opts);
    }).catch(() => {});
  }, [loadOrders]);

  const kpis = useMemo(() => {
    const open = orders.filter((o) => o.status === "SENT" || o.status === "PARTIALLY_RECEIVED").length;
    const received = orders.filter((o) => o.status === "RECEIVED").length;
    const totalValueMillimes = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + poTotalMillimes(o), 0);
    return { total: orders.length, open, received, totalValueMillimes };
  }, [orders]);

  async function handleCreate(data: CreatePurchaseOrderInput) {
    try {
      await apiClient.post("/purchasing/purchase-orders", data);
      toast("success", "Bon de commande créé.");
      await loadOrders();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible de créer le bon de commande");
    }
  }

  async function handleSend(po: ApiPurchaseOrder) {
    try {
      await apiClient.post(`/purchasing/purchase-orders/${po.id}/send`);
      toast("success", `${poReference(po)} envoyé au fournisseur.`);
      await loadOrders();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible d'envoyer ce bon de commande");
    }
  }

  async function handleCancel(po: ApiPurchaseOrder) {
    try {
      await apiClient.post(`/purchasing/purchase-orders/${po.id}/cancel`);
      toast("success", `${poReference(po)} annulé.`);
      await loadOrders();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible d'annuler ce bon de commande");
    }
  }

  async function handleReceive(lines: ReceiveLineInput[]) {
    if (!receiveTarget) return;
    try {
      await apiClient.post(`/purchasing/purchase-orders/${receiveTarget.id}/receive`, { lines });
      toast("success", `Réception enregistrée pour ${poReference(receiveTarget)}.`);
      await loadOrders();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : "Impossible d'enregistrer la réception");
    } finally {
      setReceiveTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
            <ClipboardList size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">Achats & Réceptions</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              {loadError ?? "Bons de commande fournisseurs et réceptions de marchandise"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus size={15} />
          Nouveau bon de commande
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">Total bons</span>
          <p className="text-xl font-extrabold text-ink mt-1 tabular-nums">{kpis.total}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-blue-500">
          <span className="text-[0.6875rem] font-semibold text-blue-700 uppercase tracking-wider">En cours</span>
          <p className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">{kpis.open}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <span className="text-[0.6875rem] font-semibold text-emerald-700 uppercase tracking-wider">Reçus</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1 tabular-nums">{kpis.received}</p>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-primary">
          <span className="text-[0.6875rem] font-semibold text-primary uppercase tracking-wider">Valeur totale</span>
          <p className="text-xl font-extrabold text-primary mt-1 tabular-nums">{(kpis.totalValueMillimes / 1000).toFixed(3)} DT</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-alt">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date attendue</TableHead>
              <TableHead>Lignes</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-ink-faint font-semibold">
                  Aucun bon de commande. Créez-en un pour réapprovisionner un fournisseur.
                </TableCell>
              </TableRow>
            )}
            {orders.map((po) => {
              const statusInfo = STATUS_LABEL[po.status];
              const canReceive = po.status === "SENT" || po.status === "PARTIALLY_RECEIVED";
              return (
                <TableRow key={po.id}>
                  <TableCell className="font-mono font-semibold">{poReference(po)}</TableCell>
                  <TableCell>{po.supplier.name}</TableCell>
                  <TableCell>{po.expectedDate ? formatDate(po.expectedDate) : "—"}</TableCell>
                  <TableCell>{po.lines.length}</TableCell>
                  <TableCell className="tabular-nums">{(poTotalMillimes(po) / 1000).toFixed(3)} DT</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {po.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={() => handleSend(po)}
                          className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-ink transition-colors"
                          title="Envoyer au fournisseur"
                        >
                          <Send size={13} />
                        </button>
                      )}
                      {canReceive && (
                        <button
                          type="button"
                          onClick={() => setReceiveTarget(po)}
                          className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-primary transition-colors"
                          title="Réceptionner"
                        >
                          <PackageCheck size={13} />
                        </button>
                      )}
                      {po.status !== "RECEIVED" && po.status !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => handleCancel(po)}
                          className="p-1.5 rounded-lg hover:bg-danger-bg text-danger transition-colors"
                          title="Annuler"
                        >
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PurchaseOrderDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        suppliers={suppliers}
        variants={variants}
        onSave={handleCreate}
      />

      {receiveTarget && (
        <ReceivePurchaseOrderDrawer
          open={!!receiveTarget}
          onClose={() => setReceiveTarget(null)}
          poReference={poReference(receiveTarget)}
          lines={receiveTarget.lines.map((l) => ({
            lineId: l.id,
            productName: l.variant.product.name,
            variantLabel: l.variant.label,
            quantity: l.quantity,
            quantityReceived: l.quantityReceived,
          }))}
          onSave={handleReceive}
        />
      )}
    </div>
  );
}
