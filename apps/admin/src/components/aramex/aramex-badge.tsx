"use client";

import { useState } from "react";
import { Truck, Copy, Check, ExternalLink } from "lucide-react";

interface AramexBadgeProps {
  hawb?: string | null;
  labelUrl?: string | null;
  onOpenCreate?: () => void;
  onOpenTrack?: () => void;
}

export function AramexBadge({ hawb, labelUrl, onOpenCreate, onOpenTrack }: AramexBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hawb) return;
    navigator.clipboard.writeText(hawb);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-2xs">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenTrack?.();
        }}
        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
        title="Suivre l'expédition Aramex"
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
          title="Imprimer le bordereau PDF"
        >
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
