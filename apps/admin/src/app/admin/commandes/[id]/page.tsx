"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  MessageCircle,
  PhoneCall,
  Plus,
} from "lucide-react";
import {
  ORDER_STATUS_MAP,
  CONTACT_CHANNEL_MAP,
  CONTACT_OUTCOME_MAP,
  type OrderStatus,
  type Order,
  type ContactAttempt,
  type ContactChannel,
  type ContactOutcome,
} from "@/lib/types";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { getAllowedTransitions, TRANSITION_LABELS, getTransitionVariant, isTerminal } from "@/lib/order-state";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";

/* ─── Mock data ───────────────────────────────────────────────────────── */

const mockOrder: Order = {
  id: "CMD-2024-0847",
  reference: "#847",
  customerName: "Amira Ben Salah",
  customerPhone: "+216 55 123 456",
  customerEmail: "amira.bs@email.com",
  governorate: "Tunis",
  delegation: "La Marsa",
  address: "42 Rue de la République, La Marsa, Tunis",
  items: [
    { productName: "Sensibio H2O 500ml", brand: "Bioderma", quantity: 1, unitPrice: 62.500, costPrice: 38.000, lineTotal: 62.500 },
    { productName: "Hydrabio Crème SPF30", brand: "Bioderma", quantity: 1, unitPrice: 48.000, costPrice: 30.000, lineTotal: 48.000 },
    { productName: "Avène Thermal Water 300ml", brand: "Avène", quantity: 2, unitPrice: 39.500, costPrice: 24.000, lineTotal: 79.000 },
  ],
  subtotal: 189.500,
  shipping: 0,
  total: 189.500,
  status: "TENTATIVE_CONTACT",
  paymentMethod: "COD",
  createdAt: new Date(Date.now() - 23 * 60000).toISOString(),
  updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  notes: "Client a demandé livraison avant 14h",
  previousOrders: 7,
  contactAttempts: [
    { id: "ca1", timestamp: new Date(Date.now() - 20 * 60000).toISOString(), staffMember: "Admin", channel: "APPEL", outcome: "PAS_REPONSE", note: "Sonnerie 3 fois, pas de réponse" },
    { id: "ca2", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), staffMember: "Admin", channel: "WHATSAPP", outcome: "RAPPEL_PLUS_TARD", note: "Message envoyé, pas encore de retour" },
  ],
  timeline: [
    { id: "tl1", timestamp: new Date(Date.now() - 23 * 60000).toISOString(), staffMember: "Système", fromStatus: null, toStatus: "EN_ATTENTE" },
    { id: "tl2", timestamp: new Date(Date.now() - 20 * 60000).toISOString(), staffMember: "Admin", fromStatus: "EN_ATTENTE", toStatus: "TENTATIVE_CONTACT", note: "Appel — Pas de réponse" },
  ],
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS_MAP[status];
  return <span className={`badge ${s.badge}`}>{s.label}</span>;
}

function OutcomeBadge({ outcome }: { outcome: ContactOutcome }) {
  const s = CONTACT_OUTCOME_MAP[outcome];
  return <span className={`badge ${s.badge}`}>{s.label}</span>;
}

/* ─── Contact attempt form ─────────────────────────────────────────────── */

function ContactAttemptForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (channel: ContactChannel, outcome: ContactOutcome, note: string) => void;
  onCancel: () => void;
}) {
  const [channel, setChannel] = useState<ContactChannel>("APPEL");
  const [outcome, setOutcome] = useState<ContactOutcome>("PAS_REPONSE");
  const [note, setNote] = useState("");

  return (
    <div className="rounded-lg border border-border bg-surface-alt p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
        Nouvelle tentative
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[0.6875rem] font-medium text-ink">Canal</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ContactChannel)}
            className="field-input text-sm"
          >
            <option value="APPEL">Appel</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[0.6875rem] font-medium text-ink">Résultat</label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as ContactOutcome)}
            className="field-input text-sm"
          >
            {Object.entries(CONTACT_OUTCOME_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="block text-[0.6875rem] font-medium text-ink">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Détails de l&apos;appel…"
          rows={2}
          className="field-input text-sm resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-ink-muted hover:bg-soft-nude transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => onSubmit(channel, outcome, note)}
          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          Enregistrer la tentative
        </button>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function OrderDetailPage() {
  const { toast } = useToast();
  const [order, setOrder] = useState<Order>(mockOrder);
  const [showContactForm, setShowContactForm] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<OrderStatus | null>(null);

  const allowedTransitions = getAllowedTransitions(order.status);

  const handleAddContactAttempt = useCallback(
    (channel: ContactChannel, outcome: ContactOutcome, note: string) => {
      const attempt: ContactAttempt = {
        id: `ca-${Date.now()}`,
        timestamp: new Date().toISOString(),
        staffMember: "Admin",
        channel,
        outcome,
        note: note || undefined,
      };
      setOrder((prev) => ({
        ...prev,
        contactAttempts: [...prev.contactAttempts, attempt],
        updatedAt: new Date().toISOString(),
      }));
      setShowContactForm(false);
      toast("success", "Tentative de contact enregistrée.");
    },
    [toast]
  );

  const handleTransition = useCallback(() => {
    if (!transitionTarget) return;
    setOrder((prev) => ({
      ...prev,
      status: transitionTarget,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...prev.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          staffMember: "Admin",
          fromStatus: prev.status,
          toStatus: transitionTarget,
        },
      ],
    }));
    toast("success", `Commande passée à « ${ORDER_STATUS_MAP[transitionTarget].label} »`);
    setTransitionTarget(null);
  }, [transitionTarget, toast]);

  const totalCost = order.items.reduce((sum, item) => sum + (item.costPrice ?? 0) * item.quantity, 0);
  const estimatedMargin = order.total - totalCost;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/admin/commandes"
          className="mt-0.5 p-1.5 rounded-md hover:bg-soft-nude transition-colors"
          aria-label="Retour aux commandes"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-ink">{order.reference}</h1>
            <StatusBadge status={order.status} />
            {isTerminal(order.status) && (
              <span className="badge badge-neutral">Terminal</span>
            )}
          </div>
          <p className="text-sm text-ink-muted mt-0.5">
            Passée {timeAgo(order.createdAt)} — {order.customerName}
          </p>
        </div>

        {/* Action buttons — only allowed transitions */}
        <div className="flex items-center gap-2 flex-wrap">
          {allowedTransitions.map((target) => {
            const variant = getTransitionVariant(target);
            const btnClass =
              variant === "success"
                ? "bg-success text-white hover:opacity-90"
                : variant === "danger"
                ? "border border-danger/30 text-danger hover:bg-danger-bg"
                : "bg-primary text-white hover:bg-primary-hover";
            return (
              <button
                key={target}
                type="button"
                onClick={() => setTransitionTarget(target)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${btnClass}`}
              >
                {TRANSITION_LABELS[target]}
              </button>
            );
          })}
          {allowedTransitions.length === 0 && (
            <span className="text-xs text-ink-faint italic">Aucune action disponible</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Order items */}
          <section className="rounded-xl border border-border bg-surface-alt">
            <div className="border-b border-border px-4 py-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Articles ({order.items.length})
              </h2>
            </div>
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Marque</th>
                  <th className="text-right">Qté</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="font-medium">{item.productName}</td>
                    <td className="text-ink-muted text-sm">{item.brand}</td>
                    <td className="text-right tabular-nums">{item.quantity}</td>
                    <td className="text-right tabular-nums text-sm">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right font-medium tabular-nums">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right text-ink-muted text-sm">Sous-total</td>
                  <td className="text-right font-medium tabular-nums">{formatCurrency(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right text-ink-muted text-sm">Livraison</td>
                  <td className="text-right font-medium tabular-nums">{order.shipping === 0 ? "Gratuite" : formatCurrency(order.shipping)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="text-right font-semibold">Total</td>
                  <td className="text-right font-bold tabular-nums">{formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Contact attempts */}
          <section className="rounded-xl border border-border bg-surface-alt">
            <div className="border-b border-border px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Tentatives de contact ({order.contactAttempts.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowContactForm(!showContactForm)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                <Plus size={12} />
                Ajouter
              </button>
            </div>
            <div className="p-4 space-y-3">
              {showContactForm && (
                <ContactAttemptForm
                  onSubmit={handleAddContactAttempt}
                  onCancel={() => setShowContactForm(false)}
                />
              )}
              {order.contactAttempts.length === 0 && !showContactForm && (
                <p className="text-sm text-ink-faint text-center py-2">Aucune tentative enregistrée</p>
              )}
              {[...order.contactAttempts].reverse().map((attempt) => (
                <div key={attempt.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0 last:pb-0">
                  <div className="shrink-0 mt-0.5">
                    {attempt.channel === "APPEL" ? (
                      <PhoneCall size={14} className="text-ink-faint" />
                    ) : (
                      <MessageCircle size={14} className="text-ink-faint" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-ink">
                        {CONTACT_CHANNEL_MAP[attempt.channel]}
                      </span>
                      <OutcomeBadge outcome={attempt.outcome} />
                      <span className="text-[0.625rem] text-ink-faint">{timeAgo(attempt.timestamp)}</span>
                    </div>
                    {attempt.note && (
                      <p className="text-xs text-ink-muted mt-1">{attempt.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="rounded-xl border border-border bg-surface-alt p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Notes
              </h2>
              <p className="text-sm text-ink-muted">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <section className="kpi-card">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Client</h2>
            <div className="space-y-2">
              <p className="text-sm font-medium">{order.customerName}</p>
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 text-xs text-ink-muted hover:text-primary transition-colors">
                <Phone size={12} />
                {order.customerPhone}
              </a>
              <a href={`https://wa.me/${order.customerPhone.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-ink-muted hover:text-success transition-colors">
                <MessageCircle size={12} />
                WhatsApp
              </a>
              <div className="flex items-start gap-2 text-xs text-ink-muted">
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>{order.address}</span>
              </div>
              <p className="text-xs text-ink-faint">{order.previousOrders ?? 0} commandes précédentes</p>
            </div>
          </section>

          {/* Payment */}
          <section className="kpi-card">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Paiement</h2>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <CreditCard size={12} />
              <span>{order.paymentMethod === "COD" ? "Paiement à la livraison" : order.paymentMethod}</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold tabular-nums text-ink">
              {formatCurrency(order.total)}
            </p>
            <p className="text-[0.625rem] text-ink-faint mt-0.5">Montant à collecter</p>
          </section>

          {/* Profitability */}
          {totalCost > 0 && (
            <section className="kpi-card">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Rentabilité</h2>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-muted">Coût produits</span>
                  <span className="tabular-nums">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-ink-muted">Chiffre d&apos;affaires</span>
                  <span className="font-medium tabular-nums">{formatCurrency(order.total)}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between text-xs">
                  <span className="font-medium text-ink">Marge brute estimée</span>
                  <span className={`font-semibold tabular-nums ${estimatedMargin >= 0 ? "text-success" : "text-danger"}`}>
                    {formatCurrency(estimatedMargin)}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section className="kpi-card">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Historique</h2>
            <div className="space-y-0">
              {[...order.timeline].reverse().map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-3 pb-4 last:pb-0">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`size-2 rounded-full ${
                        i === 0 ? "bg-primary" : "bg-ink-faint"
                      }`}
                    />
                    {i < order.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-medium ${i === 0 ? "text-ink" : "text-ink-muted"}`}>
                      {ORDER_STATUS_MAP[entry.toStatus].label}
                    </p>
                    <p className="text-[0.625rem] text-ink-faint">
                      {entry.staffMember} — {timeAgo(entry.timestamp)}
                    </p>
                    {entry.note && (
                      <p className="text-[0.625rem] text-ink-muted mt-0.5">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery */}
          <section className="kpi-card">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">Livraison</h2>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Truck size={12} />
              <span>Non assignée</span>
            </div>
          </section>
        </div>
      </div>

      {/* Transition confirmation modal */}
      <ConfirmModal
        open={!!transitionTarget}
        title={transitionTarget ? TRANSITION_LABELS[transitionTarget] : ""}
        description={
          transitionTarget
            ? `Confirmer le passage de « ${ORDER_STATUS_MAP[order.status].label} » à « ${ORDER_STATUS_MAP[transitionTarget].label} » ?`
            : ""
        }
        confirmLabel={transitionTarget ? TRANSITION_LABELS[transitionTarget] : "Confirmer"}
        variant={transitionTarget ? getTransitionVariant(transitionTarget) : "default"}
        onConfirm={handleTransition}
        onCancel={() => setTransitionTarget(null)}
      />
    </div>
  );
}
