"use client";

import { useState } from "react";
import type { PurchasePriceHistory } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Drawer, Field, useToast } from "@paratunisie/ui";

/* ─── Types ────────────────────────────────────────────────────────────── */

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  taxInfo?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
}

interface SupplierDetail {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxInfo: string | null;
  leadTimeDays: number | null;
  paymentTerms: string | null;
  notes: string | null;
  isActive: boolean;
  brandsSupplied?: string[];
}

interface SupplierDrawerProps {
  open: boolean;
  onClose: () => void;
  supplier?: SupplierDetail | null;
  history?: PurchasePriceHistory[];
  onSave: (data: SupplierFormData) => void | Promise<void>;
}

/* Weighted-average proxy on decimal-DT price entries — the real backend
   weighted-average (D-0017) is computed server-side from Batch quantities;
   this is a display-only simple average of the price points shown here. */
function averagePrice(history: PurchasePriceHistory[], productId: string): number {
  const entries = history.filter((h) => h.productId === productId);
  if (entries.length === 0) return 0;
  return entries.reduce((acc, e) => acc + e.purchasePrice, 0) / entries.length;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export function SupplierDrawer({ open, onClose, supplier, history = [], onSave }: SupplierDrawerProps) {
  const { toast } = useToast();
  const isEditing = !!supplier;

  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [taxInfo, setTaxInfo] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState<number | "">("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  /* Reset the form when the drawer opens for a new target — render-time
     adjustment (React docs: "storing information from previous renders"),
     not a setState-in-effect cascade. */
  const formKey = open ? (supplier?.id ?? "new") : "closed";
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    if (supplier) {
      setName(supplier.name);
      setContactPerson(supplier.contactPerson ?? "");
      setPhone(supplier.phone ?? "");
      setEmail(supplier.email ?? "");
      setAddress(supplier.address ?? "");
      setTaxInfo(supplier.taxInfo ?? "");
      setLeadTimeDays(supplier.leadTimeDays ?? "");
      setPaymentTerms(supplier.paymentTerms ?? "");
      setNotes(supplier.notes ?? "");
      setIsActive(supplier.isActive);
    } else {
      setName(""); setContactPerson(""); setPhone(""); setEmail("");
      setAddress(""); setTaxInfo(""); setLeadTimeDays(""); setPaymentTerms("");
      setNotes(""); setIsActive(true);
    }
  }

  async function handleSave() {
    if (!name.trim() || !contactPerson.trim()) {
      toast("error", "Veuillez remplir le nom et le contact.");
      return;
    }
    await onSave({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
      taxInfo: taxInfo.trim() || undefined,
      leadTimeDays: typeof leadTimeDays === "number" ? leadTimeDays : undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive,
    });
    onClose();
  }

  /* Group history by product for this supplier */
  const historyByProduct = history.reduce<Record<string, PurchasePriceHistory[]>>((acc, h) => {
    (acc[h.productId] ??= []).push(h);
    return acc;
  }, {});

  return (
    <Drawer
      open={open}
      title={isEditing ? `Modifier — ${supplier.name}` : "Nouveau fournisseur"}
      description={isEditing ? "Modifier les informations du fournisseur" : "Ajouter un fournisseur au carnet"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-soft-nude"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {isEditing ? "Enregistrer" : "Créer le fournisseur"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Section: Informations */}
        <Section title="Informations">
          <Field label="Nom du fournisseur *" required>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="Ex: Laboratoires Vian" />
          </Field>
          <Field label="Personne de contact *" required>
            <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="field-input" placeholder="Nom du contact" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input" placeholder="+216 XX XXX XXX" />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" placeholder="contact@fournisseur.tn" />
            </Field>
          </div>
          <Field label="Adresse">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="field-input" placeholder="Adresse complète" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Matricule fiscale">
              <input value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} className="field-input" placeholder="1234567/A/M/000" />
            </Field>
            <Field label="Statut">
              <select value={isActive ? "ACTIVE" : "INACTIVE"} onChange={(e) => setIsActive(e.target.value === "ACTIVE")} className="field-input">
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Section: Conditions commerciales */}
        <Section title="Conditions commerciales">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Délai de livraison (jours)">
              <input type="number" min={0} value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value ? Number(e.target.value) : "")} className="field-input" placeholder="7" />
            </Field>
            <Field label="Conditions de paiement">
              <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="field-input" placeholder="30 jours" />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="field-input resize-none" placeholder="Notes internes…" />
          </Field>
        </Section>

        {/* Section: Marques fournies */}
        {isEditing && supplier.brandsSupplied && supplier.brandsSupplied.length > 0 && (
          <Section title="Marques fournies">
            <div className="flex flex-wrap gap-1.5">
              {supplier.brandsSupplied.map((brand) => (
                <span key={brand} className="badge badge-neutral">{brand}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Section: Historique des prix d'achat */}
        {isEditing && Object.keys(historyByProduct).length > 0 && (
          <Section title="Historique des prix d'achat">
            <div className="space-y-4">
              {Object.entries(historyByProduct).map(([productId, entries]) => {
                const productName = entries[0].productName;
                const sorted = [...entries].sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime());
                const latest = sorted[sorted.length - 1];
                const avg = averagePrice(history, productId);
                const first = sorted[0].purchasePrice;
                const trend = latest.purchasePrice - first;
                return (
                  <div key={productId} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink">{productName}</span>
                      <span className={`text-[0.6875rem] font-semibold tabular-nums ${trend > 0 ? "text-danger" : trend < 0 ? "text-success" : "text-ink-muted"}`}>
                        {trend > 0 ? "+" : ""}{formatCurrency(trend)}
                      </span>
                    </div>
                    {/* Mini sparkline */}
                    <div className="flex items-end gap-0.5 h-8">
                      {sorted.map((entry, i) => {
                        const prices = sorted.map((e) => e.purchasePrice);
                        const min = Math.min(...prices);
                        const max = Math.max(...prices);
                        const range = max - min || 1;
                        const height = ((entry.purchasePrice - min) / range) * 100;
                        const isLast = i === sorted.length - 1;
                        return (
                          <div key={entry.id} className="flex-1 flex flex-col items-center gap-0.5">
                            <div
                              className={`w-full rounded-sm ${isLast ? "bg-primary" : "bg-ink/15"}`}
                              style={{ height: `${Math.max(height, 8)}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Entries */}
                    <div className="space-y-1">
                      {sorted.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between text-[0.6875rem]">
                          <span className="text-ink-muted">{formatDate(entry.effectiveDate)}</span>
                          <span className="font-medium tabular-nums text-ink">{formatCurrency(entry.purchasePrice)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[0.625rem] text-ink-faint pt-1 border-t border-border">
                      <span>Prix moyen (affichage)</span>
                      <span className="font-semibold tabular-nums">{formatCurrency(avg)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}
      </div>
    </Drawer>
  );
}

/* ─── Layout helpers ────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
