import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Banknote, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Paiement à la Livraison — ParaTunisie",
  description: "Payez votre commande en espèces en toute simplicité et sécurité lors de la livraison.",
};

export default function PaiementPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Paiement</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <CreditCard size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Paiement à la Livraison</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Pour simplifier vos achats en toute confiance partout en Tunisie, ParaTunisie privilégie le mode de règlement 100% sécurisé à la réception de votre colis.
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs flex items-start gap-4">
            <Banknote size={32} className="text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-serif text-xl font-bold text-ink mb-2">Paiement en espèces lors de la remise</h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Vous ne réglez votre commande qu&apos;au moment exact où le livreur vous remet votre colis en main propre. Aucun paiement par carte bancaire en ligne n&apos;est exigé à l&apos;avance.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs flex items-start gap-4">
            <ShieldCheck size={32} className="text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-serif text-xl font-bold text-ink mb-2">Vérification & Transparence</h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Le montant exact indiqué sur votre bon de commande (incluant les frais de livraison le cas échéant) est le seul montant dû au livreur. Aucun frais supplémentaire n&apos;est demandé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
