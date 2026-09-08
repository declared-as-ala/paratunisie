"use client";

import { useState } from "react";
import { Truck, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/toast";

export interface AramexStatusConfig {
  label: string;
  dotColor: string;
  badgeClass: string;
  icon: string;
}

export function getAramexStatusConfig(
  status?: string | null,
  labelOverride?: string | null
): AramexStatusConfig {
  const s = (status || "").toUpperCase();

  switch (s) {
    case "DELIVERED":
      return {
        label: labelOverride || "Livrée",
        dotColor: "bg-emerald-500",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100",
        icon: "✓",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: labelOverride || "En cours de livraison",
        dotColor: "bg-amber-500",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100",
        icon: "📦",
      };
    case "IN_TRANSIT":
      return {
        label: labelOverride || "En transit",
        dotColor: "bg-purple-500",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100",
        icon: "●",
      };
    case "PICKED_UP":
      return {
        label: labelOverride || "Collectée",
        dotColor: "bg-blue-500",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100",
        icon: "●",
      };
    case "PICKUP_REQUESTED":
      return {
        label: labelOverride || "Ramassage demandé",
        dotColor: "bg-sky-500",
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100",
        icon: "●",
      };
    case "DELIVERY_ATTEMPT":
      return {
        label: labelOverride || "Tentative de livraison",
        dotColor: "bg-yellow-500",
        badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200/80 hover:bg-yellow-100",
        icon: "⚠️",
      };
    case "REFUSED":
      return {
        label: labelOverride || "Refusée",
        dotColor: "bg-rose-500",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100",
        icon: "🔴",
      };
    case "RETURN_REQUESTED":
      return {
        label: labelOverride || "Retour demandé",
        dotColor: "bg-orange-500",
        badgeClass: "bg-orange-50 text-orange-800 border-orange-200/80 hover:bg-orange-100",
        icon: "🟠",
      };
    case "RETURNING":
      return {
        label: labelOverride || "En cours de retour",
        dotColor: "bg-orange-500",
        badgeClass: "bg-orange-50 text-orange-800 border-orange-200/80 hover:bg-orange-100",
        icon: "↩",
      };
    case "RETURNED":
      return {
        label: labelOverride || "Retournée",
        dotColor: "bg-red-600",
        badgeClass: "bg-red-50 text-red-700 border-red-200/80 hover:bg-red-100",
        icon: "↩",
      };
    case "EXCEPTION":
      return {
        label: labelOverride || "Problème livraison",
        dotColor: "bg-rose-600",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100",
        icon: "⚠️",
      };
    case "CANCELLED":
      return {
        label: labelOverride || "Annulée",
        dotColor: "bg-slate-500",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
        icon: "⚫",
      };
    case "CREATED":
    default:
      return {
        label: labelOverride || "Créée",
        dotColor: "bg-slate-400",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100",
        icon: "⚪",
      };
  }
}

interface AramexBadgeProps {
  orderId?: string;
  hawb?: string | null;
  labelUrl?: string | null;
  trackingStatus?: string | null;
  trackingLabel?: string | null;
  trackingLocation?: string | null;
  lastTrackingUpdate?: string | null;
  lastAramexSync?: string | null;
  onOpenCreate?: () => void;
  onOpenTrack?: () => void;
  onSyncShipment?: (updatedShipment: any) => void;
  compact?: boolean;
}

export function AramexBadge({
  orderId,
  hawb,
  labelUrl,
  trackingStatus,
  trackingLabel,
  onOpenCreate,
  onOpenTrack,
  onSyncShipment,
}: AramexBadgeProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hawb) return;
    navigator.clipboard.writeText(hawb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hawb && !orderId) return;
    setSyncing(true);
    try {
      const target = hawb || orderId;
      const res = await apiClient.post<any>(`/orders/${target}/aramex/sync`);
      if (res.shipment) {
        onSyncShipment?.(res.shipment);
        const stLabel = res.normalized?.label || res.shipment?.trackingLabel || "Mis à jour";
        toast("success", `Suivi Aramex synchronisé : ${stLabel}`);
      }
    } catch (err: any) {
      toast(
        "error",
        err instanceof ApiError
          ? err.message
          : "Impossible de synchroniser avec le serveur Aramex"
      );
    } finally {
      setSyncing(false);
    }
  };

  if (!hawb) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenCreate?.();
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1 text-[0.6875rem] font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all active:scale-95"
        title="Créer une expédition Aramex"
      >
        <Truck size={13} className="text-red-600" />
        <span>+ Aramex</span>
      </button>
    );
  }

  const statusCfg = getAramexStatusConfig(trackingStatus, trackingLabel);

  return (
    <div className="flex flex-col items-start gap-1 py-0.5">
      {/* Top row: AWB & quick actions */}
      <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenTrack?.();
          }}
          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
          title="Suivre l'expédition Aramex en direct"
        >
          <Truck size={13} />
          <span className="font-mono text-[0.6875rem] font-bold">{hawb}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
          title="Copier le numéro de suivi HAWB"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
        </button>

        {labelUrl && (
          <a
            href={labelUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
            title="Imprimer le bordereau officiel Aramex (PDF)"
          >
            <ExternalLink size={12} />
          </a>
        )}

        <button
          type="button"
          disabled={syncing}
          onClick={handleSync}
          className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors disabled:opacity-50"
          title="Actualiser le statut Aramex en temps réel"
        >
          <RefreshCw size={11} className={syncing ? "animate-spin text-red-600" : ""} />
        </button>
      </div>

      {/* Bottom row: Live Status Badge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenTrack?.();
        }}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.625rem] font-bold transition-all shadow-2xs ${statusCfg.badgeClass}`}
        title="Cliquer pour voir l'historique de suivi complet"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotColor}`} />
        <span>{statusCfg.label}</span>
      </button>
    </div>
  );
}
