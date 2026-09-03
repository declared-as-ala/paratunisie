import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Centre d'Aide & FAQ — ParaTunisie",
  description: "Trouvez les réponses aux questions les plus fréquentes sur vos commandes, produits et livraisons.",
};

const FAQS = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "La livraison est effectuée sous 24h sur le Grand Tunis et sous 24h à 48h sur le reste de la Tunisie."
  },
  {
    q: "Quels sont les frais de livraison ?",
    a: "La livraison est GRATUITE dès 99 DT de commande. Pour les commandes inférieures à 99 DT, les frais s'élèvent à 7 DT."
  },
  {
    q: "Comment payer ma commande ?",
    a: "Le paiement s'effectue en espèces à la livraison directement auprès du livreur lors de la réception de votre colis."
  },
  {
    q: "Les produits sont-ils authentiques ?",
    a: "Nous sélectionnons nos références auprès de fournisseurs identifiés. À la réception, vérifiez l’emballage, le numéro de lot et la date indiquée, et contactez-nous en cas d’anomalie."
  },
  {
    q: "Puis-je modifier ou annuler une commande ?",
    a: "Vous pouvez annuler ou modifier votre commande tant qu'elle n'a pas été expédiée en contactant rapidement notre service client."
  }
];

export default function AidePage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Centre d&apos;aide</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Centre d&apos;aide & FAQ</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Retrouvez les réponses aux questions les plus courantes posées par nos clients.
          </p>
        </header>

        <div className="space-y-4 mb-8">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-white p-5 shadow-2xs">
              <h2 className="font-serif text-base font-bold text-ink mb-2">{faq.q}</h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 text-center">
          <h2 className="font-serif text-xl font-bold text-ink mb-2">Besoin d&apos;une aide supplémentaire ?</h2>
          <p className="text-xs sm:text-sm text-ink-muted mb-4 max-w-md mx-auto">
            Nos conseillers sont disponibles pour vous guider dans le choix de vos soins.
          </p>
          <a
            href={whatsappHref}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-3 text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
          >
            <MessageCircle size={16} />
            Discuter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
