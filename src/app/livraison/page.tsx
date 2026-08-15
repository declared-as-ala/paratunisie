import type { Metadata } from "next";
import Link from "next/link";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Livraison partout en Tunisie — ParaTunisie",
  description: "Découvrez nos modes et délais de livraison rapide (24h-48h) sur les 24 gouvernorats de la Tunisie.",
};

export default function LivraisonPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Livraison</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Truck size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Politique de Livraison</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            ParaTunisie assure la livraison rapide et sécurisée de vos soins dermatologiques sur l&apos;ensemble du territoire tunisien.
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 mb-3">
              <Clock size={18} className="text-primary" />
              Délais d&apos;expédition & de livraison
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-muted leading-6 list-disc pl-5">
              <li><strong>Grand Tunis</strong> (Tunis, Ariana, Ben Arous, Manouba) : Livraison sous <strong>24 heures ouvrables</strong>.</li>
              <li><strong>Autres gouvernorats</strong> (Sousse, Sfax, Nabeul, Bizerte, Gabès, Djerba, etc.) : Livraison sous <strong>24h à 48h ouvrables</strong>.</li>
              <li>Les commandes passées avant 14h00 sont préparées et expédiées le jour même.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-primary" />
              Tarifs de livraison
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-ink-muted leading-6">
              <p>
                <strong className="text-primary text-base">Livraison OFFERTE</strong> pour toute commande égale ou supérieure à <strong>99 DT</strong>.
              </p>
              <p>
                Pour les commandes inférieures à 99 DT, un tarif fixe de <strong>7 DT</strong> s&apos;applique sur l&apos;ensemble des gouvernorats.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-primary" />
              Suivi de votre colis
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-6">
              Dès le départ de votre colis, vous recevez une confirmation par SMS et/ou téléphone. Le livreur vous contacte avant son passage à l&apos;adresse indiquée. Vous payez en espèces directement au livreur lors de la réception.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
