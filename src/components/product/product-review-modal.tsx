"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, MessageSquarePlus, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomerSession, type CustomerSession } from "@/lib/customer-auth";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productSlug: string;
  onReviewSubmitted?: () => void;
};

export function ProductReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  productSlug,
  onReviewSubmitted,
}: Props) {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSession(getCustomerSession());
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      setError("Vous devez être connecté pour soumettre un avis.");
      return;
    }
    if (!body.trim()) {
      setError("Veuillez rédiger votre commentaire.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("La note doit être comprise entre 1 et 5 étoiles.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          rating,
          title: title.trim() || undefined,
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de l'enregistrement de l'avis.");
      }

      setSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      setError(err.message || "Impossible d'envoyer votre avis. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-border sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink-muted hover:bg-slate-100 hover:text-ink transition-colors"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>

        {!session ? (
          /* Unauthenticated State */
          <div className="text-center py-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Lock className="size-7" />
            </div>
            <h3 id="review-modal-title" className="font-serif text-xl font-bold text-ink sm:text-2xl">
              Donner votre avis
            </h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Connectez-vous pour donner votre avis sur{" "}
              <strong className="text-ink font-semibold">{productName}</strong>.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/compte?redirect=${encodeURIComponent(`/produits/${productSlug}`)}`}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary/90"
              >
                Se connecter
              </Link>
              <Link
                href={`/compte/inscription?redirect=${encodeURIComponent(`/produits/${productSlug}`)}`}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-white px-6 text-sm font-bold text-ink shadow-xs transition-all hover:bg-slate-50"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        ) : success ? (
          /* Success State */
          <div className="text-center py-6">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink sm:text-2xl">
              Merci pour votre avis !
            </h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              Votre retour a bien été transmis. Il sera vérifié et publié sur la fiche produit par notre équipe.
            </p>
            <Button onClick={onClose} size="lg" className="mt-6 rounded-xl font-bold w-full">
              Fermer
            </Button>
          </div>
        ) : (
          /* Authenticated Review Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquarePlus className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Votre expérience</span>
            </div>
            <h3 id="review-modal-title" className="font-serif text-xl font-bold text-ink">
              Donner votre avis sur {productName}
            </h3>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Votre note *
              </label>
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Note de 1 à 5 étoiles">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`size-7 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-100 text-slate-200"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-ink">
                  {(hoverRating || rating)} / 5
                </span>
              </div>
            </div>

            {/* Optional Title */}
            <div>
              <label htmlFor="review-title" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Titre de votre avis (optionnel)
              </label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Excellente qualité, résultats rapides !"
                className="h-11 rounded-xl bg-background/60 text-sm"
              />
            </div>

            {/* Review Body */}
            <div>
              <label htmlFor="review-body" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
                Votre commentaire *
              </label>
              <textarea
                id="review-body"
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Partagez votre avis sur l'efficacité, le goût, la livraison..."
                className="w-full rounded-xl border border-border bg-background/60 p-3 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none resize-none"
              />
            </div>

            <p className="text-[0.6875rem] text-ink-muted">
              Connecté en tant que <strong className="text-ink">{session.user.name || session.user.email}</strong>.
            </p>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full rounded-xl font-bold h-12 shadow-md shadow-primary/10"
            >
              {submitting ? "Envoi en cours..." : "Publier mon avis"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
