"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GammeItem {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  dotColor: string;
  image: string;
  href: string;
}

const GAMMES: GammeItem[] = [
  {
    id: "creatine",
    num: "1",
    title: "Créatine & Force",
    subtitle: "Hydratation & Puissance",
    description: "Augmente la force explosive, le volume cellulaire et l'endurance musculaire anaérobie.",
    dotColor: "#00639A",
    image: "/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp",
    href: "/creatine",
  },
  {
    id: "proteines",
    num: "2",
    title: "Protéines & Masse",
    subtitle: "Construction Musculaire",
    description: "Whey isolate, concentré et gainers pour une synthèse protéique maximale et prise de masse.",
    dotColor: "#E56953",
    image: "/uploads/products/anabolic-whey-80-2-25kg-proactive-d1e70098.webp",
    href: "/whey-proteine",
  },
  {
    id: "boosters",
    num: "3",
    title: "Énergie & Boosters",
    subtitle: "Focus & Congestion",
    description: "Formules pré-workout dosées en caféine, bêta-alanine et citrulline pour repousser vos limites.",
    dotColor: "#782285",
    image: "/uploads/products/pre-workout-born-rage-original-eric-favre-2b562692.webp",
    href: "/pre-workout",
  },
  {
    id: "vitamines",
    num: "4",
    title: "Santé & Vitamines",
    subtitle: "Immunité & Équilibre",
    description: "Complexes multivitamines, Vitamine D3+K2, Magnésium et Zinc pour une vitalité quotidienne optimale.",
    dotColor: "#B52655",
    image: "/uploads/products/one-a-day-biotech-usa-635bcef6.webp",
    href: "/vitamines",
  },
  {
    id: "seche",
    num: "5",
    title: "Brûleurs & Sèche",
    subtitle: "Déstockage Métabolique",
    description: "L-Carnitine pure et thermogéniques haute performance pour accélérer la combustion des graisses.",
    dotColor: "#B89E16",
    image: "/uploads/products/lipo-6-black-ultra-concentrate-60caps-7abcdedc.webp",
    href: "/bruleurs-de-graisse",
  },
  {
    id: "recup",
    num: "6",
    title: "BCAA & Récupération",
    subtitle: "Acides Aminés Essentiels",
    description: "BCAA 2:1:1 et EAA pour freiner le catabolisme et accélérer la régénération post-entraînement.",
    dotColor: "#008080",
    image: "/uploads/products/xtend-bcaa-420g-f3c29f70.webp",
    href: "/bcaa",
  },
  {
    id: "accessoires",
    num: "7",
    title: "Accessoires & Shakers",
    subtitle: "Matériel & Équipement",
    description: "Shakers étanches, ceintures lombaires, sangles de tirage et gants pour vos entraînements.",
    dotColor: "#8B3B62",
    image: "/uploads/products/shaker-kong-700ml.webp",
    href: "/accessoires",
  },
];

export function HomeGammesGrid() {
  return (
    <section className="py-20 sm:py-24 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-xs uppercase tracking-widest text-[#8B3B62] font-extrabold">
          Sélection par Objectif
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-foreground mt-2 font-bold tracking-tight">
          Sept réponses ciblées à chaque besoin de votre corps
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mt-3 leading-relaxed">
          Chaque gamme ParaTunisie est identifiée par un code couleur officiel et concentre des actifs purs aux concentrations cliniquement validées.
        </p>
      </div>

      {/* 8 Cards Grid (2 rows of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {GAMMES.map((gamme) => (
          <Link
            key={gamme.id}
            href={gamme.href}
            className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-all duration-300 hover:shadow-xl hover:border-foreground/30 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: gamme.dotColor }}
                  />
                  <span className="text-xs uppercase tracking-widest font-bold text-foreground">
                    {gamme.num} {gamme.title}
                  </span>
                </div>
                <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  {gamme.subtitle}
                </span>
              </div>

              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white p-3 mb-3 border border-border/40">
                <Image
                  src={gamme.image}
                  alt={gamme.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {gamme.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground group-hover:text-[#8B3B62] transition-colors">
                Explorer {gamme.title.split("&")[0].trim()}
              </span>
              <ArrowRight
                size={14}
                className="text-muted-foreground group-hover:text-[#8B3B62] group-hover:translate-x-1 transition-all"
              />
            </div>
          </Link>
        ))}

        {/* 8th Card: Catalogue Complet (Dashed Outline) */}
        <Link
          href="/shop"
          className="group flex flex-col justify-between rounded-xl border-2 border-dashed border-border/90 bg-muted/20 p-6 transition-all duration-300 hover:border-[#8B3B62] hover:bg-[#8B3B62]/5 hover:shadow-lg"
        >
          <div>
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-[#8B3B62]">
              Catalogue Complet
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-3 tracking-tight">
              Tous nos compléments &amp; soins certifiés
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
              Découvrez l&apos;ensemble de nos 36 formules de pointe, grandes marques internationales et nouveautés en Tunisie.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground group-hover:text-[#8B3B62] transition-colors">
              Voir tout le catalogue
            </span>
            <ArrowRight
              size={15}
              className="text-[#8B3B62] group-hover:translate-x-1.5 transition-transform"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
