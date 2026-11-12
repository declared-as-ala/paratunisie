"use client";

import { Suspense } from "react";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ShoppingBag,
  Plus,
  ChevronDown,
  X,
  Package,
  Wallet,
  Truck,
  Phone,
  MessageCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  PackageCheck,
  Undo2,
} from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";
import { apiClient, ApiError, resolveMediaUrl } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { notifyOrdersChanged, onOrdersChanged } from "@/lib/order-events";
import { AramexBadge, getAramexStatusConfig } from "@/components/aramex/aramex-badge";
import { AramexShipmentModal } from "@/components/aramex/aramex-shipment-modal";
import { canTransition } from "@/lib/order-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@paratunisie/ui";
import { FilterChips } from "@/components/ui/filter-chips";
import { aramexBucket, countAramexBuckets, matchesAramexFilter, matchesPeriod, type AramexFilter } from "@/lib/order-filters";
import { AramexTrackingDrawer } from "@/components/aramex/aramex-tracking-drawer";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface OrderItemExt {
  productId?: string;
  productVariantId?: string;
  productName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
  equipe?: string;
  taille?: string;
  bundleName?: string;
}

export interface ShipmentExt {
  id?: string;
  carrier?: string;
  tracking?: string;
  hawb?: string;
  labelUrl?: string | null;
  status?: string;
  trackingStatus?: string | null;
  trackingCode?: string | null;
  trackingLabel?: string | null;
  trackingDescription?: string | null;
  trackingLocation?: string | null;
  trackingEvents?: string | null;
  lastAramexSync?: string | null;
  lastTrackingUpdate?: string | null;
  deliveredAt?: string | null;
  returnedAt?: string | null;
  weightKg?: number;
  pieces?: number;
  codAmountMillimes?: number;
}

interface CustomOrder {
  id: string;
  reference: string;
  customerName: string;
  isRegularClient?: boolean;
  createdAt?: string;
  date: string;
  phone: string;
  phone2?: string;
  email?: string;
  city: string;
  address: string;
  status: OrderStatus | "TENTATIVE";
  total: number;
  subtotal: number;
  shippingFee: number;
  privateNote?: string;
  customerNote?: string;
  isExchange?: boolean;
  items: OrderItemExt[];
  shipment?: ShipmentExt | null;
}

// Admin-only — GET /profitability/orders/:id. Independent of CustomOrder above,
// which has no cost data (see admin-only Rentabilité section note near its fetch).
interface OrderProfitabilityDetail {
  totals: {
    revenueMillimes: number;
    eligibleRevenueMillimes: number;
    costMillimes: number;
    gainMillimes: number | null;
    tauxMarge: number | null;
    costCoverage: number;
  };
  lines: {
    productName: string;
    brand: string;
    variantLabel: string;
    quantity: number;
    unitSellingPriceMillimes: number;
    unitCostMillimes: number | null;
    revenueMillimes: number;
    costMillimes: number | null;
    gainMillimes: number | null;
    costIsEstimated: boolean;
    costSource: "snapshot" | "backfilled_estimate" | "unknown";
  }[];
}

export interface AbandonedCheckoutItem {
  productId?: string;
  name?: string;
  image?: string;
  variantLabel?: string;
  quantity: number;
  priceMillimes: number;
}

export interface AbandonedCheckout {
  id: string;
  checkoutSessionId: string;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  gouvernorat?: string | null;
  fullAddress?: string | null;
  deliveryNote?: string | null;
  items: string;
  parsedItems: AbandonedCheckoutItem[];
  itemCount: number;
  subtotalMillimes: number;
  shippingFeeMillimes: number;
  totalMillimes: number;
  source: "CHECKOUT_PAGE" | "BUY_NOW_MODAL" | "PACK_ANTI_STRESS" | string;
  sourceUrl?: string | null;
  status: "DRAFT" | "ABANDONED" | "CONVERTED" | "ARCHIVED";
  convertedOrderId?: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

const COST_SOURCE_LABEL: Record<string, string> = {
  snapshot: "Historique",
  backfilled_estimate: "Estimé (rétroactif)",
  unknown: "Inconnu",
};

// GET /orders/counts — canonical source shared with the sidebar badge.
interface OrderCounts {
  total: number;
  normal: number;
  abandoned: number;
  deleted: number;
  byStatus: Record<string, number>;
}

interface CatalogProduct {
  id: string;
  name: string;
  brand?: { name: string };
  category?: { name: string };
  variants?: { id: string; label: string; priceMillimes: number }[];
  image?: string;
}

interface ApiOrderItem {
  product?: { name?: string };
  quantity?: number;
  priceMillimes?: number;
}

interface ApiOrder {
  id?: string;
  createdAt?: string;
  gouvernorat?: string;
  fullAddress?: string;
  totalMillimes?: number;
  status?: string;
  user?: { name?: string; phone?: string; email?: string; orders?: unknown[] };
  items?: ApiOrderItem[];
}

const fallbackOrders: CustomOrder[] = [
  {
    id: "53384",
    reference: "#53384",
    customerName: "RAED Y",
    isRegularClient: true,
    date: "09/08/2026",
    phone: "27578505",
    phone2: "",
    email: "raed@paratunisie.tn",
    city: "Bizerte",
    address: "JARJOUNA BALADIYET WED ROMEN",
    status: "CONFIRMEE",
    total: 65.900,
    subtotal: 58.900,
    shippingFee: 7.000,
    privateNote: "Client habituel",
    customerNote: "Appeler avant la livraison",
    isExchange: false,
    items: [
      {
        productName: "Anthelios Fluide Invisible SPF50+",
        brand: "La Roche-Posay",
        quantity: 1,
        unitPrice: 58.900,
        lineTotal: 58.900,
      },
    ],
  },
  {
    id: "53372",
    reference: "#53372",
    customerName: "RAED Y",
    isRegularClient: true,
    date: "01/08/2026",
    phone: "27578505",
    phone2: "",
    email: "raed@paratunisie.tn",
    city: "Bizerte",
    address: "JARJOUNA BALADIYET WED ROMEN",
    status: "CONFIRMEE",
    total: 89.900,
    subtotal: 82.900,
    shippingFee: 7.000,
    privateNote: "Commande précédente",
    customerNote: "",
    isExchange: false,
    items: [
      {
        productName: "Crème Hydratante Visage 340ml",
        brand: "CeraVe",
        quantity: 1,
        unitPrice: 82.900,
        lineTotal: 82.900,
      },
    ],
  },
  {
    id: "53383",
    reference: "#53383",
    customerName: "Amira Ben Salah",
    isRegularClient: false,
    date: "09/08/2026",
    phone: "22765421",
    city: "Tunis",
    address: "Avenue Habib Bourguiba, Le Kram",
    status: "EN_ATTENTE",
    total: 43.900,
    subtotal: 36.900,
    shippingFee: 7.000,
    items: [
      {
        productName: "Sensibio H2O",
        brand: "Bioderma",
        quantity: 1,
        unitPrice: 36.900,
        lineTotal: 36.900,
      },
    ],
  },
  {
    id: "53381",
    reference: "#53381",
    customerName: "Mohamed Karoui",
    isRegularClient: false,
    date: "09/08/2026",
    phone: "29522746",
    city: "Sfax",
    address: "Route de Teniour Km 3",
    status: "TENTATIVE",
    total: 49.500,
    subtotal: 42.500,
    shippingFee: 7.000,
    items: [
      {
        productName: "Crème Hydratante Visage",
        brand: "CeraVe",
        quantity: 1,
        unitPrice: 42.500,
        lineTotal: 42.500,
      },
    ],
  },
  {
    id: "53380",
    reference: "#53380",
    customerName: "Fatma Slimani",
    isRegularClient: true,
    date: "09/08/2026",
    phone: "28694036",
    city: "Sousse",
    address: "Kantaoui Center",
    status: "ANNULEE",
    total: 98.000,
    subtotal: 91.000,
    shippingFee: 7.000,
    items: [
      {
        productName: "Liftactiv Sérum Vitamine C",
        brand: "Vichy",
        quantity: 1,
        unitPrice: 91.000,
        lineTotal: 91.000,
      },
    ],
  },
];

const TUNISIA_CITIES = [
  "Bizerte",
  "Tunis",
  "Sfax",
  "Sousse",
  "Kairouan",
  "Nabeul",
  "Monastir",
  "Gabès",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Gafsa",
  "Béja",
  "Jendouba",
  "Kasserine",
  "Kef",
  "Mahdia",
  "Médenine",
  "Sidi Bouzid",
  "Siliana",
  "Tataouine",
  "Tozeur",
  "Zaghouan",
];

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "TENTATIVE_CONTACT", label: "Tentative de contact" },
  { value: "CONFIRMEE", label: "Confirmée" },
  { value: "PREPARATION", label: "En préparation" },
  { value: "PRETE_EXPEDITION", label: "Prête à expédier" },
  { value: "EXPEDIEE", label: "Expédiée" },
  { value: "LIVREE", label: "Livrée" },
  { value: "ECHEC_LIVRAISON", label: "Échec de livraison" },
  { value: "RETOURNEE", label: "Retournée" },
  { value: "ANNULEE", label: "Annulée" },
  { value: "REFUSEE", label: "Refusée" },
];
const ARAMEX_FILTER_LABEL: Record<string, string> = {
  NOT_SHIPPED: "non expédiées", CREATED: "créées", IN_TRANSIT: "en transit", OUT_FOR_DELIVERY: "en livraison",
  DELIVERED: "livrées", DELIVERY_ATTEMPT: "tentatives", EXCEPTION: "exceptions", PROBLEMS: "tentatives + problèmes",
  RETURNING: "retour en cours", RETURNED: "retournées", RETURNS: "tous les retours", CANCELLED: "annulées",
};
const PERIOD_LABEL: Record<string, string> = { today: "aujourd'hui", week: "7 jours", month: "ce mois" };
const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));


/* ─── Page Component ─────────────────────────────────────────────────── */

function CommandesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"NORMAL" | "ABANDONNEES" | "SUPPRIMEES">("NORMAL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [aramexFilter, setAramexFilter] = useState<string>("ALL");
  const [statusReason, setStatusReason] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<CustomOrder | null>(null);
  const [orderCounts, setOrderCounts] = useState<OrderCounts | null>(null);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Aramex Integration States
  const [aramexModalOrder, setAramexModalOrder] = useState<CustomOrder | null>(null);
  const [aramexTrackingTarget, setAramexTrackingTarget] = useState<{
    orderId: string;
    hawb: string;
    labelUrl?: string | null;
  } | null>(null);
  const [drawerAramexSyncing, setDrawerAramexSyncing] = useState(false);

  // Abandoned Checkouts States
  const [abandonedList, setAbandonedList] = useState<AbandonedCheckout[]>([]);
  const [loadingAbandoned, setLoadingAbandoned] = useState(false);
  const [selectedAbandoned, setSelectedAbandoned] = useState<AbandonedCheckout | null>(null);
  const [convertingAbandonedId, setConvertingAbandonedId] = useState<string | null>(null);
  const [abandonedDeleteTarget, setAbandonedDeleteTarget] = useState<AbandonedCheckout | null>(null);

  const loadAbandonedCheckouts = useCallback(async () => {
    setLoadingAbandoned(true);
    try {
      const data = await apiClient.get<AbandonedCheckout[]>(`/abandoned-checkouts?search=${encodeURIComponent(search)}`);
      setAbandonedList(data || []);
    } catch {
      setAbandonedList([]);
    } finally {
      setLoadingAbandoned(false);
    }
  }, [search]);

  // Creating an order from an abandoned checkout now requires the admin to affirm the customer's explicit
  // confirmation, which lives in the dedicated module — never a one-click conversion from this list.
  const handleConvertAbandoned = async (_abandoned: AbandonedCheckout) => {
    window.location.href = "/admin/commandes-abandonnees";
  };

  const handleDeleteAbandoned = async () => {
    if (!abandonedDeleteTarget) return;
    try {
      await apiClient.delete(`/abandoned-checkouts/${abandonedDeleteTarget.id}`);
      toast("success", "Commande abandonnée supprimée");
      setAbandonedDeleteTarget(null);
      notifyOrdersChanged();
      loadAbandonedCheckouts();
      loadOrderCounts();
    } catch (err: any) {
      toast("error", err.message || "Erreur lors de la suppression");
    }
  };

  // Canonical counts (sidebar badge reads the same endpoint) — refetched on
  // mount and whenever an order mutation fires the shared invalidation event,
  // so header/tab numbers never need a manual page reload to catch up.
  const loadOrderCounts = useCallback(async () => {
    try {
      const counts = await apiClient.get<OrderCounts>("/orders/counts");
      setOrderCounts(counts);
    } catch {
      // Non-fatal — displayed counts just fall back to the local derivation.
    }
  }, []);

  useEffect(() => {
    loadOrderCounts();
    return onOrdersChanged(() => {
      loadOrderCounts();
      setOrdersRefreshKey((k) => k + 1);
    });
  }, [loadOrderCounts]);

  useEffect(() => {
    if (activeTab === "ABANDONNEES") {
      loadAbandonedCheckouts();
    }
  }, [activeTab, loadAbandonedCheckouts, ordersRefreshKey]);

  // 1. Fetch Real Orders from NestJS API
  useEffect(() => {
    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const data = await apiClient.get<any[]>("/orders");
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CustomOrder[] = data.map((o: any, idx: number) => {
            const items: OrderItemExt[] = o.items?.map((item: any) => ({
              productId: item.productId || item.product?.id,
              productVariantId: item.productVariantId || item.productVariant?.id,
              productName: item.product?.name || "Produit Parapharmacie",
              brand: item.product?.brand?.name || "ParaTunisie",
              quantity: item.quantity || 1,
              unitPrice: Math.round((item.priceMillimes || 0) / 1000),
              lineTotal: Math.round(((item.priceMillimes || 0) * (item.quantity || 1)) / 1000),
              image: item.product?.image,
            })) || [];

            const calculatedSubtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
            const defaultShipping = 10; // Default shipping fee: 10 DT
            const rawTotal = Math.round((o.totalMillimes || 0) / 1000);
            const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : (rawTotal > defaultShipping ? rawTotal - defaultShipping : rawTotal);
            const shippingFee = defaultShipping;
            const total = subtotal + shippingFee;

            return {
              id: o.id || `cmd-${idx}`,
              reference: `#${o.id?.slice(-5) || 53380 + idx}`,
              customerName: o.user?.name || "Client ParaTunisie",
              isRegularClient: Boolean(o.user?.orders && o.user.orders.length > 1),
              createdAt: o.createdAt || undefined,
              date: new Date(o.createdAt || Date.now()).toLocaleDateString("fr-FR"),
              phone: o.user?.phone || "",
              phone2: "",
              email: o.user?.email || "",
              city: o.gouvernorat || "Tunis",
              address: o.fullAddress || "Adresse client",
              status: (o.status || "EN_ATTENTE") as OrderStatus,
              total,
              subtotal,
              shippingFee,
              shipment: o.shipment
                ? {
                    id: o.shipment.id,
                    carrier: o.shipment.carrier,
                    tracking: o.shipment.tracking,
                    hawb: o.shipment.hawb || o.shipment.tracking,
                    labelUrl: o.shipment.labelUrl,
                    status: o.shipment.status,
                    trackingStatus: o.shipment.trackingStatus || null,
                    trackingCode: o.shipment.trackingCode || null,
                    trackingLabel: o.shipment.trackingLabel || null,
                    trackingDescription: o.shipment.trackingDescription || null,
                    trackingLocation: o.shipment.trackingLocation || null,
                    trackingEvents: o.shipment.trackingEvents || null,
                    lastAramexSync: o.shipment.lastAramexSync || null,
                    lastTrackingUpdate: o.shipment.lastTrackingUpdate || null,
                    deliveredAt: o.shipment.deliveredAt || null,
                    returnedAt: o.shipment.returnedAt || null,
                    weightKg: o.shipment.weightKg,
                    pieces: o.shipment.pieces,
                    codAmountMillimes: o.shipment.codAmountMillimes,
                  }
                : null,
              items,
            };
          });
          setOrders(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch orders from NestJS API, using seeded orders", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [ordersRefreshKey]);

  // 2. Real-time catalog search for the drawer's product picker — same
  // Meilisearch-backed search the storefront uses (via /catalogue/products'
  // `search` param), not a client-side filter over one fixed batch. A fixed
  // batch (even a large one) can never cover the full ~9,700-product catalog,
  // so admins searching for something outside that batch always got "no
  // results" for products that genuinely exist (D-0036). Debounced like the
  // storefront's own search-as-you-type.
  useEffect(() => {
    let cancelled = false;
    setProductSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const q = productSearchQuery.trim();
        const url = q
          ? `/catalogue/products?search=${encodeURIComponent(q)}&limit=50`
          : "/catalogue/products?limit=50";
        const res = await apiClient.get<{ data: CatalogProduct[] }>(url);
        if (!cancelled) setCatalogProducts(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.warn("Could not search catalog products from NestJS API", err);
        if (!cancelled) setCatalogProducts([]);
      } finally {
        if (!cancelled) setProductSearchLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [productSearchQuery]);

  // Direct component state for immediate drawer reactivity
  const [activeDrawer, setActiveDrawer] = useState<{ mode: "edit" | "view"; orderId: string } | null>(() => {
    const editParam = params.get("edit");
    const viewParam = params.get("view");
    if (editParam) return { mode: "edit", orderId: editParam };
    if (viewParam) return { mode: "view", orderId: viewParam };
    return null;
  });

  const isDrawerOpen = Boolean(activeDrawer);
  const drawerMode = activeDrawer?.mode ?? null;
  const targetId = activeDrawer?.orderId ?? null;

  // Active order object for editing
  const activeOrderObj = useMemo(() => {
    if (!targetId) return null;
    if (targetId === "new") {
      return {
        id: "NEW-ORDER",
        reference: "#50000",
        customerName: "",
        date: "09/08/2026",
        phone: "",
        phone2: "",
        email: "",
        city: "Tunis",
        address: "",
        status: "EN_ATTENTE" as const,
        total: 8,
        subtotal: 0,
        shippingFee: 8,
        items: [],
      } as CustomOrder;
    }
    return orders.find((o) => o.id === targetId || o.reference === targetId || `#${o.id}` === targetId) || orders[0];
  }, [targetId, orders]);

  // Admin-only Rentabilité section — independent fetch from the real profitability
  // endpoint (item-level cost snapshots), not derived from the mock-shaped order
  // state above which carries no cost data. Never shown to the storefront/customer.
  const [orderProfitability, setOrderProfitability] = useState<OrderProfitabilityDetail | null>(null);
  const [profitabilityError, setProfitabilityError] = useState<string | null>(null);
  useEffect(() => {
    if (!targetId || targetId === "new") {
      setOrderProfitability(null);
      setProfitabilityError(null);
      return;
    }
    let active = true;
    apiClient
      .get<OrderProfitabilityDetail>(`/profitability/orders/${targetId}`)
      .then((data) => {
        if (active) setOrderProfitability(data);
      })
      .catch((err) => {
        if (active) {
          setOrderProfitability(null);
          setProfitabilityError(err instanceof ApiError ? err.message : "Rentabilité indisponible pour cette commande");
        }
      });
    return () => {
      active = false;
    };
  }, [targetId]);

  // Active order notification history
  const [orderNotifications, setOrderNotifications] = useState<any[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId || targetId === "new") {
      setOrderNotifications([]);
      return;
    }
    let active = true;
    apiClient
      .get<any[]>(`/notifications/order/${targetId}`)
      .then((data) => {
        if (active) setOrderNotifications(data || []);
      })
      .catch(() => {
        if (active) setOrderNotifications([]);
      });
    return () => {
      active = false;
    };
  }, [targetId]);

  const handleRetryNotification = useCallback(async (deliveryId: string) => {
    setRetryingId(deliveryId);
    try {
      const updated = await apiClient.post<any>(`/notifications/retry/${deliveryId}`);
      setOrderNotifications((prev) =>
        prev.map((item) => (item.id === deliveryId ? updated : item))
      );
      toast("success", "Notification renvoyée avec succès");
    } catch (err: any) {
      toast("error", err instanceof ApiError ? err.message : "Échec du renvoi de la notification");
    } finally {
      setRetryingId(null);
    }
  }, [toast]);

  // Form State inside Drawer
  const [editingForm, setEditingForm] = useState<CustomOrder | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const formData = editingForm ?? activeOrderObj;

  const handleOpenEdit = useCallback((id: string) => {
    setActiveDrawer({ mode: "edit", orderId: id });
    setEditingForm(null);
    setProductSearchQuery("");
    router.push(`/admin/commandes?edit=${id}`, { scroll: false });
  }, [router]);

  const handleOpenView = useCallback((id: string) => {
    setActiveDrawer({ mode: "view", orderId: id });
    setEditingForm(null);
    setProductSearchQuery("");
    router.push(`/admin/commandes?view=${id}`, { scroll: false });
  }, [router]);

  const handleCloseDrawer = useCallback(() => {
    setActiveDrawer(null);
    setEditingForm(null);
    setProductSearchQuery("");
    router.push(`/admin/commandes`, { scroll: false });
  }, [router]);

  const handleShipmentUpdated = useCallback((updatedShipment: any) => {
    if (!updatedShipment) return;
    setOrders((prev) =>
      prev.map((ord) => {
        if (
          ord.id === updatedShipment.orderId ||
          ord.shipment?.id === updatedShipment.id ||
          ord.shipment?.hawb === updatedShipment.hawb
        ) {
          return {
            ...ord,
            shipment: {
              ...ord.shipment,
              id: updatedShipment.id || ord.shipment?.id,
              carrier: updatedShipment.carrier || "aramex",
              tracking: updatedShipment.tracking || updatedShipment.hawb,
              hawb: updatedShipment.hawb || updatedShipment.tracking,
              labelUrl: updatedShipment.labelUrl || ord.shipment?.labelUrl,
              status: updatedShipment.status || ord.shipment?.status,
              trackingStatus: updatedShipment.trackingStatus,
              trackingCode: updatedShipment.trackingCode,
              trackingLabel: updatedShipment.trackingLabel,
              trackingDescription: updatedShipment.trackingDescription,
              trackingLocation: updatedShipment.trackingLocation,
              trackingEvents: updatedShipment.trackingEvents,
              lastAramexSync: updatedShipment.lastAramexSync,
              lastTrackingUpdate: updatedShipment.lastTrackingUpdate,
              deliveredAt: updatedShipment.deliveredAt,
              returnedAt: updatedShipment.returnedAt,
            },
          };
        }
        return ord;
      })
    );
    setEditingForm((prev) => {
      if (!prev) return null;
      if (
        prev.id === updatedShipment.orderId ||
        prev.shipment?.id === updatedShipment.id ||
        prev.shipment?.hawb === updatedShipment.hawb
      ) {
        return {
          ...prev,
          shipment: {
            ...prev.shipment,
            id: updatedShipment.id || prev.shipment?.id,
            carrier: updatedShipment.carrier || "aramex",
            tracking: updatedShipment.tracking || updatedShipment.hawb,
            hawb: updatedShipment.hawb || updatedShipment.tracking,
            labelUrl: updatedShipment.labelUrl || prev.shipment?.labelUrl,
            status: updatedShipment.status || prev.shipment?.status,
            trackingStatus: updatedShipment.trackingStatus,
            trackingCode: updatedShipment.trackingCode,
            trackingLabel: updatedShipment.trackingLabel,
            trackingDescription: updatedShipment.trackingDescription,
            trackingLocation: updatedShipment.trackingLocation,
            trackingEvents: updatedShipment.trackingEvents,
            lastAramexSync: updatedShipment.lastAramexSync,
            lastTrackingUpdate: updatedShipment.lastTrackingUpdate,
            deliveredAt: updatedShipment.deliveredAt,
            returnedAt: updatedShipment.returnedAt,
          },
        };
      }
      return prev;
    });
  }, []);

  const handleSaveOrder = useCallback(async () => {
    if (!formData) return;
    if (formData.id.startsWith("NEW-") || targetId === "new") {
      if (!formData.customerName?.trim()) {
        toast("error", "Veuillez renseigner le nom du client");
        return;
      }
      if (!formData.phone?.trim()) {
        toast("error", "Veuillez renseigner le numéro de téléphone");
        return;
      }
      if (!formData.items || formData.items.length === 0) {
        toast("error", "Veuillez ajouter au moins un produit à la commande");
        return;
      }

      try {
        setSavingOrder(true);
        const nameParts = formData.customerName.trim().split(" ");
        const firstName = nameParts[0] || "Client";
        const lastName = nameParts.slice(1).join(" ") || "";

        const payload = {
          firstName,
          lastName,
          phone: formData.phone.trim(),
          email: formData.email?.trim() || undefined,
          gouvernorat: formData.city || "Tunis",
          fullAddress: formData.address?.trim() || "Adresse client",
          deliveryNote: formData.customerNote?.trim() || undefined,
          items: formData.items.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity || 1,
            priceMillimes: Math.round((item.unitPrice || 0) * 1000),
          })),
        };

        const created = await apiClient.post<any>("/orders", payload);
        toast("success", `Commande créée avec succès (Réf: #${created.id?.slice(-5) || "NEW"})`);
        notifyOrdersChanged();
        loadOrderCounts();
        setOrdersRefreshKey((k) => k + 1);
        handleCloseDrawer();
      } catch (e) {
        toast(
          "error",
          e instanceof ApiError ? e.message : "Impossible de créer la commande",
        );
      } finally {
        setSavingOrder(false);
      }
      return;
    }

    try {
      setSavingOrder(true);
      const current = orders.find((o) => o.id === formData.id)?.status;
      if (current && current !== formData.status) {
        const isNormal = canTransition(current as OrderStatus, formData.status as OrderStatus);
        if (!isNormal && statusReason.trim().length < 5) {
          toast("error", "Indiquez un motif (5 caractères minimum) pour la correction du statut.");
          setSavingOrder(false);
          return;
        }
        await apiClient.patch(`/orders/${formData.id}/status`, {
          status: formData.status,
          ...(isNormal ? {} : { override: true, note: statusReason.trim() }),
        });
        setStatusReason("");
      }
      notifyOrdersChanged();
      loadOrderCounts();
      setOrdersRefreshKey((k) => k + 1);
      toast("success", `Commande ${formData.reference} mise à jour avec succès`);
      handleCloseDrawer();
    } catch (e) {
      toast(
        "error",
        e instanceof ApiError ? e.message : "Impossible de mettre à jour le statut de la commande",
      );
    } finally {
      setSavingOrder(false);
    }
  }, [formData, targetId, orders, statusReason, handleCloseDrawer, loadOrderCounts, toast]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/orders/${deleteTarget.id}`);
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      toast("success", `Commande ${deleteTarget.reference} supprimée`);
      setDeleteTarget(null);
      notifyOrdersChanged();
    } catch (error) {
      toast("error", error instanceof ApiError ? error.message : "Impossible de supprimer la commande");
    }
  }, [deleteTarget, toast]);

  // Add Product to Current Order
  const handleAddProductToOrder = useCallback(
    (product: CatalogProduct) => {
      if (!formData) return;
      const variant = product.variants?.[0];
      const variantPrice = variant?.priceMillimes
        ? Math.round(variant.priceMillimes / 1000)
        : 35;
      const newItem: OrderItemExt = {
        productId: product.id,
        productVariantId: variant?.id,
        productName: product.name,
        brand: product.brand?.name || "ParaTunisie",
        quantity: 1,
        unitPrice: variantPrice,
        lineTotal: variantPrice,
        image: product.image,
      };
      const nextItems = [...formData.items, newItem];
      const nextSubtotal = nextItems.reduce((acc, i) => acc + i.lineTotal, 0);
      setEditingForm({
        ...formData,
        items: nextItems,
        subtotal: nextSubtotal,
        total: nextSubtotal + formData.shippingFee,
      });
      setProductSearchQuery("");
      toast("success", `« ${product.name} » ajouté à la commande`);
    },
    [formData, toast]
  );

  // Remove Item from Current Order
  const handleRemoveItemFromOrder = useCallback(
    (itemIndex: number) => {
      if (!formData) return;
      const nextItems = formData.items.filter((_, idx) => idx !== itemIndex);
      const nextSubtotal = nextItems.reduce((acc, i) => acc + i.lineTotal, 0);
      setEditingForm({
        ...formData,
        items: nextItems,
        subtotal: nextSubtotal,
        total: nextSubtotal + formData.shippingFee,
      });
    },
    [formData]
  );

  // Tab-filtering (ABANDONNEE/SUPPRIMEE aren't real OrderStatus values today —
  // filtering against them is harmless, just always empty against real data).
  const normalCountLocal = useMemo(
    () => orders.filter((o) => (o.status as string) !== "ABANDONNEE" && (o.status as string) !== "SUPPRIMEE").length,
    [orders]
  );
  const abandonedCountLocal = useMemo(
    () => orders.filter((o) => (o.status as string) === "ABANDONNEE").length,
    [orders]
  );
  const deletedCountLocal = useMemo(
    () => orders.filter((o) => (o.status as string) === "SUPPRIMEE").length,
    [orders]
  );

  // Displayed badge numbers come from the canonical /orders/counts endpoint —
  // the same one the sidebar badge reads — so the two can never drift again.
  // Falls back to the locally-derived count while that fetch is in flight.
  const normalCount = orderCounts?.normal ?? normalCountLocal;
  const abandonedCount = orderCounts?.abandoned ?? (abandonedList.length > 0 ? abandonedList.length : abandonedCountLocal);
  const deletedCount = orderCounts?.deleted ?? deletedCountLocal;

  // Scope shared by the summary cards, dropdown counters AND the table: tab + search + commercial
  // status + period. Only the Aramex filter is applied after, so a card's number is always the
  // number of rows it shows.
  const scopedOrders = useMemo(() => {
    let list = orders;
    if (activeTab === "NORMAL") {
      list = list.filter((o) => (o.status as string) !== "ABANDONNEE" && (o.status as string) !== "SUPPRIMEE");
    } else if (activeTab === "ABANDONNEES") {
      list = list.filter((o) => (o.status as string) === "ABANDONNEE");
    } else if (activeTab === "SUPPRIMEES") {
      list = list.filter((o) => (o.status as string) === "SUPPRIMEE");
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const digits = q.replace(/\D/g, "");
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (digits.length > 0 && o.phone.replace(/\D/g, "").includes(digits)) ||
          o.city.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") list = list.filter((o) => o.status === statusFilter);
    if (periodFilter !== "ALL") list = list.filter((o) => matchesPeriod(o.createdAt, periodFilter));
    return list;
  }, [orders, activeTab, search, statusFilter, periodFilter]);

  const aramexCounts = useMemo(() => {
    const c = countAramexBuckets(scopedOrders);
    return {
      notShipped: c.NOT_SHIPPED,
      created: c.CREATED,
      inTransit: c.IN_TRANSIT,
      outForDelivery: c.OUT_FOR_DELIVERY,
      delivered: c.DELIVERED,
      attempts: c.DELIVERY_ATTEMPT,
      exceptions: c.EXCEPTION,
      problems: c.problems,
      returning: c.RETURNING,
      returned: c.RETURNED,
      returns: c.returns,
      cancelled: c.CANCELLED,
    };
  }, [scopedOrders]);

  // Filtered List
  const filteredOrders = useMemo(
    () => (aramexFilter === "ALL" ? scopedOrders : scopedOrders.filter((o) => matchesAramexFilter(o.shipment, aramexFilter as AramexFilter))),
    [scopedOrders, aramexFilter]
  );

  const visibleOrderIds = useMemo(() => filteredOrders.map((order) => order.id), [filteredOrders]);
  const visibleSelectedCount = useMemo(
    () => visibleOrderIds.reduce((count, id) => count + (selectedIds.has(id) ? 1 : 0), 0),
    [visibleOrderIds, selectedIds]
  );
  const allVisibleSelected = visibleOrderIds.length > 0 && visibleSelectedCount === visibleOrderIds.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = visibleSelectedCount > 0 && !allVisibleSelected;
    }
  }, [visibleSelectedCount, allVisibleSelected]);

  useEffect(() => {
    const existingIds = new Set(orders.map((order) => order.id));
    setSelectedIds((current) => new Set([...current].filter((id) => existingIds.has(id))));
  }, [orders]);

  const toggleOrder = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllVisibleOrders = useCallback(() => {
    setSelectedIds((current) => {
      const next = new Set(current);
      const shouldSelect = visibleOrderIds.some((id) => !next.has(id));
      visibleOrderIds.forEach((id) => shouldSelect ? next.add(id) : next.delete(id));
      return next;
    });
  }, [visibleOrderIds]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length || bulkDeleting) return;
    setBulkDeleting(true);
    try {
      const result = await apiClient.post<{ count: number }>("/orders/bulk-delete", { ids });
      if (result.count !== ids.length) throw new Error("Suppression incomplète");
      setOrders((current) => current.filter((order) => !selectedIds.has(order.id)));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast("success", `${ids.length} commande${ids.length > 1 ? "s" : ""} supprimée${ids.length > 1 ? "s" : ""}`);
      notifyOrdersChanged();
    } catch (error) {
      toast("error", error instanceof ApiError ? error.message : "Impossible de supprimer les commandes sélectionnées");
    } finally {
      setBulkDeleting(false);
    }
  }, [selectedIds, bulkDeleting, toast]);

  // Group orders by customer (phone or customerName)
  const customerOrdersMap = useMemo(() => {
    const map = new Map<string, CustomOrder[]>();
    for (const order of orders) {
      const key = (order.phone?.trim() || order.customerName?.trim() || "").toLowerCase();
      if (!key) continue;
      const existing = map.get(key) || [];
      existing.push(order);
      map.set(key, existing);
    }
    return map;
  }, [orders]);

  // Counts — sourced from the canonical /orders/counts endpoint (real OrderStatus
  // enum values only), falling back to a local derivation while it loads. This
  // fixes the header/tab-sum mismatch: the previous local count checked for the
  // string "TENTATIVE", but the real enum value is "TENTATIVE_CONTACT", so a
  // real Tentative order was silently counted as zero (3 shown instead of 4).
  const totalCount = orderCounts?.total ?? orders.length;
  const enAttenteCount = orderCounts?.byStatus.EN_ATTENTE ?? orders.filter((o) => o.status === "EN_ATTENTE").length;
  const confirmeeCount = orderCounts?.byStatus.CONFIRMEE ?? orders.filter((o) => o.status === "CONFIRMEE").length;
  const tentativeCount = orderCounts?.byStatus.TENTATIVE_CONTACT ?? orders.filter((o) => (o.status as string) === "TENTATIVE_CONTACT").length;
  const annuleeCount = orderCounts?.byStatus.ANNULEE ?? orders.filter((o) => o.status === "ANNULEE").length;

  return (
    <div className="space-y-4 text-ink">
      <PageHeader
        title="Commandes"
        icon={ShoppingBag}
        description={`${normalCount} commandes · ${filteredOrders.length} affichée${filteredOrders.length > 1 ? "s" : ""}`}
        actions={
          <button
            type="button"
            onClick={() => handleOpenEdit("new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2.5} />
            Ajouter une commande
          </button>
        }
      />

      {/* ── Scope tabs ── */}
      <div className="inline-flex rounded-xl border border-border bg-soft-nude p-1" role="tablist" aria-label="Type de commandes">
        {([
          ["NORMAL", "Normal", normalCount],
          ["ABANDONNEES", "Abandonnées", abandonedCount],
          ["SUPPRIMEES", "Supprimées", deletedCount],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-1.5 text-[0.8125rem] font-semibold transition-all ${
              activeTab === key ? "bg-surface-alt text-primary shadow-sm" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label} <span className="ml-1 tabular-nums opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* ── Shipment summary — each card filters the table with the same scope ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="En transit" icon={Truck} tone="info" value={aramexCounts.inTransit} active={aramexFilter === "IN_TRANSIT"} onClick={() => setAramexFilter(aramexFilter === "IN_TRANSIT" ? "ALL" : "IN_TRANSIT")} />
        <StatCard label="En livraison" icon={PackageCheck} tone="warning" value={aramexCounts.outForDelivery} active={aramexFilter === "OUT_FOR_DELIVERY"} onClick={() => setAramexFilter(aramexFilter === "OUT_FOR_DELIVERY" ? "ALL" : "OUT_FOR_DELIVERY")} />
        <StatCard label="Livrées" icon={CheckCircle2} tone="success" value={aramexCounts.delivered} active={aramexFilter === "DELIVERED"} onClick={() => setAramexFilter(aramexFilter === "DELIVERED" ? "ALL" : "DELIVERED")} />
        <StatCard label="Tentatives / problèmes" icon={AlertTriangle} tone="warning" value={aramexCounts.problems} active={aramexFilter === "PROBLEMS"} onClick={() => setAramexFilter(aramexFilter === "PROBLEMS" ? "ALL" : "PROBLEMS")} />
        <StatCard label="Retours" icon={Undo2} tone="danger" value={aramexCounts.returns} hint={`${aramexCounts.returning} en cours · ${aramexCounts.returned} retournées`} active={aramexFilter === "RETURNS"} onClick={() => setAramexFilter(aramexFilter === "RETURNS" ? "ALL" : "RETURNS")} />
      </div>

      {/* ── Filter bar ── */}
      <div className="admin-card flex flex-wrap items-center gap-2.5 p-3">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (numéro, client, téléphone)…"
            className="field-input pl-9!"
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field-input w-auto!" aria-label="Statut commercial">
          <option value="ALL">Statut commercial : tous ({normalCount})</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({orderCounts?.byStatus[opt.value] ?? orders.filter((o) => o.status === opt.value).length})
            </option>
          ))}
        </select>

        <select value={aramexFilter} onChange={(e) => setAramexFilter(e.target.value)} className="field-input w-auto!" aria-label="Expédition Aramex">
          <option value="ALL">Expédition Aramex : toutes</option>
          <option value="NOT_SHIPPED">Non expédiées ({aramexCounts.notShipped})</option>
          <option value="CREATED">Créées ({aramexCounts.created})</option>
          <option value="IN_TRANSIT">En transit ({aramexCounts.inTransit})</option>
          <option value="OUT_FOR_DELIVERY">En cours de livraison ({aramexCounts.outForDelivery})</option>
          <option value="DELIVERED">Livrées ({aramexCounts.delivered})</option>
          <option value="DELIVERY_ATTEMPT">Tentatives de livraison ({aramexCounts.attempts})</option>
          <option value="EXCEPTION">Problèmes / exceptions ({aramexCounts.exceptions})</option>
          <option value="PROBLEMS">Tentatives + problèmes ({aramexCounts.problems})</option>
          <option value="RETURNING">En cours de retour ({aramexCounts.returning})</option>
          <option value="RETURNED">Retournées ({aramexCounts.returned})</option>
          <option value="RETURNS">Tous les retours ({aramexCounts.returns})</option>
          <option value="CANCELLED">Annulées ({aramexCounts.cancelled})</option>
        </select>

        <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="field-input w-auto!" aria-label="Période">
          <option value="ALL">Toute la période</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      <FilterChips
        resultCount={filteredOrders.length}
        onReset={() => { setSearch(""); setStatusFilter("ALL"); setAramexFilter("ALL"); setPeriodFilter("ALL"); }}
        chips={[
          ...(search.trim() ? [{ key: "q", label: `« ${search.trim()} »`, onRemove: () => setSearch("") }] : []),
          ...(statusFilter !== "ALL" ? [{ key: "s", label: `Statut : ${STATUS_LABEL[statusFilter] ?? statusFilter}`, onRemove: () => setStatusFilter("ALL") }] : []),
          ...(aramexFilter !== "ALL" ? [{ key: "a", label: `Aramex : ${ARAMEX_FILTER_LABEL[aramexFilter] ?? aramexFilter}`, onRemove: () => setAramexFilter("ALL") }] : []),
          ...(periodFilter !== "ALL" ? [{ key: "p", label: `Période : ${PERIOD_LABEL[periodFilter] ?? periodFilter}`, onRemove: () => setPeriodFilter("ALL") }] : []),
        ]}
      />

      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary-soft bg-primary-soft/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <p className="text-sm font-bold text-primary-hover">{selectedIds.size} commande{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedIds(new Set())} className="min-h-11 rounded-xl border border-primary-soft bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-primary-soft/60">Annuler la sélection</button>
            <button type="button" disabled={bulkDeleting} onClick={() => setBulkDeleteOpen(true)} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="mr-2 inline size-4" />Supprimer la sélection</button>
          </div>
        </div>
      )}

      {/* ── Table Container ───────────────────────────────────────────── */}
      {activeTab === "ABANDONNEES" ? (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-amber-50/30 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">DATE / DERNIÈRE ACTIVITÉ</th>
                  <th className="py-3 px-4">CLIENT & CONTACT</th>
                  <th className="py-3 px-4">RELANCE RAPIDE</th>
                  <th className="py-3 px-4">VILLE & ADRESSE</th>
                  <th className="py-3 px-4">ARTICLES DU PANIER</th>
                  <th className="py-3 px-4">TOTAL ESTIMÉ</th>
                  <th className="py-3 px-4">ORIGINE</th>
                  <th className="py-3 px-4">STATUT</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium text-ink">
                {loadingAbandoned ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-semibold">
                      Chargement des commandes abandonnées...
                    </td>
                  </tr>
                ) : abandonedList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-semibold">
                      Aucune commande abandonnée trouvée.
                    </td>
                  </tr>
                ) : (
                  abandonedList.map((item) => {
                    const cleanPhone = (item.phone || "").replace(/\D/g, "");
                    const isPackAntiStress = item.source === "PACK_ANTI_STRESS" || (item.sourceUrl && item.sourceUrl.includes("pack-anti-stress"));
                    const waMessage = isPackAntiStress
                      ? `Asslema 👋 nchoufou elli bdit commande Pack Anti-Stress ama ma tkamlitech. Ken t7eb, najmou n3awnouk nkamloulek talab 😊`
                      : `Bonjour ${item.customerName || ""}, c'est l'équipe ParaTunisie ! Nous avons remarqué que vous avez commencé une commande pour vos articles de parapharmacie. Souhaitez-vous de l'aide pour finaliser votre livraison ?`;
                    const waUrl = cleanPhone
                      ? `https://wa.me/216${cleanPhone.startsWith("216") ? cleanPhone.slice(3) : cleanPhone}?text=${encodeURIComponent(waMessage)}`
                      : null;

                    return (
                      <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5 text-xs text-slate-800">
                            <Clock size={13} className="text-slate-400" />
                            <span>
                              {new Date(item.lastActivityAt || item.createdAt).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{item.customerName || "Prospect sans nom"}</p>
                          <p className="text-slate-600 font-medium text-[0.6875rem]">{item.phone}</p>
                          {item.email && <p className="text-slate-400 text-[0.625rem]">{item.email}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.phone && (
                              <a
                                href={`tel:${item.phone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors shadow-2xs"
                                title="Appeler le client"
                              >
                                <Phone size={12} />
                                <span>Appeler</span>
                              </a>
                            )}
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                                title="Relancer sur WhatsApp"
                              >
                                <MessageCircle size={12} />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800">{item.gouvernorat || "—"}</p>
                          {item.fullAddress && (
                            <p className="text-slate-500 text-[0.6875rem] line-clamp-1">{item.fullAddress}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {item.parsedItems.slice(0, 2).map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 pr-2 text-[0.6875rem]"
                              >
                                {it.image && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={resolveMediaUrl(it.image)}
                                    alt={it.name || ""}
                                    className="size-6 object-contain rounded bg-white"
                                  />
                                )}
                                <span className="font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                                  {it.name}
                                </span>
                                <span className="text-slate-500 font-extrabold">×{it.quantity || 1}</span>
                              </div>
                            ))}
                            {item.parsedItems.length > 2 && (
                              <span className="text-[0.6875rem] font-bold text-slate-500">
                                +{item.parsedItems.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-black text-[var(--color-primary)]">
                          {(item.totalMillimes / 1000).toFixed(3)} DT
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-extrabold ${
                              item.source === "PACK_ANTI_STRESS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : item.source === "BUY_NOW_MODAL"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {item.source === "PACK_ANTI_STRESS"
                              ? "🌿 Pack Anti-Stress"
                              : item.source === "BUY_NOW_MODAL"
                              ? "⚡ 1-Clic Modal"
                              : "🛒 Page Commande"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.625rem] font-extrabold ${
                              item.status === "ABANDONED"
                                ? "bg-primary-soft/60 text-primary-hover border border-primary-soft"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {item.status === "ABANDONED" ? "Abandonnée" : "Brouillon actif"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedAbandoned(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Voir détails"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              disabled={convertingAbandonedId === item.id}
                              onClick={() => handleConvertAbandoned(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs disabled:opacity-50"
                              title="Créer la commande"
                            >
                              {convertingAbandonedId === item.id ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <ShoppingBag size={12} />
                              )}
                              <span>Créer Commande</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAbandonedDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary-soft/30 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="max-h-[calc(100vh-22rem)] min-h-[16rem] overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-soft-nude shadow-[0_1px_0_var(--color-border)]">
                <tr className="border-b border-border bg-soft-nude text-[0.625rem] font-semibold text-ink-muted uppercase tracking-[0.07em]">
                  <th className="py-3 px-4 w-10">
                    <input ref={selectAllRef} type="checkbox" checked={allVisibleSelected} disabled={visibleOrderIds.length === 0} onChange={toggleAllVisibleOrders} aria-label="Sélectionner toutes les commandes visibles" className="size-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary disabled:cursor-not-allowed" />
                  </th>
                  <th className="py-3 px-4">N°</th>
                  <th className="py-3 px-4">CLIENT</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">TÉLÉPHONE</th>
                  <th className="py-3 px-4">VILLE</th>
                  <th className="py-3 px-4">STATUT</th>
                  <th className="py-3 px-4">EXPÉDITION (ARAMEX)</th>
                  <th className="py-3 px-4">TOTAL</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium text-ink">
                {loadingOrders ? (
                  <tr>
                    <td colSpan={10} className="p-4">
                      <LoadingSkeleton rows={6} />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState
                        icon={<ShoppingBag size={22} />}
                        title={orders.length === 0 ? "Aucune commande enregistrée" : "Aucune commande ne correspond à ces filtres"}
                        description={orders.length === 0 ? "Les nouvelles commandes apparaîtront ici dès qu'un client passera commande." : "Modifiez ou réinitialisez les filtres pour voir plus de résultats."}
                        action={orders.length > 0 ? (
                          <button type="button" onClick={() => { setSearch(""); setStatusFilter("ALL"); setAramexFilter("ALL"); setPeriodFilter("ALL"); }} className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-soft-nude">
                            Réinitialiser les filtres
                          </button>
                        ) : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className={`transition-colors ${selectedIds.has(order.id) ? "bg-primary-soft/70" : "hover:bg-primary-soft/20"}`}>
                      <td className="py-3 px-4">
                        <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOrder(order.id)} aria-label={`Sélectionner la commande ${order.reference}`} className="size-4 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary" />
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">{order.reference}</td>
                      <td className="py-3 px-4 relative">
                        {(() => {
                          const key = (order.phone?.trim() || order.customerName?.trim() || "").toLowerCase();
                          const clientOrders = customerOrdersMap.get(key) || [order];
                          const isRegular = clientOrders.length > 1 || order.isRegularClient;

                          return (
                            <div className="flex items-center gap-2 group/client relative">
                              <span className="font-semibold text-slate-800">{order.customerName}</span>
                              {isRegular && (
                                <div className="relative inline-block">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-700 px-2.5 py-0.5 text-[0.6875rem] font-bold cursor-pointer hover:bg-purple-200 transition-colors shadow-2xs">
                                    <span className="text-[10px]">👥</span> Client régulier ({clientOrders.length})
                                  </span>

                                  {/* Hover Card / Popover listing client's past orders */}
                                  <div className="absolute left-0 top-full mt-1.5 hidden group-hover/client:block z-50 w-80 rounded-2xl bg-white p-3.5 shadow-2xl border border-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[0.75rem]">
                                        <span className="text-purple-600 font-extrabold">👥</span> {order.customerName}
                                      </span>
                                      <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[0.625rem] font-extrabold">
                                        {clientOrders.length} commandes au total
                                      </span>
                                    </div>
                                    <p className="text-[0.6875rem] text-slate-500 font-medium mb-2">
                                      Historique des commandes de ce client :
                                    </p>
                                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                      {clientOrders.map((co) => (
                                        <div
                                          key={co.id}
                                          className={`flex items-center justify-between rounded-xl p-2 text-[0.6875rem] border ${
                                            co.id === order.id
                                              ? "bg-primary-soft/80 border-primary-soft font-bold text-primary-hover"
                                              : "bg-slate-50/80 border-slate-100 text-slate-700"
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="font-bold text-slate-900">{co.reference}</span>
                                            <span className="text-slate-400">•</span>
                                            <span className="text-slate-500 text-[0.625rem]">{co.date}</span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <OrderStatusBadge status={co.status as string} />
                                            <span className="font-extrabold text-slate-900">
                                              {typeof co.total === "number" ? co.total.toFixed(3) : co.total} DT
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{order.date}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{order.phone}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{order.city}</td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status as string} />
                      </td>
                      <td className="py-3 px-4">
                        <AramexBadge
                          orderId={order.id}
                          hawb={order.shipment?.hawb || order.shipment?.tracking}
                          labelUrl={order.shipment?.labelUrl}
                          trackingStatus={order.shipment?.trackingStatus}
                          trackingLabel={order.shipment?.trackingLabel}
                          trackingLocation={order.shipment?.trackingLocation}
                          lastTrackingUpdate={order.shipment?.lastTrackingUpdate}
                          lastAramexSync={order.shipment?.lastAramexSync}
                          onOpenCreate={() => setAramexModalOrder(order)}
                          onOpenTrack={() =>
                            setAramexTrackingTarget({
                              orderId: order.id,
                              hawb: order.shipment?.hawb || order.shipment?.tracking || "",
                              labelUrl: order.shipment?.labelUrl,
                            })
                          }
                          onSyncShipment={(updatedShipment) => handleShipmentUpdated(updatedShipment)}
                        />
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900">{typeof order.total === "number" ? order.total.toFixed(3) : order.total} DT</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            type="button"
                            onClick={() => handleOpenView(order.id)}
                            className="hover:text-slate-700 transition-colors p-1"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(order.id)}
                            className="hover:text-[var(--color-primary)] transition-colors p-1"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(order)}
                            className="hover:text-primary transition-colors p-1 text-primary"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Edit / View Drawer Modal ── */}
      {isDrawerOpen && formData && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-[#F8FAFC] h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Top Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-extrabold text-slate-900">
                  {drawerMode === "edit" ? `COMMANDE ${formData.reference}` : `DETAILS COMMANDE ${formData.reference}`}
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  ({formData.date})
                </span>
              </div>
              <div className="flex items-center gap-4">
                {drawerMode === "edit" && (
                  <button
                    type="button"
                    disabled={savingOrder}
                    onClick={handleSaveOrder}
                    className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[#BE123C] transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingOrder && <RefreshCw size={12} className="animate-spin" />}
                    <span>{savingOrder ? "Enregistrement..." : "Enregistrer"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Form Body */}
            <div className="p-6 space-y-6">
              {/* SECTION 1: DÉTAILS DE LA COMMANDE */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    DÉTAILS DE LA COMMANDE
                  </h3>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isExchange)}
                      onChange={(e) => setEditingForm({ ...formData, isExchange: e.target.checked })}
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    Échange
                  </label>
                </div>

                {/* STATUT COMMERCIAL — indépendant du statut d'expédition Aramex */}
                {!(formData.id.startsWith("NEW-") || targetId === "new") && (() => {
                  const current = orders.find((o) => o.id === formData.id)?.status ?? formData.status;
                  const changed = formData.status !== current;
                  const normal = changed && canTransition(current as OrderStatus, formData.status as OrderStatus);
                  const correction = changed && !normal;
                  return (
                    <div className="space-y-2">
                      <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                        Statut commercial
                      </label>
                      <div className="relative">
                        <select
                          value={formData.status}
                          onChange={(e) => setEditingForm({ ...formData, status: e.target.value as OrderStatus })}
                          className="w-full rounded-2xl border-2 border-[var(--color-primary)] bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none appearance-none shadow-xs"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                              {opt.value === current ? " (actuel)" : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                      </div>
                      {normal && (
                        <p className="text-[0.6875rem] font-medium text-emerald-700">
                          Étape normale : {STATUS_LABEL[current]} → {STATUS_LABEL[formData.status]}.
                        </p>
                      )}
                      {correction && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 space-y-2">
                          <p className="text-[0.75rem] font-bold text-amber-900">
                            Correction administrateur : {STATUS_LABEL[current]} → {STATUS_LABEL[formData.status]}
                          </p>
                          <p className="text-[0.6875rem] text-amber-800">
                            Ne modifie que le statut commercial. Le suivi Aramex, le stock et les points de fidélité ne sont pas touchés ; ajustez-les manuellement si nécessaire. Cette correction est tracée dans l&apos;historique.
                          </p>
                          <textarea
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            rows={2}
                            maxLength={450}
                            placeholder="Motif de la correction (obligatoire)…"
                            className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}
                      <p className="text-[0.6875rem] text-slate-500">
                        Le statut d&apos;expédition Aramex est géré séparément (synchronisation automatique).
                      </p>
                    </div>
                  );
                })()}

                {/* AJOUTER UNE NOTE PRIVÉE */}
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                    AJOUTER UNE NOTE PRIVÉE...
                  </label>
                  <textarea
                    value={formData.privateNote || ""}
                    onChange={(e) => setEditingForm({ ...formData, privateNote: e.target.value })}
                    placeholder="Ajouter une note privée..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* SECTION 2: DÉTAILS DU CLIENT */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  DÉTAILS DU CLIENT
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                      NOM
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setEditingForm({ ...formData, customerName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                      TÉLÉPHONE
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setEditingForm({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                      VILLE
                    </label>
                    <div className="relative">
                      <select
                        value={formData.city}
                        onChange={(e) => setEditingForm({ ...formData, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none appearance-none"
                      >
                        {TUNISIA_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                      ADRESSE
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setEditingForm({ ...formData, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                      TÉLÉPHONE 2
                    </label>
                    <input
                      type="text"
                      value={formData.phone2 || ""}
                      onChange={(e) => setEditingForm({ ...formData, phone2: e.target.value })}
                      placeholder="Entrez votre second numéro de téléphone"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setEditingForm({ ...formData, email: e.target.value })}
                      placeholder="Entrez votre email"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                    NOTE
                  </label>
                  <textarea
                    value={formData.customerNote || ""}
                    onChange={(e) => setEditingForm({ ...formData, customerNote: e.target.value })}
                    placeholder="Entrez les notes supplémentaires"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              {/* SECTION: EXPÉDITION ARAMEX & BORDEREAU */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white shadow-2xs">
                      <Truck size={15} />
                    </div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      EXPÉDITION ARAMEX & SUIVI EN DIRECT
                    </h3>
                  </div>
                  {formData.shipment?.hawb && (
                    <span className="rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[0.6875rem] font-bold font-mono">
                      HAWB: {formData.shipment.hawb}
                    </span>
                  )}
                </div>

                {formData.shipment?.hawb ? (
                  <div className="space-y-3.5">
                    {/* Status Pill Card */}
                    {(() => {
                      const cfg = getAramexStatusConfig(
                        formData.shipment.trackingStatus,
                        formData.shipment.trackingLabel
                      );
                      return (
                        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-2xs ${cfg.badgeClass}`}>
                          <div className="flex items-center gap-3">
                            <span className={`h-3 w-3 rounded-full ${cfg.dotColor} shrink-0 animate-pulse`} />
                            <div>
                              <p className="text-[0.625rem] font-extrabold uppercase tracking-wide opacity-70">
                                Statut Livraison Aramex
                              </p>
                              <p className="text-sm font-black">
                                {cfg.label}
                              </p>
                            </div>
                          </div>
                          <span className="text-lg font-bold">{cfg.icon}</span>
                        </div>
                      );
                    })()}

                    {/* Meta Details & Action Row */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Truck size={14} className="text-red-600" />
                            <span>Colis pris en charge par Aramex</span>
                          </p>
                          <p className="text-[0.6875rem] text-slate-500 font-mono mt-0.5">
                            N° de suivi (HAWB) :{" "}
                            <strong className="text-red-600 font-bold">{formData.shipment.hawb}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={drawerAramexSyncing}
                            onClick={async () => {
                              if (!formData.id && !formData.shipment?.hawb) return;
                              setDrawerAramexSyncing(true);
                              try {
                                const target = formData.shipment?.hawb || formData.id;
                                const res = await apiClient.post<any>(`/orders/${target}/aramex/sync`);
                                if (res.shipment) {
                                  handleShipmentUpdated(res.shipment);
                                  toast("success", `Suivi Aramex actualisé : ${res.normalized?.label || res.shipment?.trackingLabel || "Succès"}`);
                                }
                              } catch (err: any) {
                                toast("error", err instanceof ApiError ? err.message : "Erreur actualisation Aramex");
                              } finally {
                                setDrawerAramexSyncing(false);
                              }
                            }}
                            className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            title="Actualiser les données de suivi auprès d'Aramex"
                          >
                            <RefreshCw size={12} className={drawerAramexSyncing ? "animate-spin text-red-600" : ""} />
                            <span>Actualiser</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setAramexTrackingTarget({
                                orderId: formData.id,
                                hawb: formData.shipment?.hawb || "",
                                labelUrl: formData.shipment?.labelUrl,
                              })
                            }
                            className="rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                          >
                            Timeline complète
                          </button>

                          {formData.shipment.labelUrl && (
                            <a
                              href={formData.shipment.labelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-700 shadow-2xs transition-colors flex items-center gap-1.5"
                            >
                              <ExternalLink size={12} />
                              <span>Bordereau PDF</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Location & Last Update */}
                      {(formData.shipment.trackingLocation || formData.shipment.lastTrackingUpdate || formData.shipment.trackingDescription) && (
                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-slate-600 font-medium">
                          {formData.shipment.trackingLocation && (
                            <span>📍 {formData.shipment.trackingLocation}</span>
                          )}
                          {formData.shipment.trackingDescription && (
                            <span>📋 {formData.shipment.trackingDescription}</span>
                          )}
                          {formData.shipment.lastTrackingUpdate && (
                            <span className="text-slate-400">
                              🕒 {new Date(formData.shipment.lastTrackingUpdate).toLocaleString("fr-FR", { timeZone: "Africa/Tunis" })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-red-50/40 border border-red-100">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Aucune expédition Aramex active
                      </p>
                      <p className="text-[0.6875rem] text-slate-500 mt-0.5">
                        Générez le bordereau officiel Aramex avec étiquette PDF en 1 clic.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAramexModalOrder(formData)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95 shrink-0"
                    >
                      <Truck size={14} />
                      Créer Expédition Aramex
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: SÉLECTIONNER UN PRODUIT (Interactive Real Product Search) */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  SÉLECTIONNER UN PRODUIT
                </h3>

                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit dans le catalogue..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                {/* Search Results Dropdown List */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {productSearchLoading ? (
                    <div className="p-3 text-xs text-slate-500 font-medium text-center">
                      Recherche en cours…
                    </div>
                  ) : catalogProducts.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 font-medium text-center">
                      Aucun produit trouvé
                    </div>
                  ) : (
                    catalogProducts.map((product) => {
                      const price = product.variants?.[0]?.priceMillimes
                        ? Math.round(product.variants[0].priceMillimes / 1000)
                        : 35;
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleAddProductToOrder(product)}
                          className="p-3 flex items-center justify-between hover:bg-primary-soft/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                              {product.image ? (
                                <img src={resolveMediaUrl(product.image)} alt={product.name} className="h-full w-full object-contain" />
                              ) : (
                                <Package size={16} className="text-[var(--color-primary)]" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{product.name}</p>
                              <p className="text-[0.6875rem] text-slate-500 font-medium">
                                {product.brand?.name || "ParaTunisie"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[var(--color-primary)]">
                            {typeof price === "number" ? price.toFixed(3) : price} DT
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SECTION 4: RÉSUMÉ DES COMMANDES */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  RÉSUMÉ DES COMMANDES
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[0.625rem] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2 px-2">PRODUIT</th>
                        <th className="py-2 px-2 text-center">QTÉ</th>
                        <th className="py-2 px-2">PRIX UNITAIRE</th>
                        <th className="py-2 px-2 text-right">TOTAL</th>
                        <th className="py-2 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                            Aucun produit sélectionné pour cette commande
                          </td>
                        </tr>
                      ) : (
                        formData.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                                  {item.image ? (
                                    <img src={resolveMediaUrl(item.image)} alt={item.productName} className="h-full w-full object-contain" />
                                  ) : (
                                    <Package size={16} className="text-[var(--color-primary)]" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                                  <p className="text-[0.625rem] text-slate-500 font-medium">{item.brand}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const q = parseInt(e.target.value) || 1;
                                  const nextItems = [...formData.items];
                                  nextItems[idx].quantity = q;
                                  nextItems[idx].lineTotal = q * nextItems[idx].unitPrice;
                                  const sub = nextItems.reduce((s, i) => s + i.lineTotal, 0);
                                  setEditingForm({
                                    ...formData,
                                    items: nextItems,
                                    subtotal: sub,
                                    total: sub + formData.shippingFee,
                                  });
                                }}
                                className="w-14 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900"
                              />
                            </td>
                            <td className="py-3 px-2">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const p = parseFloat(e.target.value) || 0;
                                  const nextItems = [...formData.items];
                                  nextItems[idx].unitPrice = p;
                                  nextItems[idx].lineTotal = p * nextItems[idx].quantity;
                                  const sub = nextItems.reduce((s, i) => s + i.lineTotal, 0);
                                  setEditingForm({
                                    ...formData,
                                    items: nextItems,
                                    subtotal: sub,
                                    total: sub + formData.shippingFee,
                                  });
                                }}
                                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900"
                              />
                            </td>
                            <td className="py-3 px-2 text-right font-black text-slate-900 text-xs">
                              {typeof item.lineTotal === "number" ? item.lineTotal.toFixed(3) : item.lineTotal} DT
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromOrder(idx)}
                                className="text-slate-400 hover:text-primary transition-colors p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal / Shipping Summary Box */}
                <div className="flex justify-end pt-3">
                  <div className="w-64 space-y-2 rounded-xl bg-primary-soft/60 p-3 text-xs font-bold text-slate-700 border border-primary-soft/60">
                    <div className="flex items-center justify-between">
                      <span className="uppercase tracking-wider text-slate-500">SOUS-TOTAL</span>
                      <span className="font-black text-slate-900 text-sm">
                        {typeof formData.subtotal === "number" ? formData.subtotal.toFixed(3) : formData.subtotal} DT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="uppercase tracking-wider text-slate-500">LIVRAISON</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={formData.shippingFee ?? 10}
                          onChange={(e) => {
                            const fee = parseFloat(e.target.value) || 0;
                            setEditingForm({
                              ...formData,
                              shippingFee: fee,
                              total: formData.subtotal + fee,
                            });
                          }}
                          className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center font-bold text-slate-900"
                        />
                        <span className="font-black text-slate-900">DT</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-primary-soft/80 pt-2 mt-1">
                      <span className="uppercase tracking-wider text-primary-hover font-extrabold text-xs">TOTAL</span>
                      <span className="font-black text-[var(--color-primary)] text-base">
                        {typeof formData.total === "number" ? formData.total.toFixed(3) : formData.total} DT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rentabilité — admin-only, never shown on the storefront/customer invoice */}
                {orderProfitability && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Wallet size={13} className="text-emerald-700" />
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Rentabilité (Admin)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      <div>
                        <p className="text-[0.625rem] font-bold text-slate-500 uppercase">Sous-total produits</p>
                        <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(orderProfitability.totals.revenueMillimes / 1000)}</p>
                      </div>
                      <div>
                        <p className="text-[0.625rem] font-bold text-slate-500 uppercase">Coût d&apos;achat</p>
                        <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(orderProfitability.totals.costMillimes / 1000)}</p>
                      </div>
                      <div>
                        <p className="text-[0.625rem] font-bold text-slate-500 uppercase">Gain produits</p>
                        <p className={`text-sm font-black tabular-nums ${orderProfitability.totals.gainMillimes !== null ? "text-emerald-700" : "text-slate-400"}`}>
                          {orderProfitability.totals.gainMillimes !== null ? formatCurrency(orderProfitability.totals.gainMillimes / 1000) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.625rem] font-bold text-slate-500 uppercase">Marge</p>
                        <p
                          className="text-sm font-black text-slate-900 tabular-nums"
                          title={orderProfitability.totals.tauxMarge === null ? "Impossible à calculer : coût d'achat manquant." : undefined}
                        >
                          {orderProfitability.totals.tauxMarge !== null ? formatPercent(orderProfitability.totals.tauxMarge) : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 border-t border-emerald-200 pt-2.5">
                      {orderProfitability.lines.map((line, i) => (
                        <div key={i} className="flex items-center justify-between text-[0.6875rem]">
                          <span className="text-slate-600 truncate pr-2">
                            {line.productName} <span className="text-slate-400">×{line.quantity}</span>
                            <span className="ml-1 text-slate-400">({COST_SOURCE_LABEL[line.costSource]})</span>
                          </span>
                          <span className="font-bold tabular-nums text-slate-800 shrink-0">
                            {line.gainMillimes !== null ? formatCurrency(line.gainMillimes / 1000) : "coût inconnu"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!orderProfitability && profitabilityError && (
                  <p className="mt-4 text-[0.6875rem] text-slate-400 text-center">{profitabilityError}</p>
                )}
              </div>

              {/* SECTION 5: HISTORIQUE DES NOTIFICATIONS (SMS & EMAIL) */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-[var(--color-primary)]">📱</span> NOTIFICATIONS CLIENT & ADMIN
                  </h3>
                  <span className="text-[0.6875rem] font-bold text-slate-500">
                    Expéditeur : <strong className="text-slate-800">ParaTunisie</strong>
                  </span>
                </div>

                {orderNotifications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Aucune notification enregistrée pour cette commande.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {orderNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          notif.status === "SENT"
                            ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-900"
                            : "bg-primary-soft/50 border-primary-soft/80 text-primary-hover"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">
                            {notif.channel === "SMS" ? "📱" : "✉️"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider">
                                {notif.channel} — {notif.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[0.625rem] font-extrabold ${
                                  notif.status === "SENT"
                                    ? "bg-emerald-200 text-emerald-900"
                                    : "bg-primary-soft text-primary-hover"
                                }`}
                              >
                                {notif.status === "SENT" ? "✓ Envoyé" : "⚠️ Échec"}
                              </span>
                            </div>
                            <p className="text-[0.6875rem] text-slate-600 mt-0.5">
                              Destinataire : <strong className="text-slate-800">{notif.recipient}</strong>
                              {notif.sentAt && ` • Le ${new Date(notif.sentAt).toLocaleString("fr-FR")}`}
                            </p>
                            {notif.lastError && (
                              <p className="text-[0.6875rem] text-primary-hover font-medium mt-1">
                                Erreur provider : {notif.lastError} (Essais : {notif.attemptCount})
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={retryingId === notif.id}
                          onClick={() => handleRetryNotification(notif.id)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {retryingId === notif.id ? "Envoi..." : "Réessayer"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Abandoned Checkout Detail Drawer Modal ── */}
      {selectedAbandoned && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-[#F8FAFC] h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    COMMANDE ABANDONNÉE
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-soft/60 text-primary-hover font-bold">
                      {selectedAbandoned.status === "ABANDONED" ? "Abandonnée" : "Brouillon"}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Dernière activité : {new Date(selectedAbandoned.lastActivityAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={convertingAbandonedId === selectedAbandoned.id}
                  onClick={() => handleConvertAbandoned(selectedAbandoned)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {convertingAbandonedId === selectedAbandoned.id ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  <span>Créer la commande</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAbandoned(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* SECTION 1: COORDONNÉES CLIENT & RELANCE */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-[var(--color-primary)]">👤</span> COORDONNÉES DU PROSPECT
                  </h3>
                  <div className="flex items-center gap-2">
                    {selectedAbandoned.phone && (
                      <a
                        href={`tel:${selectedAbandoned.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors shadow-2xs"
                      >
                        <Phone size={13} />
                        <span>Appeler</span>
                      </a>
                    )}
                    {selectedAbandoned.phone && (
                      <a
                        href={`https://wa.me/216${selectedAbandoned.phone.replace(/\D/g, "").replace(/^216/, "")}?text=${encodeURIComponent(
                          `Bonjour ${selectedAbandoned.customerName || ""}, c'est l'équipe ParaTunisie ! Nous avons remarqué votre panier pour ${
                            selectedAbandoned.parsedItems.map((i) => i.name).join(", ")
                          }. Souhaitez-vous valider votre commande ?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Nom & Prénom</span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {selectedAbandoned.customerName || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Numéro de téléphone</span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {selectedAbandoned.phone || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Email</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {selectedAbandoned.email || "Non renseigné"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Gouvernorat</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {selectedAbandoned.gouvernorat || "Non sélectionné"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Adresse de livraison</span>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {selectedAbandoned.fullAddress || "Non renseignée"}
                    </p>
                  </div>
                  {selectedAbandoned.deliveryNote && (
                    <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <span className="text-amber-800 font-bold uppercase text-[0.625rem]">Note du client :</span>
                      <p className="text-xs text-amber-900 font-medium mt-0.5">{selectedAbandoned.deliveryNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: TRACKING & ORIGINE */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-3 text-xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span>📍</span> ORIGINE DU PANIER
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Formulaire Source</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedAbandoned.source === "BUY_NOW_MODAL" ? "⚡ Modal 1-Clic Acheter Maintenant" : "🛒 Page Commande Standard"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Date initiale de détection</span>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {new Date(selectedAbandoned.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {selectedAbandoned.sourceUrl && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 font-bold uppercase text-[0.625rem]">Page d&apos;origine</span>
                      <a
                        href={selectedAbandoned.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
                      >
                        <span>{selectedAbandoned.sourceUrl}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: ARTICLES DU PANIER */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Package size={16} className="text-[var(--color-primary)]" /> ARTICLES SÉLECTIONNÉS (
                  {selectedAbandoned.parsedItems.reduce((acc, i) => acc + (i.quantity || 1), 0)})
                </h3>

                <div className="divide-y divide-slate-100">
                  {selectedAbandoned.parsedItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveMediaUrl(item.image)}
                            alt={item.name || ""}
                            className="size-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs">{item.name || "Produit Parapharmacie"}</p>
                          {item.variantLabel && (
                            <p className="text-[0.6875rem] text-slate-500">Format : {item.variantLabel}</p>
                          )}
                          <p className="text-[0.6875rem] text-slate-400 font-medium">
                            Prix unitaire : {(item.priceMillimes / 1000).toFixed(3)} DT
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-500">Qté : {item.quantity || 1}</span>
                        <p className="font-black text-slate-900 text-sm">
                          {(((item.priceMillimes || 0) * (item.quantity || 1)) / 1000).toFixed(3)} DT
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Sous-total articles :</span>
                    <span className="font-bold text-slate-900">
                      {(selectedAbandoned.subtotalMillimes / 1000).toFixed(3)} DT
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frais de livraison :</span>
                    <span className="font-bold text-slate-900">
                      {(selectedAbandoned.shippingFeeMillimes / 1000).toFixed(3)} DT
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                    <span className="text-primary-hover">TOTAL ESTIMÉ :</span>
                    <span className="text-[var(--color-primary)] text-base">
                      {(selectedAbandoned.totalMillimes / 1000).toFixed(3)} DT
                    </span>
                  </div>
                </div>

                {/* Final Action Button */}
                <div className="pt-3">
                  <button
                    type="button"
                    disabled={convertingAbandonedId === selectedAbandoned.id}
                    onClick={() => handleConvertAbandoned(selectedAbandoned)}
                    className="w-full py-3 rounded-xl bg-primary text-white font-extrabold text-sm hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {convertingAbandonedId === selectedAbandoned.id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <ShoppingBag size={16} />
                    )}
                    <span>Valider & Créer la Commande Réelle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer la commande"
        description={`Voulez-vous vraiment supprimer la commande ${deleteTarget?.reference} ?`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Abandoned Delete Confirmation Modal */}
      <ConfirmModal
        open={!!abandonedDeleteTarget}
        title="Supprimer la commande abandonnée"
        description={`Voulez-vous supprimer ce prospect abandonné (${abandonedDeleteTarget?.customerName || abandonedDeleteTarget?.phone || "Sans nom"}) ?`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDeleteAbandoned}
        onCancel={() => setAbandonedDeleteTarget(null)}
      />

      {/* Aramex Shipment Modal */}
      <AramexShipmentModal
        isOpen={!!aramexModalOrder}
        order={aramexModalOrder}
        onClose={() => setAramexModalOrder(null)}
        onSuccess={({ hawb, labelUrl }) => {
          if (aramexModalOrder) {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === aramexModalOrder.id
                  ? {
                      ...o,
                      status: "EXPEDIEE" as OrderStatus,
                      shipment: {
                        ...(o.shipment || {}),
                        hawb,
                        tracking: hawb,
                        labelUrl,
                        status: "EXPEDIEE",
                      },
                    }
                  : o
              )
            );
            if (editingForm && editingForm.id === aramexModalOrder.id) {
              setEditingForm({
                ...editingForm,
                status: "EXPEDIEE" as OrderStatus,
                shipment: {
                  ...(editingForm.shipment || {}),
                  hawb,
                  tracking: hawb,
                  labelUrl,
                  status: "EXPEDIEE",
                },
              });
            }
          }
          setOrdersRefreshKey((k) => k + 1);
        }}
      />

      {/* Aramex Tracking Drawer */}
      <AramexTrackingDrawer
        isOpen={!!aramexTrackingTarget}
        orderId={aramexTrackingTarget?.orderId || null}
        hawb={aramexTrackingTarget?.hawb || null}
        labelUrl={aramexTrackingTarget?.labelUrl || null}
        onClose={() => setAramexTrackingTarget(null)}
        onTrackingUpdated={(shipment) => handleShipmentUpdated(shipment)}
      />
    </div>
  );
}

export default function CommandesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <CommandesInner />
    </Suspense>
  );
}
