"use client";

import { useState } from "react";
import { X, Send, CheckCircle2, Phone, User, Mail, MessageSquare, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/data/products";
import { submitProductRequest } from "@/lib/api/client";

export interface DemanderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    brand?: string;
    image?: string;
    priceMillimes: number;
    format?: string;
  };
}

export function DemanderModal({ isOpen, onClose, product }: DemanderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("Je souhaite être informé(e) dès que ce produit sera disponible.");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Veuillez renseigner votre nom complet.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg("Veuillez renseigner un numéro de téléphone valide.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await submitProductRequest({
        productId: product.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        quantity: Math.max(1, quantity),
        message: message.trim() || undefined,
      });

      if (error || !data) {
        setErrorMsg(error || "Une erreur est survenue. Veuillez réessayer.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMsg("Impossible de joindre le serveur. Veuillez réessayer ultérieurement.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-border/80 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demander-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-soft-nude/40 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs border border-amber-500/20">
              ✉
            </span>
            <div>
              <h2 id="demander-modal-title" className="text-sm sm:text-base font-bold text-ink">
                Demande de produit sur commande
              </h2>
              <p className="text-[0.6875rem] text-ink-muted">
                Soyez alerté en priorité dès disponibilité
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fermer"
            className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-black/5 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-ink">Demande enregistrée avec succès !</h3>
              <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
                Merci <span className="font-semibold text-ink">{fullName}</span>. Notre équipe commerciale vous contactera au{" "}
                <span className="font-semibold text-ink">{phone}</span> dès que le produit sera disponible.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto min-w-32 bg-primary text-white hover:bg-primary-hover font-bold rounded-xl"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* Product Summary Preview */}
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-warm-cream/30 p-2.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white border border-border/40 p-1 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image || "/assets/product-tube.webp"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/product-tube.webp";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                {product.brand && (
                  <p className="text-[0.625rem] font-bold uppercase tracking-wider text-primary truncate">
                    {product.brand}
                  </p>
                )}
                <p className="text-xs sm:text-sm font-bold text-ink line-clamp-1">
                  {product.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs font-extrabold text-ink font-tabular">
                    {formatPrice(product.priceMillimes)}
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.6rem] font-bold text-amber-700 border border-amber-500/20">
                    Sur commande
                  </span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">
                  Nom et prénom <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute start-3 top-2.5 size-4 text-ink-muted/70" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mohamed Ben Salem"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-white py-2 ps-9 pe-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    Numéro de téléphone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-2.5 size-4 text-ink-muted/70" />
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 98 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-white py-2 ps-9 pe-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    Email <span className="text-ink-muted font-normal">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-2.5 size-4 text-ink-muted/70" />
                    <input
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-white py-2 ps-9 pe-3 text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-ink mb-1">
                    Quantité souhaitée
                  </label>
                  <div className="relative">
                    <Package className="absolute start-3 top-2.5 size-4 text-ink-muted/70" />
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-border/80 bg-white py-2 ps-9 pe-3 text-xs sm:text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-ink mb-1">
                    Message / Précisions
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute start-3 top-2.5 size-4 text-ink-muted/70" />
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-white py-2 ps-9 pe-3 text-xs sm:text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl text-xs font-semibold px-4"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary text-white hover:bg-primary-hover rounded-xl text-xs font-bold gap-2 px-5"
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Envoyer ma demande</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
