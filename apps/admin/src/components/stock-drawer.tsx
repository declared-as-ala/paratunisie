"use client";

import { useState, useCallback } from "react";
import { X, Boxes, ArrowRight } from "lucide-react";
import { UnsavedChangesModal } from "./unsaved-changes-modal";
import type { StockMovementType } from "@/lib/types";

export interface StockProductModel {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  sku: string;
  image?: string;
  warehouse: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderThreshold: number;
  batchNumber?: string;
  expiryDate?: string;
  purchaseCost: number;
  supplierName?: string;
}

export interface StockAdjustmentSubmitData {
  productId: string;
  movementType: StockMovementType;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  reference?: string;
  note?: string;
}

interface StockDrawerProps {
  open: boolean;
  item?: StockProductModel | null;
  onClose: () => void;
  onSave: (data: StockAdjustmentSubmitData) => void;
}

export function StockDrawer({ open, item, onClose, onSave }: StockDrawerProps) {
  const [movementType, setMovementType] = useState<StockAdjustmentSubmitData["movementType"]>("MANUAL_ADJUSTMENT");
  const [quantity, setQuantity] = useState<number>(0);
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const currentStock = item?.quantityOnHand || 0;
  const newStock = Math.max(0, currentStock + quantity);

  const handleCloseAttempt = useCallback(() => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleSave = useCallback(() => {
    if (!item || quantity === 0) return;
    onSave({
      productId: item.productId,
      movementType,
      quantity,
      batchNumber,
      expiryDate,
      reference,
      note,
    });
    setIsDirty(false);
  }, [item, quantity, movementType, batchNumber, expiryDate, reference, note, onSave]);

  if (!open || !item) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
        <div className="w-full max-w-xl bg-[#F8FAFC] h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Sticky Top Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-[#E11D48] flex items-center justify-center font-bold">
                <Boxes size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">AJUSTER LE STOCK</h2>
                <p className="text-[0.6875rem] font-mono text-slate-500">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={quantity === 0}
                className="px-5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C] disabled:opacity-50 transition-all shadow-xs active:scale-95"
              >
                Valider l&apos;ajustement
              </button>
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6">
            {/* Product Card Header */}
            <div className="rounded-2xl bg-white p-4 border border-slate-200/80 flex items-center gap-4 shadow-xs">
              <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                <img
                  src={item.image || "/assets/product-tube.webp"}
                  alt={item.productName}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-[#E11D48] text-[0.625rem] font-bold">
                  {item.brand}
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">{item.productName}</h3>
                <p className="text-xs text-slate-500 font-medium">Fournisseur: {item.supplierName || "—"}</p>
              </div>
            </div>

            {/* Stock Level Preview Card */}
            <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>STOCK ACTUEL</span>
                <span>VARIATION</span>
                <span>NOUVEAU STOCK</span>
              </div>
              <div className="flex items-center justify-between text-xl font-black">
                <span className="tabular-nums text-slate-300">{currentStock}</span>
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={18} className="text-[#E11D48]" />
                  <span className={`text-base ${quantity > 0 ? "text-emerald-400" : quantity < 0 ? "text-rose-400" : "text-slate-400"}`}>
                    {quantity > 0 ? `+${quantity}` : quantity}
                  </span>
                </div>
                <span className="tabular-nums text-white text-2xl">{newStock}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                DÉTAILS DU MOUVEMENT
              </h3>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  TYPE DE MOUVEMENT
                </label>
                <select
                  value={movementType}
                  onChange={(e) => {
                    setMovementType(e.target.value as StockAdjustmentSubmitData["movementType"]);
                    setIsDirty(true);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#E11D48]"
                >
                  <option value="MANUAL_ADJUSTMENT">Ajustement manuel de stock</option>
                  <option value="PURCHASE_RECEIPT">Réception commande fournisseur (+)</option>
                  <option value="RETURN">Retour client (+)</option>
                  <option value="DAMAGE">Avarie / Casse (-)</option>
                  <option value="EXPIRATION_WRITE_OFF">Mise au rebut / Péremption (-)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  QUANTITÉ À AJUSTER (+ OU -) *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(parseInt(e.target.value) || 0);
                    setIsDirty(true);
                  }}
                  placeholder="ex: 10 ou -2"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-black text-slate-900 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    NUMÉRO DE LOT
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => {
                      setBatchNumber(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="ex: LOT-2026-Q3-01"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    DATE DE PÉREMPTION
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  RÉFÉRENCE PIÈCE / DOCUMENT
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => {
                    setReference(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="ex: BL-2026-0042 ou INV-2026-08"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  MOTIF / REMARQUE
                </label>
                <textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Expliquer la raison de l'ajustement de stock..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <UnsavedChangesModal
        open={showUnsavedModal}
        onContinueEditing={() => setShowUnsavedModal(false)}
        onDiscardAndLeave={() => {
          setShowUnsavedModal(false);
          onClose();
        }}
      />
    </>
  );
}
