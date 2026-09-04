import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import { buildCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Mentions Légales — ParaTunisie",
  description: "Informations légales et éditoriales concernant la plateforme e-commerce ParaTunisie.",
  alternates: {
    canonical: buildCanonicalUrl("/mentions-legales"),
  },
};

export default function MentionsLegalesPage() {
  return (
    <div className="bg-[#FAF7F5] min-h-screen py-10 sm:py-14 text-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ink-muted mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-ink font-bold">Mentions Légales</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Mentions Légales</h1>
          <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            Mentions légales et informations de la plateforme de commerce électronique ParaTunisie.
          </p>
        </header>

        <div className="space-y-6 text-xs sm:text-sm text-ink-muted leading-relaxed">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">1. Éditeur de la plateforme</h2>
            <p>
              Le site internet <strong>ParaTunisie</strong> est une plateforme spécialisée dans la distribution en ligne de soins dermo-cosmétiques, solaires, capillaires et de parapharmacie en Tunisie.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">2. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus (textes, visuels, logos, arborescences, illustrations) présents sur la plateforme sont protégés au titre des droits d&apos;auteur et de la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-2xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-2">3. Responsabilité médicale & cosmétique</h2>
            <p>
              Les informations et conseils dispensés sur ParaTunisie ont un caractère purement informatif et dermo-cosmétique. Ils ne remplacent en aucun cas une consultation médicale auprès d&apos;un médecin dermatologue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
