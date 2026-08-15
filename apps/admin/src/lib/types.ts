export type OrderStatus =
  | "EN_ATTENTE"
  | "TENTATIVE_CONTACT"
  | "CONFIRMEE"
  | "REFUSEE"
  | "PREPARATION"
  | "PRETE_EXPEDITION"
  | "EXPEDIEE"
  | "LIVREE"
  | "ECHEC_LIVRAISON"
  | "RETOURNEE"
  | "ANNULEE";

export type ContactChannel = "APPEL" | "WHATSAPP";
export type ContactOutcome =
  | "CONFIRME"
  | "RAPPEL_PLUS_TARD"
  | "PAS_REPONSE"
  | "MAUVAIS_NUMERO"
  | "REFUSE"
  | "ANNULE";

export interface ContactAttempt {
  id: string;
  timestamp: string;
  staffMember: string;
  channel: ContactChannel;
  outcome: ContactOutcome;
  note?: string;
}

export interface OrderTimelineEntry {
  id: string;
  timestamp: string;
  staffMember: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note?: string;
}

export interface OrderItem {
  productName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  lineTotal: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  governorate: string;
  delegation: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "COD" | "CCP" | "CMI" | "FLUIDWAVE";
  deliveryCarrier?: string;
  trackingNumber?: string;
  exchange?: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  contactAttempts: ContactAttempt[];
  timeline: OrderTimelineEntry[];
  previousOrders?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  supplierId?: string;
  sku: string;
  barcode?: string;
  stock: number;
  reorderThreshold?: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  image?: string;
  images?: string[];
  description?: string;
  shortDescription?: string;
  usage?: string;
  skinTypes?: string[];
  concerns?: string[];
  size?: string;
  slug?: string;
  seoTitle?: string;
  metaDescription?: string;
  indexable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  featured: boolean;
  status: "ACTIVE" | "DRAFT";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  subcategories: { name: string; slug: string; productCount: number }[];
  status: "ACTIVE" | "DRAFT";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
  governorate: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  orderReference: string;
  customerName: string;
  governorate: string;
  delegation: string;
  status: "EN_ATTENTE" | "EN_COURS" | "LIVREE" | "ECHEC" | "RETOUR";
  carrier?: string;
  trackingNumber?: string;
  estimatedDate?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author: string;
  publishedAt?: string;
  updatedAt: string;
  tags: string[];
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "DISABLED";
}

export interface MarginInfo {
  costPrice: number;
  sellingPrice: number;
  promoPrice?: number;
  margeBrute: number;
  tauxMarge: number;
  tauxMarque: number;
}

/* ─── Suppliers & purchase price history (Admin 3) ────────────────────── */

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  taxId?: string;
  brandsSupplied: string[];
  leadTimeDays?: number;
  paymentTerms?: string;
  notes?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface PurchasePriceHistory {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  purchasePrice: number;
  effectiveDate: string;
  notes?: string;
}

export type StockMovementType =
  | "PURCHASE_RECEIPT"
  | "ORDER_RESERVATION"
  | "ORDER_SALE"
  | "CANCELLATION_RELEASE"
  | "RETURN"
  | "DAMAGE"
  | "EXPIRATION_WRITE_OFF"
  | "MANUAL_ADJUSTMENT"
  | "WAREHOUSE_TRANSFER";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  reference?: string;
  note?: string;
  createdAt: string;
}

export const STOCK_MOVEMENT_MAP: Record<StockMovementType, { label: string; badge: string }> = {
  PURCHASE_RECEIPT: { label: "Réception", badge: "badge-success" },
  ORDER_RESERVATION: { label: "Réservation", badge: "badge-info" },
  ORDER_SALE: { label: "Vente", badge: "badge-success" },
  CANCELLATION_RELEASE: { label: "Libération", badge: "badge-warning" },
  RETURN: { label: "Retour", badge: "badge-warning" },
  DAMAGE: { label: "Avarie", badge: "badge-danger" },
  EXPIRATION_WRITE_OFF: { label: "Expiration", badge: "badge-danger" },
  MANUAL_ADJUSTMENT: { label: "Ajustement", badge: "badge-info" },
  WAREHOUSE_TRANSFER: { label: "Transfert", badge: "badge-info" },
};

export const SUPPLIER_STATUS_MAP: Record<Supplier["status"], { label: string; badge: string }> = {
  ACTIVE: { label: "Actif", badge: "badge-success" },
  INACTIVE: { label: "Inactif", badge: "badge-neutral" },
};

/* ─── Status maps ──────────────────────────────────────────────────────── */

export const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; badge: string }> = {
  EN_ATTENTE: { label: "En attente", badge: "badge-warning" },
  TENTATIVE_CONTACT: { label: "À confirmer", badge: "badge-info" },
  CONFIRMEE: { label: "Confirmée", badge: "badge-success" },
  REFUSEE: { label: "Refusée", badge: "badge-danger" },
  PREPARATION: { label: "Préparation", badge: "badge-info" },
  PRETE_EXPEDITION: { label: "Prête", badge: "badge-info" },
  EXPEDIEE: { label: "Expédiée", badge: "badge-info" },
  LIVREE: { label: "Livrée", badge: "badge-success" },
  ECHEC_LIVRAISON: { label: "Échec", badge: "badge-danger" },
  RETOURNEE: { label: "Retournée", badge: "badge-danger" },
  ANNULEE: { label: "Annulée", badge: "badge-danger" },
};

export const CONTACT_CHANNEL_MAP: Record<ContactChannel, string> = {
  APPEL: "Appel",
  WHATSAPP: "WhatsApp",
};

export const CONTACT_OUTCOME_MAP: Record<ContactOutcome, { label: string; badge: string }> = {
  CONFIRME: { label: "Confirmé", badge: "badge-success" },
  RAPPEL_PLUS_TARD: { label: "Rappel plus tard", badge: "badge-info" },
  PAS_REPONSE: { label: "Pas de réponse", badge: "badge-warning" },
  MAUVAIS_NUMERO: { label: "Mauvais numéro", badge: "badge-danger" },
  REFUSE: { label: "Refusé", badge: "badge-danger" },
  ANNULE: { label: "Annulé", badge: "badge-danger" },
};

export const DELIVERY_STATUS_MAP: Record<Delivery["status"], { label: string; badge: string }> = {
  EN_ATTENTE: { label: "En attente", badge: "badge-warning" },
  EN_COURS: { label: "En cours", badge: "badge-info" },
  LIVREE: { label: "Livrée", badge: "badge-success" },
  ECHEC: { label: "Échec", badge: "badge-danger" },
  RETOUR: { label: "Retour", badge: "badge-danger" },
};

export const PRODUCT_STATUS_MAP: Record<Product["status"], { label: string; badge: string }> = {
  ACTIVE: { label: "Actif", badge: "badge-success" },
  DRAFT: { label: "Brouillon", badge: "badge-warning" },
  ARCHIVED: { label: "Archivé", badge: "badge-neutral" },
};
