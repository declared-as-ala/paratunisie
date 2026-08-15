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
} from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { notifyOrdersChanged, onOrdersChanged } from "@/lib/order-events";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface OrderItemExt {
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

interface CustomOrder {
  id: string;
  reference: string;
  customerName: string;
  isRegularClient?: boolean;
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

const STATUS_OPTIONS = [
  { value: "DEFAULT", label: "— Par défaut —" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "CONFIRMEE", label: "Confirmée" },
  { value: "TENTATIVE", label: "Tentative" },
  { value: "ANNULEE", label: "Annulée" },
];

/* ─── Page Component ─────────────────────────────────────────────────── */

function CommandesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [orders, setOrders] = useState<CustomOrder[]>(fallbackOrders);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<"NORMAL" | "ABANDONNEES" | "SUPPRIMEES">("NORMAL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<CustomOrder | null>(null);
  const [orderCounts, setOrderCounts] = useState<OrderCounts | null>(null);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

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

  // 1. Fetch Real Orders from NestJS API
  useEffect(() => {
    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const data = await apiClient.get<ApiOrder[]>("/orders");
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CustomOrder[] = data.map((o: ApiOrder, idx: number) => ({
            id: o.id || `cmd-${idx}`,
            reference: `#${o.id?.slice(-5) || 53380 + idx}`,
            customerName: o.user?.name || "Client ParaTunisie",
            isRegularClient: Boolean(o.user?.orders && o.user.orders.length > 1),
            date: new Date(o.createdAt || Date.now()).toLocaleDateString("fr-FR"),
            phone: o.user?.phone || "27578505",
            phone2: "",
            email: o.user?.email || "",
            city: o.gouvernorat || "Tunis",
            address: o.fullAddress || "Adresse client",
            status: (o.status || "EN_ATTENTE") as OrderStatus,
            total: Math.round((o.totalMillimes || 0) / 1000),
            subtotal: Math.round(((o.totalMillimes || 8000) - 8000) / 1000),
            shippingFee: 8,
            items: o.items?.map((item: ApiOrderItem) => ({
              productName: item.product?.name || "Produit Parapharmacie",
              brand: "ParaTunisie",
              quantity: item.quantity || 1,
              unitPrice: Math.round((item.priceMillimes || 0) / 1000),
              lineTotal: Math.round(((item.priceMillimes || 0) * (item.quantity || 1)) / 1000),
            })) || [
              {
                productName: "Anthelios Fluide Invisible SPF50+",
                brand: "La Roche-Posay",
                quantity: 1,
                unitPrice: 58,
                lineTotal: 58,
              },
            ],
          }));
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

  // 2. Fetch Catalog Products from NestJS API for interactive search in drawer
  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiClient.get<typeof catalogProducts>("/catalogue/products");
        if (Array.isArray(data) && data.length > 0) {
          setCatalogProducts(data);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch catalog products from NestJS API", err);
      }
      // Fallback Catalog Products matching client side products with images
      setCatalogProducts([
        {
          id: "p01",
          name: "Anthelios Fluide Invisible SPF50+",
          brand: { name: "La Roche-Posay" },
          image: "/assets/product-tube.webp",
          variants: [{ id: "v01", label: "50 ml", priceMillimes: 58900 }],
        },
        {
          id: "p02",
          name: "Sensibio H2O 500ml",
          brand: { name: "Bioderma" },
          image: "/assets/product-micellar.webp",
          variants: [{ id: "v02", label: "500 ml", priceMillimes: 36900 }],
        },
        {
          id: "p03",
          name: "Crème Hydratante Visage CeraVe",
          brand: { name: "CeraVe" },
          image: "/assets/product-jar.webp",
          variants: [{ id: "v03", label: "52 ml", priceMillimes: 42500 }],
        },
        {
          id: "p04",
          name: "Liftactiv Sérum Vitamine C Vichy",
          brand: { name: "Vichy" },
          image: "/assets/product-serum.webp",
          variants: [{ id: "v04", label: "20 ml", priceMillimes: 91000 }],
        },
        {
          id: "p05",
          name: "Cleanance Gel Nettoyant Avène",
          brand: { name: "Avène" },
          image: "/assets/product-micellar.webp",
          variants: [{ id: "v05", label: "200 ml", priceMillimes: 39500 }],
        },
        {
          id: "p06",
          name: "Eau Thermale Gel-Crème",
          brand: { name: "Uriage" },
          image: "/assets/product-jar.webp",
          variants: [{ id: "v06", label: "40 ml", priceMillimes: 48900 }],
        },
        {
          id: "p07",
          name: "Sebiaclear Sérum SVR",
          brand: { name: "SVR" },
          image: "/assets/product-serum.webp",
          variants: [{ id: "v07", label: "30 ml", priceMillimes: 64900 }],
        },
        {
          id: "p08",
          name: "Huile Prodigieuse Nuxe",
          brand: { name: "Nuxe" },
          image: "/assets/product-serum.webp",
          variants: [{ id: "v08", label: "100 ml", priceMillimes: 79500 }],
        },
        {
          id: "p09",
          name: "DermoPure Fluide Matifiant Eucerin",
          brand: { name: "Eucerin" },
          image: "/assets/product-tube.webp",
          variants: [{ id: "v09", label: "50 ml", priceMillimes: 55900 }],
        },
        {
          id: "p10",
          name: "Anaphase+ Shampooing Ducray",
          brand: { name: "Ducray" },
          image: "/assets/product-tube.webp",
          variants: [{ id: "v10", label: "200 ml", priceMillimes: 46500 }],
        },
        {
          id: "p11",
          name: "Atoderm Gel Douche Bioderma",
          brand: { name: "Bioderma" },
          image: "/assets/product-micellar.webp",
          variants: [{ id: "v11", label: "500 ml", priceMillimes: 44900 }],
        },
        {
          id: "p12",
          name: "Cicaplast Baume B5+ La Roche-Posay",
          brand: { name: "La Roche-Posay" },
          image: "/assets/product-tube.webp",
          variants: [{ id: "v12", label: "40 ml", priceMillimes: 34900 }],
        },
      ]);
    }
    fetchProducts();
  }, []);

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

  const handleSaveOrder = useCallback(async () => {
    if (!formData) return;
    if (!formData.id.startsWith("NEW-")) {
      try {
        await apiClient.patch(`/orders/${formData.id}/status`, { status: formData.status });
        notifyOrdersChanged();
      } catch (e) {
        toast(
          "error",
          e instanceof ApiError ? e.message : "Impossible de mettre à jour le statut de la commande",
        );
        return;
      }
    }
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === formData.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = formData;
        return next;
      }
      return [formData, ...prev];
    });
    toast("success", `Commande ${formData.reference} enregistrée avec succès`);
    handleCloseDrawer();
  }, [formData, handleCloseDrawer, toast]);

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

  // Filtered Products search inside Drawer
  const searchedProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return catalogProducts;
    const q = productSearchQuery.toLowerCase();
    return catalogProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q))
    );
  }, [catalogProducts, productSearchQuery]);

  // Add Product to Current Order
  const handleAddProductToOrder = useCallback(
    (product: CatalogProduct) => {
      if (!formData) return;
      const variantPrice = product.variants?.[0]?.priceMillimes
        ? Math.round(product.variants[0].priceMillimes / 1000)
        : 35;
      const newItem: OrderItemExt = {
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
  const abandonedCount = orderCounts?.abandoned ?? abandonedCountLocal;
  const deletedCount = orderCounts?.deleted ?? deletedCountLocal;

  // Filtered List
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (activeTab === "NORMAL") {
      list = list.filter((o) => (o.status as string) !== "ABANDONNEE" && (o.status as string) !== "SUPPRIMEE");
    } else if (activeTab === "ABANDONNEES") {
      list = list.filter((o) => (o.status as string) === "ABANDONNEE");
    } else if (activeTab === "SUPPRIMEES") {
      list = list.filter((o) => (o.status as string) === "SUPPRIMEE");
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.city.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [orders, activeTab, search, statusFilter]);

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
    <div className="space-y-6 min-h-screen bg-[#FFF5F5]/40 p-2 sm:p-6 text-slate-800">
      {/* ── Top Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shrink-0 mt-0.5">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#881337]">Commandes</h1>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {totalCount} commandes en base de données
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              = En attente ({enAttenteCount}) + Confirmée ({confirmeeCount}) + Tentative ({tentativeCount}) + Annulée ({annuleeCount})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenEdit("new")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#BE123C] transition-all active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={3} />
          Ajouter une commande
        </button>
      </div>

      {/* ── Tabs Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("NORMAL")}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "NORMAL"
              ? "bg-[#E11D48] text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-rose-50 border border-slate-200"
          }`}
        >
          Normal ({normalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ABANDONNEES")}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "ABANDONNEES"
              ? "bg-[#E11D48] text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-rose-50 border border-slate-200"
          }`}
        >
          Abandonnées ({abandonedCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("SUPPRIMEES")}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "SUPPRIMEES"
              ? "bg-[#E11D48] text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-rose-50 border border-slate-200"
          }`}
        >
          Supprimées ({deletedCount})
        </button>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-3.5 shadow-xs border border-slate-200/80 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (numéro, client, téléphone)..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48] transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48]"
        >
          <option value="ALL">Toutes ({totalCount})</option>
          <option value="EN_ATTENTE">En attente ({enAttenteCount})</option>
          <option value="CONFIRMEE">Confirmée ({confirmeeCount})</option>
          <option value="TENTATIVE_CONTACT">Tentative ({tentativeCount})</option>
          <option value="ANNULEE">Annulée ({annuleeCount})</option>
        </select>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48]"
        >
          <option value="ALL">Toute la période</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <p className="text-sm font-bold text-rose-900">{selectedIds.size} commande{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedIds(new Set())} className="min-h-11 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-rose-100">Annuler la sélection</button>
            <button type="button" disabled={bulkDeleting} onClick={() => setBulkDeleteOpen(true)} className="min-h-11 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="mr-2 inline size-4" />Supprimer la sélection</button>
          </div>
        </div>
      )}

      {/* ── Commandes Table ───────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-rose-50/30 text-[0.6875rem] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input ref={selectAllRef} type="checkbox" checked={allVisibleSelected} disabled={visibleOrderIds.length === 0} onChange={toggleAllVisibleOrders} aria-label="Sélectionner toutes les commandes visibles" className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed" />
                </th>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">CLIENT</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4">TÉLÉPHONE</th>
                <th className="py-3.5 px-4">VILLE</th>
                <th className="py-3.5 px-4">STATUT</th>
                <th className="py-3.5 px-4">TOTAL</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loadingOrders ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-semibold">
                    Chargement des commandes depuis la base de données...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-semibold">
                    Aucune commande enregistrée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`transition-colors ${selectedIds.has(order.id) ? "bg-rose-50/70" : "hover:bg-rose-50/20"}`}>
                    <td className="py-3.5 px-4">
                      <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOrder(order.id)} aria-label={`Sélectionner la commande ${order.reference}`} className="size-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{order.reference}</td>
                    <td className="py-3.5 px-4 relative">
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
                                            ? "bg-rose-50/80 border-rose-200 font-bold text-rose-900"
                                            : "bg-slate-50/80 border-slate-100 text-slate-700"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="font-bold text-slate-900">{co.reference}</span>
                                          <span className="text-slate-400">•</span>
                                          <span className="text-slate-500 text-[0.625rem]">{co.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span
                                            className={`px-1.5 py-0.5 rounded-full text-[0.5625rem] font-bold ${
                                              co.status === "CONFIRMEE"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : co.status === "EN_ATTENTE"
                                                ? "bg-amber-100 text-amber-800"
                                                : co.status === "TENTATIVE"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-rose-100 text-rose-800"
                                            }`}
                                          >
                                            {co.status === "CONFIRMEE" ? "Confirmée" : co.status === "EN_ATTENTE" ? "En attente" : co.status === "TENTATIVE" ? "Tentative" : "Annulée"}
                                          </span>
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
                    <td className="py-3.5 px-4 text-slate-600">{order.date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">{order.phone}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{order.city}</td>
                    <td className="py-3.5 px-4">
                      {order.status === "CONFIRMEE" && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-3 py-0.5 text-[0.6875rem] font-semibold">
                          Confirmée
                        </span>
                      )}
                      {order.status === "EN_ATTENTE" && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-600 border border-amber-200/80 px-3 py-0.5 text-[0.6875rem] font-semibold">
                          En attente
                        </span>
                      )}
                      {order.status === "TENTATIVE" && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 px-3 py-0.5 text-[0.6875rem] font-semibold">
                          Tentative
                        </span>
                      )}
                      {order.status === "ANNULEE" && (
                        <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-600 border border-rose-200/80 px-3 py-0.5 text-[0.6875rem] font-semibold">
                          Annulée
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">{typeof order.total === "number" ? order.total.toFixed(3) : order.total} DT</td>
                    <td className="py-3.5 px-4 text-right">
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
                          className="hover:text-[#E11D48] transition-colors p-1"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(order)}
                          className="hover:text-rose-600 transition-colors p-1 text-rose-500"
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
                    onClick={handleSaveOrder}
                    className="px-4 py-1.5 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C] transition-colors shadow-xs"
                  >
                    Enregistrer
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
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                    Échange
                  </label>
                </div>

                {/* STATUT Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-600 uppercase tracking-wider">
                    STATUT
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setEditingForm({ ...formData, status: e.target.value as OrderStatus })}
                      className="w-full rounded-2xl border-2 border-[#E11D48] bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none appearance-none shadow-xs"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                  </div>
                </div>

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
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
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
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                {/* Search Results Dropdown List */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {searchedProducts.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 font-medium text-center">
                      Aucun produit trouvé
                    </div>
                  ) : (
                    searchedProducts.map((product) => {
                      const price = product.variants?.[0]?.priceMillimes
                        ? Math.round(product.variants[0].priceMillimes / 1000)
                        : 35;
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleAddProductToOrder(product)}
                          className="p-3 flex items-center justify-between hover:bg-rose-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                              ) : (
                                <Package size={16} className="text-[#E11D48]" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{product.name}</p>
                              <p className="text-[0.6875rem] text-slate-500 font-medium">
                                {product.brand?.name || "ParaTunisie"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#E11D48]">
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
                                    <img src={item.image} alt={item.productName} className="h-full w-full object-contain" />
                                  ) : (
                                    <Package size={16} className="text-[#E11D48]" />
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
                                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
                  <div className="w-64 space-y-2 rounded-xl bg-rose-50/60 p-3 text-xs font-bold text-slate-700 border border-rose-100">
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
                          value={formData.shippingFee}
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
                    <span className="text-[#E11D48]">📱</span> NOTIFICATIONS CLIENT & ADMIN
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
                            : "bg-rose-50/50 border-rose-200/80 text-rose-900"
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
                                    : "bg-rose-200 text-rose-900"
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
                              <p className="text-[0.6875rem] text-rose-700 font-medium mt-1">
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
      <ConfirmModal
        open={bulkDeleteOpen}
        title={`Supprimer ${selectedIds.size} commande${selectedIds.size > 1 ? "s" : ""} ?`}
        description={bulkDeleting ? "Suppression dans la base de données…" : "Les commandes sélectionnées seront définitivement supprimées de la base. Cette action est irréversible."}
        confirmLabel={bulkDeleting ? "Suppression…" : "Supprimer la sélection"}
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => { if (!bulkDeleting) setBulkDeleteOpen(false); }}
      />
    </div>
  );
}

export default function CommandesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600" /></div>}>
      <CommandesInner />
    </Suspense>
  );
}
