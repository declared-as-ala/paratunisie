import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

interface SupportingGuideLink {
  slug: string;
  title: string;
  tag: string;
}

const HUB_SUPPORTING_GUIDES: Record<string, SupportingGuideLink[]> = {
  creatine: [
    { slug: "creatine-monohydrate-ou-micronisee-differences", title: "Créatine monohydrate ou micronisée : quelles différences réelles ?", tag: "Comparatif" },
    { slug: "creatine-poudre-ou-gelules-comparatif", title: "Créatine en poudre ou en gélules : quel format choisir ?", tag: "Format" },
    { slug: "creatine-phase-de-charge-utile-ou-inutile", title: "Phase de charge en créatine : protocole utile ou dépassé ?", tag: "Protocole" },
    { slug: "creatine-cout-par-portion-comparatif", title: "Créatine : comment calculer le vrai coût par portion de 3 g et 5 g ?", tag: "Budget" },
  ],
  "whey-proteine": [
    { slug: "besoins-proteines-selon-activite-physique", title: "Besoins en protéines par jour : sédentaire, endurance ou musculation", tag: "Dosage" },
    { slug: "lire-etiquette-nutritionnelle-whey-proteine", title: "Lire l'étiquette d'une whey protéine : glucides, lactose et additifs", tag: "Étiquette" },
    { slug: "prix-100g-proteines-pures-comparer-whey", title: "Prix aux 100 g de protéines pures : comparer les wheys", tag: "Budget" },
    { slug: "whey-et-intolerance-lactose-solutions", title: "Whey et intolérance au lactose : isolate, hydrolysée ou végétale ?", tag: "Digestion" },
  ],
  "whey-isolate": [
    { slug: "whey-et-intolerance-lactose-solutions", title: "Whey et intolérance au lactose : isolate, hydrolysée ou végétale ?", tag: "Digestion" },
    { slug: "calculer-teneur-reelle-proteines-par-dose", title: "Comment comparer la teneur réelle en protéines par dose de whey ?", tag: "Qualité" },
    { slug: "whey-native-vs-whey-fromagere-differences", title: "Whey native vs whey fromagère : procédé de fabrication et intérêts", tag: "Procédé" },
    { slug: "whey-proteine-et-perte-de-poids-satiety", title: "Whey protéine et perte de poids : rôle sur la satiété et la masse maigre", tag: "Objectif" },
  ],
  ashwagandha: [
    { slug: "ashwagandha-quest-ce-que-cest-plante-adaptogene", title: "Qu'est-ce que l'ashwagandha ? Origine et usages étudiés", tag: "Fondamentaux" },
    { slug: "ashwagandha-ksm-66-vs-sensoril-vs-standard", title: "Extraits d'ashwagandha : KSM-66, Sensoril et extraits standardisés", tag: "Extraits" },
    { slug: "withanolides-ashwagandha-comprendre-titrage", title: "Withanolides dans l'ashwagandha : comprendre le titrage", tag: "Dosage" },
    { slug: "ashwagandha-interactions-medicamenteuses", title: "Ashwagandha et interactions médicamenteuses : précautions", tag: "Sécurité" },
  ],
  magnesium: [
    { slug: "formes-de-magnesium-absorption-tolerance", title: "Formes de magnésium : comprendre l'absorption et la tolérance", tag: "Biodisponibilité" },
    { slug: "magnesium-bisglycinate-vs-citrate-comparatif", title: "Magnésium bisglycinate vs citrate : lequel choisir selon votre profil ?", tag: "Comparatif" },
    { slug: "magnesium-elementaire-vs-poids-compose", title: "Magnésium élémentaire vs poids du composé : lire les mg", tag: "Étiquette" },
    { slug: "choisir-son-magnesium-criteres-objectif", title: "Comment choisir un bon complément de magnésium selon son besoin ?", tag: "Guide" },
  ],
  "omega-3": [
    { slug: "epa-et-dha-roles-complementaires-omega-3", title: "EPA et DHA : quelles différences entre ces deux acides gras Oméga 3 ?", tag: "Science" },
    { slug: "concentration-epa-dha-taille-portion-omega-3", title: "Oméga 3 : comprendre la concentration réelle vs 1000 mg d'huile", tag: "Dosage" },
    { slug: "qualite-fraicheur-indice-totox-omega-3", title: "Qualité et fraîcheur des Oméga 3 : indice TOTOX et oxydation", tag: "Qualité" },
    { slug: "comparatif-formats-omega-3-cout-epa-dha", title: "Comparer deux produits Oméga 3 : coût par gramme d'EPA + DHA", tag: "Budget" },
  ],
  collagene: [
    { slug: "collagene-marin-vs-bovin-origine-differences", title: "Collagène marin vs bovin : origine, types et critères de choix", tag: "Comparatif" },
    { slug: "collagene-hydrolyse-peptides-explication", title: "Collagène hydrolysé et peptides : pourquoi le poids moléculaire compte", tag: "Science" },
    { slug: "types-de-collagene-1-2-3-differences", title: "Types de collagène I, II et III : à quoi correspond chaque type ?", tag: "Guide" },
    { slug: "comparer-qualite-prix-collagene-tnd", title: "Collagène : comparer la qualité et le prix pour 10 g de peptides", tag: "Budget" },
  ],
  vitamines: [
    { slug: "vitamine-d-soleil-carence-dosage-hiver", title: "Vitamine D : pourquoi les déficits restent fréquents malgré le soleil", tag: "Déficits" },
    { slug: "vitamine-c-formes-acide-ascorbique-liposomale", title: "Vitamine C : acide ascorbique classique, tamponnée ou liposomale ?", tag: "Comparatif" },
    { slug: "comprendre-vnr-et-unites-ui-mcg-etiquettes", title: "Comprendre les étiquettes : % VNR, UI, µg et mg expliqués", tag: "Étiquette" },
    { slug: "interactions-entre-vitamines-et-mineraux", title: "Interactions entre nutriments : fer, calcium, zinc et vitamine C", tag: "Synergies" },
  ],
  mineraux: [
    { slug: "zinc-formes-picolinate-bisglycinate-citrate", title: "Zinc : picolinate, bisglycinate, citrate ou gluconate", tag: "Comparatif" },
    { slug: "fer-quand-se-supplementer-bilan-ferritine", title: "Fer en complément : pourquoi faire doser la ferritine avant toute prise ?", tag: "Sécurité" },
    { slug: "calcium-apports-alimentaires-formes-citrate-carbonate", title: "Calcium : apports alimentaires vs suppléments (citrate ou carbonate)", tag: "Formes" },
    { slug: "interactions-entre-vitamines-et-mineraux", title: "Interactions entre nutriments : fer, calcium, zinc et cuivre", tag: "Synergies" },
  ],
  probiotiques: [
    { slug: "probiotiques-vs-prebiotiques-differences-roles", title: "Probiotiques vs prébiotiques : rôles complémentaires pour le microbiote", tag: "Fondamentaux" },
    { slug: "comprendre-souches-bacteriennes-probiotiques", title: "Comprendre les souches de probiotiques : genre, espèce et code", tag: "Science" },
    { slug: "etiquetage-ufc-milliards-probiotiques-explication", title: "Étiquetage des probiotiques : que signifient les milliards d'UFC ?", tag: "Étiquette" },
    { slug: "comparer-produits-probiotiques-criteres-fiables", title: "Comment comparer deux compléments probiotiques sur des critères objectifs ?", tag: "Guide" },
  ],
  "pre-workout": [
    { slug: "lire-etiquette-pre-workout-matrice-proprietary", title: "Lire une étiquette de pre-workout et repérer les proprietary blends", tag: "Étiquette" },
    { slug: "cafeine-dans-les-pre-workout-dosage-tolerance", title: "Caféine dans les pre-workout : dosages, tolérance et sommeil", tag: "Dosage" },
    { slug: "citrulline-l-citrulline-vs-citrulline-malate", title: "L-Citrulline vs Citrulline Malate : dosages réels", tag: "Comparatif" },
    { slug: "choisir-pre-workout-composition-verifiee", title: "Choisir un pre-workout selon sa composition vérifiée", tag: "Guide" },
  ],
  "complements-alimentaires": [
    { slug: "verifier-authenticite-complements-tunisie-checklist", title: "Vérifier l'authenticité d'un complément alimentaire en Tunisie : 7 points", tag: "Authenticité" },
    { slug: "calculer-cout-par-portion-tnd-complements", title: "Comparer les compléments en TND : calculer le coût par dose réelle", tag: "Budget" },
    { slug: "stocker-complements-climat-chaud-tunisie", title: "Stocker ses compléments sous le climat tunisien : chaleur et humidité", tag: "Conservation" },
    { slug: "construire-routine-complements-sans-gaspillage", title: "Construire une routine de compléments utile sans gaspillage", tag: "Méthode" },
  ],
};

export function CategorySupportingGuides({
  categorySlug,
  categoryName,
}: {
  categorySlug: string;
  categoryName: string;
}) {
  const guides = HUB_SUPPORTING_GUIDES[categorySlug];
  if (!guides || guides.length === 0) return null;

  return (
    <section
      aria-labelledby="category-supporting-guides"
      className="rounded-2xl border border-border/80 bg-white p-4 sm:p-6 lg:p-8 shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen size={20} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Guides éducatifs associés
            </p>
            <h2
              id="category-supporting-guides"
              className="mt-0.5 font-serif text-lg font-extrabold text-ink sm:text-xl"
            >
              Approfondir vos connaissances sur {categoryName}
            </h2>
          </div>
        </div>
        <Link
          href="/conseils"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          Tous nos guides <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/conseils/${g.slug}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-[#FAF7F5]/60 p-3.5 hover:border-primary/50 hover:bg-white transition-all"
          >
            <div className="min-w-0">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                {g.tag}
              </span>
              <p className="text-xs sm:text-sm font-bold text-ink group-hover:text-primary transition-colors line-clamp-2">
                {g.title}
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-ink-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </section>
  );
}
