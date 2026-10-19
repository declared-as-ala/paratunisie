import Link from "next/link";

/**
 * Single source of truth for the Shop FAQ — rendered here AND used to build
 * the FAQPage JSON-LD in shop/page.tsx, so the two can never drift.
 * Reflects authentic ParaTunisie catalog: nutrition sportive, compléments alimentaires,
 * vitamines, bien-être et sélection de produits de parapharmacie.
 */
export const SHOP_FAQ: { question: string; answer: string }[] = [
  {
    question: "Quels produits peut-on commander sur ParaTunisie ?",
    answer:
      "ParaTunisie propose une sélection de compléments alimentaires, de nutrition sportive (créatine, whey protéine, gainers, pré-workout, BCAA), de vitamines et minéraux, ainsi qu'une sélection de produits de bien-être et de parapharmacie, organisés par marque et catégorie.",
  },
  {
    question: "Comment trouver un complément adapté à mes objectifs sportifs ?",
    answer:
      "Utilisez les filtres du Shop pour affiner par catégorie (Créatine, Protéines, Vitamines...) ou par marque, ou consultez nos guides conseils rédigés pour vous aider à comprendre les dosages et les bienfaits.",
  },
  {
    question: "Quelles marques de nutrition sportive sont disponibles ?",
    answer:
      "Retrouvez les marques reconnues du marché telles que BioTechUSA, Optimum Nutrition, Real Pharm, Quamtrax, WeightWorld, Eric Favre et Challenger Nutrition, avec des informations transparentes sur chaque pot.",
  },
  {
    question: "Livrez-vous partout en Tunisie ?",
    answer:
      "Oui, ParaTunisie livre dans l'ensemble des 24 gouvernorats tunisiens (Tunis, Sousse, Sfax, Nabeul, Bizerte, etc.) sous 24 à 48 heures ouvrables.",
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Le paiement s'effectue en espèces à la livraison directement auprès du livreur lors de la réception de votre colis.",
  },
  {
    question: "Comment rechercher une marque spécifique sur la boutique ?",
    answer:
      "Utilisez le filtre Marques dans la barre latérale du Shop ou visitez notre répertoire complet sur la page Marques.",
  },
];

const INTERNAL_LINKS: { label: string; href: string }[] = [
  { label: "Créatine Monohydrate", href: "/creatine" },
  { label: "Whey Protéine", href: "/whey-proteine" },
  { label: "Mass Gainers", href: "/gainers-proteines" },
  { label: "Pré-Workout", href: "/pre-workout" },
  { label: "Pack Anti-Stress", href: "/pack-anti-stress" },
  { label: "Toutes les Marques", href: "/marques" },
  { label: "Blog & Conseils", href: "/conseils" },
];

export function ShopSeoContent() {
  return (
    <section className="border-t border-border bg-brand-blush/25">
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {/* ── SEO copy block ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div className="space-y-5">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Boutique Nutrition Sportive &amp; Compléments Alimentaires en Tunisie
            </h2>
            <div className="space-y-4 text-sm leading-7 text-ink-muted sm:text-[0.9375rem]">
              <p>
                <strong>ParaTunisie</strong> est une plateforme e-commerce tunisienne spécialisée dans la nutrition
                sportive, les compléments alimentaires, le bien-être et une sélection de produits de parapharmacie.
                Notre catalogue réunit des références sélectionnées auprès de grandes marques reconnues pour
                accompagner vos entraînements, votre prise de masse, votre sèche ou votre vitalité au quotidien.
              </p>
              <p>
                Explorez notre catalogue de <strong>créatine monohydrate</strong>, <strong>whey protéine</strong> (concentré et isolat),
                <strong>mass gainers</strong>, <strong>pré-workout</strong>, acides aminés (BCAA, EAA, citrulline) ainsi que nos
                complexes de vitamines (Vitamine D3+K2, Magnésium Bisglycinate, Zinc, Oméga 3 et Ashwagandha KSM-66).
                Chaque fiche produit détaille la composition, le format et le prix pour vous permettre de choisir en toute confiance,
                avec une livraison rapide partout en Tunisie.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {INTERNAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────── */}
          <div>
            <h2 className="font-serif text-xl font-bold text-ink sm:text-2xl">Questions fréquentes</h2>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-white">
              {SHOP_FAQ.map((item) => (
                <details key={item.question} className="group px-4 py-3.5 first:rounded-t-2xl last:rounded-b-2xl open:bg-soft-nude/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink marker:content-none">
                    <span>{item.question}</span>
                    <span className="shrink-0 text-lg font-normal leading-none text-primary transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
