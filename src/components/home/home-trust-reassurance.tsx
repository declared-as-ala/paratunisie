import { ShieldCheck, Truck, Headphones, RotateCcw } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Produits identifiés",
    description: "Marque, format et informations disponibles affichés sur chaque fiche.",
  },
  {
    icon: Truck,
    title: "Livraison Partout en Tunisie",
    description: "Expédition rapide sous 24h à 48h à domicile ou au bureau.",
  },
  {
    icon: Headphones,
    title: "Service client",
    description: "Une équipe à votre écoute pour les questions liées à votre commande.",
  },
  {
    icon: RotateCcw,
    title: "Paiement à la Livraison",
    description: "Réglez en toute sécurité au livreur après vérification.",
  },
];

export function HomeTrustReassurance() {
  return (
    <section className="bg-white py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-surface-alt border border-border/70">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">{item.title}</h4>
                  <p className="text-[0.6875rem] text-ink-muted leading-relaxed mt-1">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
