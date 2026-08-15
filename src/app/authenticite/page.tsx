import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Award, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Authenticité & Qualité des Produits — ParaTunisie",
  description: "Engagement d'authenticité 100% garanti sur tous nos produits dermo-cosmétiques en Tunisie.",
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
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Authenticité 100% Garantie</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Chez ParaTunisie, la santé et la beauté de votre peau ne tolèrent aucun compromis. Nous garantissons la provenance directe et la traçabilité complète de chaque produit référencé sur notre site.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <Award className="size-8 text-primary mb-3" />
            <h2 className="font-serif text-lg font-bold text-ink mb-2">Circuit de Distribution Officiel</h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Tous nos produits proviennent directement des filiales officielles et laboratoires distributeurs agréés en Tunisie (La Roche-Posay, Bioderma, Avène, CeraVe, Vichy, SVR, Uriage, Nuxe, etc.).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <Lock className="size-8 text-primary mb-3" />
            <h2 className="font-serif text-lg font-bold text-ink mb-2">Contrôle des DATES & Scellés</h2>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Nos équipes vérifient systématiquement les numéros de lots, les opercules de protection d&apos;origine ainsi que les dates de péremption pour garantir une fraîcheur et une tolérance parfaites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
