"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Truck, Printer, RotateCw, MapPin, Calendar, Clock, CheckCircle, Package } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/toast";

interface Checkpoint {
  date: string;
  location: string;
  description: string;
  code: string;
  comments: string;
}

interface AramexTrackingDrawerProps {
  isOpen: boolean;
  orderId: string | null;
  hawb: string | null;
  labelUrl?: string | null;
  onClose: () => void;
}

export function AramexTrackingDrawer({
  isOpen,
  orderId,
  hawb,
  labelUrl,
  onClose,
}: AramexTrackingDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [activeHawb, setActiveHawb] = useState<string | null>(hawb);

  const fetchTracking = useCallback(async () => {
    if (!orderId && !hawb) return;
    setLoading(true);

    try {
      const target = hawb || orderId;
      const res = await apiClient.get<any>(`/orders/${target}/aramex/track`);
      setCheckpoints(res.checkpoints || []);
      if (res.hawb) setActiveHawb(res.hawb);
    } catch (err: any) {
      toast("error", err instanceof ApiError ? err.message : "Impossible de charger le suivi Aramex");
    } finally {
      setLoading(false);
    }
  }, [orderId, hawb, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchTracking();
    } else {
      setCheckpoints([]);
    }
  }, [isOpen, fetchTracking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-red-50/60 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Suivi Aramex en Direct
                </h3>
                <p className="text-xs font-mono font-bold text-red-600 mt-0.5">
                  HAWB: {activeHawb || hawb || "En attente"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-3">
            <button
              type="button"
              onClick={fetchTracking}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RotateCw size={13} className={loading ? "animate-spin" : ""} />
              Actualiser
            </button>

            {labelUrl && (
              <a
                href={labelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                <Printer size={13} />
                Imprimer Bordereau
              </a>
            )}
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-16 text-center">
                <RotateCw size={28} className="mx-auto animate-spin text-red-600 mb-3" />
                <p className="text-xs font-semibold text-slate-500">
                  Interrogation du serveur Aramex en temps réel...
                </p>
              </div>
            ) : checkpoints.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Package size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Expédition enregistrée chez Aramex
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Le bordereau a été créé. Les étapes de transit apparaîtront dès la prise en charge par le livreur Aramex.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {checkpoints.map((cp, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative group">
                      {/* Dot */}
                      <div
                        className={`absolute -left-6 top-1 h-3 w-3 rounded-full ring-4 ring-white ${
                          isLatest ? "bg-red-600 ring-red-100" : "bg-slate-400 ring-slate-100"
                        }`}
                      />

                      <div
                        className={`rounded-xl p-3.5 border transition-all ${
                          isLatest
                            ? "bg-red-50/40 border-red-200 shadow-xs"
                            : "bg-white border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-xs font-black ${
                              isLatest ? "text-red-700" : "text-slate-800"
                            }`}
                          >
                            {cp.description || "Étape d'expédition"}
                          </span>
                          {cp.code && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.625rem] font-mono font-bold text-slate-600">
                              {cp.code}
                            </span>
                          )}
                        </div>

                        {cp.comments && (
                          <p className="text-xs font-medium text-slate-600 mb-2">
                            {cp.comments}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[0.6875rem] font-medium text-slate-400">
                          {cp.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} className="text-slate-400" />
                              {cp.location}
                            </span>
                          )}
                          {cp.date && (
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-slate-400" />
                              {cp.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
