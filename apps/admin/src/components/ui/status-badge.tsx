import { cn } from "@paratunisie/ui";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const TONE: Record<StatusTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-soft-nude text-ink-muted",
  primary: "bg-primary-soft/70 text-primary",
};

// Single source of truth for commercial order statuses (label + tone).
export const ORDER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
  EN_ATTENTE: { label: "En attente", tone: "warning" },
  TENTATIVE_CONTACT: { label: "Tentative de contact", tone: "info" },
  CONFIRMEE: { label: "Confirmée", tone: "success" },
  PREPARATION: { label: "En préparation", tone: "primary" },
  PRETE_EXPEDITION: { label: "Prête à expédier", tone: "primary" },
  EXPEDIEE: { label: "Expédiée", tone: "info" },
  LIVREE: { label: "Livrée", tone: "success" },
  ECHEC_LIVRAISON: { label: "Échec de livraison", tone: "danger" },
  RETOURNEE: { label: "Retournée", tone: "danger" },
  ANNULEE: { label: "Annulée", tone: "neutral" },
  REFUSEE: { label: "Refusée", tone: "danger" },
};

export function StatusBadge({ tone = "neutral", children, className }: { tone?: StatusTone; children: React.ReactNode; className?: string }) {
  return <span className={cn("badge", TONE[tone], className)}>{children}</span>;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, tone: "neutral" as StatusTone };
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}
