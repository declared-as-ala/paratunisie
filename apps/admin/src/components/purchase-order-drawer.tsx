"use client";

import { useState } from "react";
import { Drawer, Field, Button, useToast } from "@paratunisie/ui";
import { Trash2, Plus } from "lucide-react";

interface SupplierOption {
  id: string;
  name: string;
}

interface VariantOption {
  variantId: string;
  productName: string;
  brand: string;
  label: string;
}

export interface PurchaseOrderLineInput {
  variantId: string;
  quantity: number;
  unitCostMillimes: number;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  expectedDate?: string;
  lines: PurchaseOrderLineInput[];
}

interface PurchaseOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  suppliers: SupplierOption[];
  variants: VariantOption[];
  onSave: (data: CreatePurchaseOrderInput) => Promise<void> | void;
}

interface DraftLine {
  variantId: string;
  quantity: number;
  unitCostDT: number;
}

export function PurchaseOrderDrawer({ open, onClose, suppliers, variants, onSave }: PurchaseOrderDrawerProps) {
  const { toast } = useToast();
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);

  const formKey = open ? "open" : "closed";
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    if (open) {
      setSupplierId(suppliers[0]?.id ?? "");
      setExpectedDate("");
      setLines([]);
    }
  }

  function addLine() {
    if (variants.length === 0) return;
    setLines((prev) => [...prev, { variantId: variants[0].variantId, quantity: 1, unitCostDT: 0 }]);
  }

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!supplierId) {
      toast("error", "Sélectionnez un fournisseur.");
      return;
    }
    if (lines.length === 0) {
      toast("error", "Ajoutez au moins une ligne de commande.");
      return;
    }
    if (lines.some((l) => l.quantity <= 0 || l.unitCostDT <= 0)) {
      toast("error", "Quantité et coût unitaire doivent être positifs sur chaque ligne.");
      return;
    }

    await onSave({
      supplierId,
      expectedDate: expectedDate || undefined,
      lines: lines.map((l) => ({
        variantId: l.variantId,
        quantity: l.quantity,
        unitCostMillimes: Math.round(l.unitCostDT * 1000),
      })),
    });
    onClose();
  }

  const totalMillimes = lines.reduce((sum, l) => sum + l.quantity * Math.round(l.unitCostDT * 1000), 0);

  return (
    <Drawer
      open={open}
      title="Nouveau bon de commande"
      description="Commande fournisseur — la réception mettra à jour le stock et l'historique des prix d'achat"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-soft-nude">
            Annuler
          </button>
          <Button type="button" onClick={handleSubmit}>
            Créer le bon de commande
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fournisseur *" required>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="field-input">
              {suppliers.length === 0 && <option value="">Aucun fournisseur</option>}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Date attendue">
            <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="field-input" />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">Lignes de commande</h3>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-primary hover:underline">
              <Plus size={12} /> Ajouter une ligne
            </button>
          </div>

          {lines.length === 0 && (
            <p className="text-xs text-ink-faint py-3 text-center border border-dashed border-border rounded-lg">
              Aucune ligne — ajoutez au moins un produit.
            </p>
          )}

          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={line.variantId}
                    onChange={(e) => updateLine(index, { variantId: e.target.value })}
                    className="field-input flex-1"
                  >
                    {variants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>{v.productName} — {v.brand} ({v.label})</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeLine(index)} className="p-1.5 rounded-lg hover:bg-danger-bg text-danger">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Quantité">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateLine(index, { quantity: Number(e.target.value) || 0 })}
                      className="field-input"
                    />
                  </Field>
                  <Field label="Coût unitaire (DT)">
                    <input
                      type="number"
                      min={0}
                      step={0.001}
                      value={line.unitCostDT}
                      onChange={(e) => updateLine(index, { unitCostDT: Number(e.target.value) || 0 })}
                      className="field-input"
                    />
                  </Field>
                </div>
                <p className="text-[0.6875rem] text-ink-faint text-right">
                  Sous-total : {((line.quantity * line.unitCostDT)).toFixed(3)} DT
                </p>
              </div>
            ))}
          </div>

          {lines.length > 0 && (
            <div className="flex justify-between text-xs font-semibold text-ink pt-2 border-t border-border">
              <span>Total commande</span>
              <span className="tabular-nums">{(totalMillimes / 1000).toFixed(3)} DT</span>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
