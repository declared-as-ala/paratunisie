import type { OrderStatus } from "./types";

/**
 * Allowed transitions per REQUIREMENTS.md §A.2.
 * The admin UI only offers transitions valid from the current state.
 */

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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

export function getAllowedTransitions(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status] ?? [];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/**
 * Human-readable label for each transition action.
 */
export const TRANSITION_LABELS: Record<string, string> = {
  TENTATIVE_CONTACT: "Tenter contact",
  CONFIRMEE: "Confirmer",
  ANNULEE: "Annuler",
  REFUSEE: "Refuser",
  PREPARATION: "Préparer",
  PRETE_EXPEDITION: "Marquer prête",
  EXPEDIEE: "Expédier",
  LIVREE: "Marquer livrée",
  ECHEC_LIVRAISON: "Échec livraison",
  RETOURNEE: "Marquer retournée",
};

/**
 * Transition action variants for button styling.
 */
export function getTransitionVariant(toStatus: OrderStatus): "success" | "danger" | "default" {
  if (["CONFIRMEE", "LIVREE", "PREPARATION", "PRETE_EXPEDITION", "EXPEDIEE"].includes(toStatus)) {
    return "success";
  }
  if (["ANNULEE", "REFUSEE", "ECHEC_LIVRAISON", "RETOURNEE"].includes(toStatus)) {
    return "danger";
  }
  return "default";
}

/**
 * Get the order status flow step index for progress visualization.
 */
export function getStatusStep(status: OrderStatus): number {
  const flow: OrderStatus[] = [
    "EN_ATTENTE",
    "TENTATIVE_CONTACT",
    "CONFIRMEE",
    "PREPARATION",
    "PRETE_EXPEDITION",
    "EXPEDIEE",
    "LIVREE",
  ];
  const idx = flow.indexOf(status);
  if (idx >= 0) return idx;
  // Terminal failure states
  if (status === "ANNULEE" || status === "REFUSEE") return -1;
  if (status === "ECHEC_LIVRAISON") return 5;
  if (status === "RETOURNEE") return 6;
  return 0;
}
