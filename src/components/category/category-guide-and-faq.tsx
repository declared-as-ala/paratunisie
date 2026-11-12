"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface CategoryGuideAndFaqProps {
  categoryName: string;
  categorySlug: string;
  customFaqs?: FaqItem[];
}

export function CategoryGuideAndFaq({
  categoryName,
  categorySlug,
  customFaqs,
}: CategoryGuideAndFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isCreatine = categorySlug.includes("creatine");
  const isBienEtre = categorySlug.includes("bien-etre") || categorySlug.includes("ashwagandha") || categorySlug.includes("magnesium") || categorySlug.includes("sommeil");

  const defaultFaqs: FaqItem[] = isCreatine
    ? [
        {
          question: "Quelle est la meilleure créatine ?",
          answer: "La Créatine Monohydrate (label Creapure de préférence) est la forme la plus pure, la plus étudiée scientifiquement et offrant le meilleur rapport efficacité/prix en Tunisie.",
        },
        {
          question: "Comment prendre la créatine ?",
          answer: "Prenez 3 à 5 grammes par jour avec de l'eau ou un jus de fruits, idéalement après l'entraînement. La phase de charge n'est pas obligatoire.",
        },
        {
          question: "Y a-t-il des effets secondaires ?",
          answer: "Aux dosages recommandés (3-5 g/jour), la créatine est parfaitement sûre pour les personnes en bonne santé. Veillez simplement à bien vous hydrater.",
        },
        {
          question: "La créatine est-elle adaptée aux débutants ?",
          answer: "Oui, la créatine convient aussi bien aux sportifs débutants qu'aux athlètes confirmés cherchant à gagner en force et volume musculaire.",
        },
      ]
    : isBienEtre
    ? [
        {
          question: "Comment associer Ashwagandha et Magnésium ?",
          answer: "Ils sont parfaitement complémentaires : l'Ashwagandha régule le cortisol et l'anxiété, tandis que le Magnésium détend les muscles et le système nerveux.",
        },
        {
          question: "À quel moment de la journée les consommer ?",
          answer: "L'Ashwagandha peut être pris le matin ou le soir avec un repas. Le Magnésium (bisglycinate ou marin) est idéalement pris le soir au dîner.",
        },
        {
          question: "Au bout de combien de temps ressent-on les effets ?",
          answer: "Le magnésium agit dès les premiers jours sur la relaxation. L'Ashwagandha déploie ses bienfaits adaptogènes profonds après 1 à 2 semaines de cure régulière.",
        },
        {
          question: "Ces compléments créent-ils une accoutumance ?",
          answer: "Non, ni l'Ashwagandha KSM-66 ni le magnésium ne créent de dépendance ou d'accoutumance.",
        },
      ]
    : [
        {
          question: `Comment choisir son complément ${categoryName} ?`,
          answer: "Vérifiez la pureté des ingrédients, la posologie recommandée et privilégiez les marques certifiées disponibles sur ParaTunisie.",
        },
        {
          question: "Quelle est la posologie recommandée ?",
          answer: "Respectez scrupuleusement les indications sur l'emballage ou demandez conseil à notre pharmacien sur WhatsApp.",
        },
        {
          question: "Les produits sont-ils certifiés authentiques ?",
          answer: "Tous nos produits proviennent directement des distributeurs officiels agréés en Tunisie avec traçabilité garantie.",
        },
        {
          question: "Quels sont les délais de livraison en Tunisie ?",
          answer: "Nous livrons partout en Tunisie sous 24 à 48 heures ouvrables à domicile.",
        },
      ];

  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs.slice(0, 4) : defaultFaqs;

  const guideTitle = isCreatine
    ? "Guide d'achat : Comment choisir votre créatine ?"
    : isBienEtre
    ? "Guide d'achat : Ashwagandha ou Magnésium pour le stress ?"
    : `Guide d'achat : Comment bien choisir ${categoryName.toLowerCase()} ?`;

  const guideDesc = isCreatine
    ? "Découvrez nos conseils pour choisir la meilleure créatine selon vos objectifs, votre niveau et votre budget."
    : isBienEtre
    ? "Découvrez nos recommandations expertes pour équilibrer votre système nerveux et retrouver un sommeil réparateur."
    : "Retrouvez tous nos comparatifs et conseils d'experts pour trouver la formule la plus adaptée à vos besoins.";

  const guideImage = isCreatine
    ? "/assets/hero-split-creatine.webp"
    : isBienEtre
    ? "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp"
    : "/assets/hero-split-vitamines.webp";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-10">
      
      {/* ── Left Card: Buying Guide ─────────────────────────────────── */}
      <div className="rounded-3xl border border-border/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
        <div className="flex gap-5 items-center">
          <div className="relative size-24 sm:size-28 shrink-0 rounded-2xl overflow-hidden bg-[#FAF7F5] border border-border/60 p-2">
            <Image
              src={guideImage}
              alt={guideTitle}
              fill
              sizes="120px"
              className="object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-ink leading-snug">
              {guideTitle}
            </h3>
            <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-2">
              {guideDesc}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/60">
          <Link
            href="/conseils"
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Lire le guide complet</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Right Card: Frequently Asked Questions (FAQ) ────────────── */}
      <div className="rounded-3xl border border-border/80 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              <h3 className="text-sm sm:text-base font-bold text-ink">
                Questions fréquentes
              </h3>
            </div>

            <Link
              href="/conseils"
              className="text-xs font-semibold text-primary hover:underline transition-colors"
            >
              Voir toutes les questions →
            </Link>
          </div>

          {/* List of 4 FAQ questions */}
          <ul className="mt-2 divide-y divide-border/60">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <li key={idx} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-3 text-start text-xs sm:text-sm font-semibold text-ink hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronDown size={16} className="text-primary shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-ink-muted shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <p className="mt-2 text-xs leading-relaxed text-ink-muted bg-[#FAF7F5] p-3 rounded-xl border border-border/60">
                      {faq.answer}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

    </div>
  );
}
