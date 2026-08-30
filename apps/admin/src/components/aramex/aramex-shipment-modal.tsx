"use client";

import { useState } from "react";
import { X, Truck, Printer, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/toast";

interface AramexShipmentModalProps {
  isOpen: boolean;
  order: {
    id: string;
    reference?: string;
    customerName: string;
    phone: string;
    city: string;
    address: string;
    total: number;
    customerNote?: string;
  } | null;
  onClose: () => void;
  onSuccess: (result: { hawb: string; labelUrl: string | null }) => void;
}

export function AramexShipmentModal({
  isOpen,
  order,
  onClose,
  onSuccess,
}: AramexShipmentModalProps) {
  const { toast } = useToast();

  const [nom, setNom] = useState(order?.customerName || "");
  const [phone, setPhone] = useState(order?.phone || "");
  const [ville, setVille] = useState(order?.city || "");
  const [adresse, setAdresse] = useState(order?.address || "");
  const [weight, setWeight] = useState("1.0");
  const [pieces, setPieces] = useState("1");
  const [codAmount, setCodAmount] = useState(order ? String(Math.round(order.total)) : "0");
  const [instructions, setInstructions] = useState(order?.customerNote || "");

  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ hawb: string; labelUrl: string | null } | null>(null);

  // Sync state if order changes
  if (order && !nom && order.customerName) {
    setNom(order.customerName);
    setPhone(order.phone);
    setVille(order.city);
    setAdresse(order.address);
    setCodAmount(String(Math.round(order.total)));
  }

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.post<any>(`/orders/${order.id}/aramex/create-shipment`, {
        nom: nom.trim(),
        phone: phone.trim(),
        ville: ville.trim(),
        adresse: adresse.trim(),
        weight: parseFloat(weight) || 1.0,
        pieces: parseInt(pieces, 10) || 1,
        codAmount: parseFloat(codAmount) || 0,
        instructions: instructions.trim(),
      });

      setCreatedResult({
        hawb: res.hawb,
        labelUrl: res.labelUrl,
      });

      toast("success", `Expédition Aramex créée ! HAWB: ${res.hawb}`);
      onSuccess({ hawb: res.hawb, labelUrl: res.labelUrl });
    } catch (err: any) {
      toast("error", err instanceof ApiError ? err.message : "Échec de création de l'expédition Aramex");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-red-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Expédition Aramex
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Commande #{order.reference || order.id.slice(-6)} • {order.customerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {createdResult ? (
          /* Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800">
                Bordereau Aramex Généré avec Succès !
              </h4>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Numéro de suivi (HAWB) :{" "}
                <span className="font-mono font-bold text-red-600">{createdResult.hawb}</span>
              </p>
            </div>

            {createdResult.labelUrl ? (
              <div className="pt-2">
                <a
                  href={createdResult.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all active:scale-95"
                >
                  <Printer size={18} />
                  Imprimer le Bordereau (PDF)
                </a>
              </div>
            ) : (
              <p className="text-xs text-amber-600 font-medium">
                L'étiquette est enregistrée sur votre compte Aramex.
              </p>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Nom du Destinataire *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Téléphone (+216) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Ville / Gouvernorat *
                </label>
                <input
                  type="text"
                  required
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Adresse Complète *
                </label>
                <input
                  type="text"
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Nb de Colis
                </label>
                <input
                  type="number"
                  min="1"
                  value={pieces}
                  onChange={(e) => setPieces(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                  Montant COD (DT)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.6875rem] font-bold text-slate-600 mb-1">
                Instructions de Livraison (Optionnel)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Livrer le matin, appeler avant..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[0.6875rem] text-slate-500">
              <AlertCircle size={14} className="text-slate-400 shrink-0" />
              <span>
                Expéditeur : <strong>Proteine Tunisie</strong> (Sousse) • Service : <strong>ONP / DOM</strong>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
                Valider et Générer le Bordereau
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
