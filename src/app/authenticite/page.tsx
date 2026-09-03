import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Award, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Authenticité & Qualité des Produits — ParaTunisie",
  description: "Découvrez les engagements de ParaTunisie concernant l'identification et le contrôle des produits proposés.",
};

export default function AuthenticitePage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Authenticité</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Notre engagement produit</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            ParaTunisie présente les informations d’identification disponibles pour chaque produit. À la réception, vérifiez l’état de l’emballage, le numéro de lot et la date indiquée avant utilisation.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <Award className="size-8 text-primary mb-3" />
            <h2 className="font-serif text-lg font-bold text-ink mb-2">Sélection des fournisseurs</h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Nous sélectionnons nos références auprès de fournisseurs identifiés et conservons les informations commerciales associées aux produits reçus.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <Lock className="size-8 text-primary mb-3" />
            <h2 className="font-serif text-lg font-bold text-ink mb-2">Contrôle des DATES & Scellés</h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Nos équipes contrôlent l’état apparent des emballages et les dates indiquées lors de la réception. Contactez le service client si un produit reçu paraît endommagé ou non conforme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
