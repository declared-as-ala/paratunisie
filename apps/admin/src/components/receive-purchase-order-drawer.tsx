"use client";

import { useState } from "react";
import { Drawer, Field, Button, useToast } from "@paratunisie/ui";

export interface ReceivableLine {
  lineId: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  quantityReceived: number;
}

export interface ReceiveLineInput {
  lineId: string;
  quantityReceived: number;
  batchNumber?: string;
  expirationDate?: string;
}

interface ReceivePurchaseOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  poReference: string;
  lines: ReceivableLine[];
  onSave: (lines: ReceiveLineInput[]) => Promise<void> | void;
}

interface DraftReceiveLine {
  lineId: string;
  quantityReceived: number;
  batchNumber: string;
  expirationDate: string;
}

export function ReceivePurchaseOrderDrawer({ open, onClose, poReference, lines, onSave }: ReceivePurchaseOrderDrawerProps) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<DraftReceiveLine[]>([]);

  const formKey = open ? poReference : "closed";
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    if (open) {
      setDraft(
        lines
          .filter((l) => l.quantityReceived < l.quantity)
          .map((l) => ({ lineId: l.lineId, quantityReceived: l.quantity - l.quantityReceived, batchNumber: "", expirationDate: "" })),
      );
    }
  }

  function updateLine(lineId: string, patch: Partial<DraftReceiveLine>) {
    setDraft((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, ...patch } : l)));
  }

  async function handleSubmit() {
    const toSubmit = draft.filter((l) => l.quantityReceived > 0);
    if (toSubmit.length === 0) {
      toast("error", "Indiquez au moins une quantité reçue.");
      return;
    }
    await onSave(
      toSubmit.map((l) => ({
        lineId: l.lineId,
        quantityReceived: l.quantityReceived,
        batchNumber: l.batchNumber || undefined,
        expirationDate: l.expirationDate || undefined,
      })),
    );
    onClose();
  }

  return (
    <Drawer
      open={open}
      title={`Réceptionner — ${poReference}`}
      description="Chaque réception crée un lot, un mouvement de stock et une entrée d'historique de prix d'achat"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-soft-nude">
            Annuler
          </button>
          <Button type="button" onClick={handleSubmit}>
            Confirmer la réception
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {lines.filter((l) => l.quantityReceived < l.quantity).length === 0 && (
          <p className="text-xs text-ink-faint text-center py-4">Toutes les lignes ont déjà été réceptionnées.</p>
        )}
        {lines
          .filter((l) => l.quantityReceived < l.quantity)
          .map((line) => {
            const d = draft.find((x) => x.lineId === line.lineId);
            const remaining = line.quantity - line.quantityReceived;
            return (
              <div key={line.lineId} className="rounded-lg border border-border p-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-ink">{line.productName}</p>
                  <p className="text-[0.6875rem] text-ink-faint">
                    {line.variantLabel} — reçu {line.quantityReceived}/{line.quantity}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field label={`Qté reçue (max ${remaining})`}>
                    <input
                      type="number"
                      min={0}
                      max={remaining}
                      value={d?.quantityReceived ?? 0}
                      onChange={(e) => updateLine(line.lineId, { quantityReceived: Math.min(remaining, Number(e.target.value) || 0) })}
                      className="field-input"
                    />
                  </Field>
                  <Field label="N° de lot">
                    <input
                      value={d?.batchNumber ?? ""}
                      onChange={(e) => updateLine(line.lineId, { batchNumber: e.target.value })}
                      className="field-input"
                      placeholder="Auto"
                    />
                  </Field>
                  <Field label="Expiration">
                    <input
                      type="date"
                      value={d?.expirationDate ?? ""}
                      onChange={(e) => updateLine(line.lineId, { expirationDate: e.target.value })}
                      className="field-input"
                    />
                  </Field>
                </div>
              </div>
            );
          })}
      </div>
    </Drawer>
  );
}
