import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle, ShieldCheck, Sparkles, AlertTriangle, FileText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique Éditoriale & Charte de Confiance | ParaTunisie",
  description:
    "Découvrez les standards de rédaction, la méthodologie de recherche scientifique et la charte de transparence de l'équipe éditoriale de ParaTunisie.",
  alternates: { canonical: "/politique-editoriale" },
};

export default function PolitiqueEditorialePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <ShieldCheck className="size-3.5" />
          Transparence & Rigueur Scientifique
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
          Politique Éditoriale & Charte de Confiance
        </h1>
        <p className="mt-3 text-sm text-ink-muted sm:text-base max-w-2xl mx-auto">
          Comment l’équipe éditoriale de ParaTunisie conçoit, vérifie et actualise ses guides de nutrition sportive, de bien-être et de micronutrition.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-ink-muted">
        {/* Section 1: Mission */}
        <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4 text-ink">
            <BookOpen className="size-5 text-primary" />
            <h2 className="font-serif text-xl font-bold">1. Notre Mission d’Information</h2>
          </div>
          <p>
            ParaTunisie s’engage à fournir aux sportifs, pratiquants de musculation et passionnés de santé en Tunisie une information claire, objective, documentée et sans promesses trompeuses.
          </p>
          <p className="mt-3">
            Dans le domaine des compléments alimentaires, le sensationnalisme et les allégations marketing exagérées sont fréquents. Notre charte éditoriale repose sur le principe de <strong>rigueur factuelle</strong> : nous expliquons ce que la science démontre, ce qui reste à l’état d’hypothèse, et ce qui relève du simple argument commercial.
          </p>
        </section>

        {/* Section 2: Sources & Methodology */}
        <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4 text-ink">
            <CheckCircle className="size-5 text-emerald-600" />
            <h2 className="font-serif text-xl font-bold">2. Méthodologie & Sources Scientifiques</h2>
          </div>
          <p>
            Tous nos articles sont rédigés sur la base de données probantes issues de la littérature scientifique et d’organismes de référence internationaux :
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li><strong>Société Internationale de Nutrition Sportive (ISSN)</strong> : pour les positions consensuelles sur la créatine, les protéines et les acides aminés.</li>
            <li><strong>Autorité Européenne de Sécurité des Aliments (EFSA)</strong> : pour les allégations nutritionnelles autorisées et les seuils de sécurité.</li>
            <li><strong>Bases de données médicales indexées (PubMed, Cochrane Library)</strong> : revues systématiques et méta-analyses indépendantes.</li>
            <li><strong>Étiquetages et fiches techniques officielles</strong> fournis par les fabricants de marques reconnues (Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, etc.).</li>
          </ul>
        </section>

        {/* Section 3: Product Selection */}
        <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4 text-ink">
            <Sparkles className="size-5 text-amber-600" />
            <h2 className="font-serif text-xl font-bold">3. Sélection des Produits & Objectivité</h2>
          </div>
          <p>
            Les produits présentés dans nos guides comparatifs sont issus de notre catalogue réel disponible en Tunisie. Nous évaluons les références selon des critères mesurables et vérifiables :
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="p-4 rounded-xl bg-soft-nude/40 border border-border/60">
              <strong className="text-ink block text-xs uppercase tracking-wider mb-1">Transparence des formules</strong>
              <span>Dosage précis des principes actifs par portion, sans mélanges propriétaires opaques.</span>
            </div>
            <div className="p-4 rounded-xl bg-soft-nude/40 border border-border/60">
              <strong className="text-ink block text-xs uppercase tracking-wider mb-1">Rapport Qualité / Prix</strong>
              <span>Calcul du coût par portion journalière pour une vision budgétaire réelle.</span>
            </div>
            <div className="p-4 rounded-xl bg-soft-nude/40 border border-border/60">
              <strong className="text-ink block text-xs uppercase tracking-wider mb-1">Authenticité & Traçabilité</strong>
              <span>Produits 100% originaux certifiés, numéros de lot vérifiables et conformité douanière.</span>
            </div>
            <div className="p-4 rounded-xl bg-soft-nude/40 border border-border/60">
              <strong className="text-ink block text-xs uppercase tracking-wider mb-1">Retours Pratiquants</strong>
              <span>Avis clients réels et retours sur la solubilité, la tolérance digestive et le goût.</span>
            </div>
          </div>
        </section>

        {/* Section 4: Medical Disclaimer */}
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 text-amber-950">
          <div className="flex items-center gap-3 mb-3 text-amber-900">
            <AlertTriangle className="size-5 text-amber-700" />
            <h2 className="font-serif text-xl font-bold">4. Avertissement Santé & Non-Substitution Médicale</h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed">
            Les contenus publiés sur ParaTunisie ont une finalité strictement <strong>informative et pédagogique</strong>. Ils ne constituent en aucun cas une prescription médicale, un diagnostic ou une consultation personnalisée.
          </p>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed">
            Les compléments alimentaires doivent être consommés dans le cadre d’un mode de vie sain et d’une alimentation équilibrée. Ils ne remplacent pas les repas. En cas de pathologie sous-jacente, de traitement médicamenteux en cours, de grossesse ou d’allaitement, demandez l’avis préalable d’un médecin ou pharmacien.
          </p>
        </section>

        {/* Section 5: Editorial Team */}
        <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4 text-ink">
            <FileText className="size-5 text-primary" />
            <h2 className="font-serif text-xl font-bold">5. Signatures & Mises à Jour Régulières</h2>
          </div>
          <p>
            Tous les articles sont rédigés et supervisés par l’<strong>Équipe éditoriale ParaTunisie</strong>. Lorsque de nouvelles études scientifiques ou de nouvelles directives réglementaires apparaissent, nos guides sont révisés et actualisés avec mention de la date de dernière mise à jour.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/conseils"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Consulter nos guides & conseils
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-xs font-semibold text-ink hover:bg-soft-nude transition-colors"
            >
              Poser une question à notre équipe
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
