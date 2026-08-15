import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Retours & Remboursements — ParaTunisie",
  description: "Découvrez notre politique de retour et d'échange sous 7 jours pour vos commandes sur ParaTunisie.",
};

export default function RetoursPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Retours & Remboursements</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <RotateCcw size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Retours & Remboursements</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Votre satisfaction est notre priorité. Si un produit reçu ne correspond pas à vos attentes, vous pouvez effectuer un retour sous respect des conditions ci-dessous.
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-emerald-600" />
              Conditions d&apos;éligibilité au retour
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-ink-muted leading-6 list-disc pl-5">
              <li>Le délai de rétractation est de <strong>7 jours</strong> à compter de la date de réception de votre commande.</li>
              <li>Le produit doit être <strong>strictement neuf, non ouvert, non utilisé</strong> et dans son emballage d&apos;origine intact avec son opercule de protection scellé.</li>
              <li>Pour des raisons d&apos;hygiène et de sécurité sanitaire, aucun produit cosmétique ou dermo-soin ouvert ne sera repris ou échangé.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-primary" />
              Procédure de retour
            </h2>
            <ol className="space-y-3 text-xs sm:text-sm text-ink-muted leading-6 list-decimal pl-5">
              <li>Contactez notre service client par téléphone ou via notre page <Link href="/contact" className="text-primary font-bold hover:underline">Contact</Link> en indiquant votre numéro de commande.</li>
              <li>Une fois le retour validé par notre équipe, l&apos;article est réexpédié ou récupéré par notre transporteur partenaire.</li>
              <li>Après réception et contrôle de conformité dans notre entrepôt, nous procédons à l&apos;échange du produit ou à son remboursement.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
