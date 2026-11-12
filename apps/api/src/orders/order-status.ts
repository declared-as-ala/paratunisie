import { OrderStatus } from "@prisma/client";

// Allowed transitions per REQUIREMENTS.md §A.2 — mirrors the client-side table
// already in apps/admin/src/lib/order-state.ts. Enforced here so an invalid
// transition is structurally impossible, not just discouraged in the UI (D-0016/D-0024).
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  EN_ATTENTE: ["TENTATIVE_CONTACT", "CONFIRMEE", "ANNULEE"],
  TENTATIVE_CONTACT: ["TENTATIVE_CONTACT", "CONFIRMEE", "ANNULEE", "REFUSEE"],
  CONFIRMEE: ["PREPARATION", "ANNULEE"],
  PREPARATION: ["PRETE_EXPEDITION", "ANNULEE"],
  PRETE_EXPEDITION: ["EXPEDIEE"],
  EXPEDIEE: ["LIVREE", "ECHEC_LIVRAISON"],
  ECHEC_LIVRAISON: ["EXPEDIEE", "RETOURNEE"],
  LIVREE: [],
  RETOURNEE: [],
  ANNULEE: [],
  REFUSEE: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedTransitions(from: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

export const TERMINAL_STATUSES: OrderStatus[] = ["LIVREE", "RETOURNEE", "ANNULEE", "REFUSEE"];

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

// French labels so admins never see raw enum names in error messages.
export const STATUS_LABELS_FR: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  TENTATIVE_CONTACT: "Tentative de contact",
  CONFIRMEE: "Confirmée",
  PREPARATION: "En préparation",
  PRETE_EXPEDITION: "Prête à expédier",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ECHEC_LIVRAISON: "Échec de livraison",
  RETOURNEE: "Retournée",
  ANNULEE: "Annulée",
  REFUSEE: "Refusée",
};

export function statusLabel(status: OrderStatus): string {
  return STATUS_LABELS_FR[status] ?? status;
}
