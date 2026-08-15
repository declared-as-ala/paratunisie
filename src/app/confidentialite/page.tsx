import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — ParaTunisie",
  description: "Protection de vos données personnelles et politique de confidentialité sur ParaTunisie.",
};

export default function ConfidentialitePage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Confidentialité</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Politique de Confidentialité</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            ParaTunisie s&apos;engage à protéger votre vie privée et la confidentialité de vos données personnelles.
          </p>
        </header>

        <div className="space-y-6 text-xs sm:text-sm text-ink-muted leading-relaxed">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">1. Collecte des données</h2>
            <p>
              Les données personnelles collectées (nom, numéro de téléphone, adresse de livraison) sont uniquement utilisées pour traiter, expédier et assurer le suivi de vos commandes.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-[#FAF7F5] border border-border/80 p-6">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">2. Non-divulgation à des tiers</h2>
            <p>
              Vos données ne sont ni vendues, ni louées, ni cédées à des tiers. Seules les coordonnées nécessaires à la livraison sont transmises à notre transporteur partenaire.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">3. Vos droits</h2>
            <p>
              Vous disposez à tout moment d&apos;un droit d&apos;accès, de modification ou de suppression de vos données personnelles sur simple demande auprès de notre service client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
