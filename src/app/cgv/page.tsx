import type { Metadata } from "next";
import Link from "next/link";
import { Scroll } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente (CGV) — ParaTunisie",
  description: "Conditions générales de vente applicables aux commandes passées sur ParaTunisie.",
};

export default function CGVPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">CGV</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Scroll size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Conditions Générales de Vente</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Les présentes Conditions Générales de Vente régissent l&apos;ensemble des commandes conclues sur la plateforme ParaTunisie.
          </p>
        </header>

        <div className="space-y-6 text-xs sm:text-sm text-ink-muted leading-relaxed">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">1. Commandes & Prix</h2>
            <p>
              Toutes les commandes sont exprimées en Dinars Tunisiens (DT) toutes taxes comprises. Les commandes sont validées dès réception des informations complètes de livraison du client.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">2. Modalités de Paiement</h2>
            <p>
              Le règlement s&apos;effectue exclusivement en espèces à la livraison auprès du livreur lors de la réception physique du colis.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">3. Livraison & Réception</h2>
            <p>
              Les délais de livraison varient de 24h à 48h selon le gouvernorat de destination. Le client s&apos;engage à vérifier l&apos;état extérieur du colis lors de sa remise par le transporteur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
