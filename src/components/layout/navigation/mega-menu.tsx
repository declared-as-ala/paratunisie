"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Dumbbell,
  HeartPulse,
  Activity,
  Layers,
} from "lucide-react";
import { formatPrice } from "@/lib/data/products";

export interface FeaturedProductCard {
  id: string;
  name: string;
  brand: string;
  slug: string;
  benefit: string;
  priceMillimes: number;
  image: string;
}

export interface MegaMenuSection {
  id: string;
  label: string;
  href: string;
  type: "curated" | "products-grid";
  // For editorial side (Left col)
  editorial?: {
    eyebrow: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  // For multi-column links (Center col)
  groups?: {
    title: string;
    items: {
      name: string;
      slug: string;
      icon?: string;
      badge?: string;
    }[];
  }[];
  // Featured products (Right col or Grid)
  featuredProducts?: FeaturedProductCard[];
  // Featured single hero product (Right col in curated layout)
  heroProduct?: {
    badge: string;
    product: FeaturedProductCard;
  };
}

export const MEGA_MENU_DATA: MegaMenuSection[] = [
  {
    id: "categories",
    label: "Nos Catégories",
    href: "/shop",
    type: "curated",
    editorial: {
      eyebrow: "NUTRITION HAUTE PERFORMANCE",
      title: "Nos Catégories",
      description:
        "Compléments alimentaires et nutrition sportive 100% authentiques en Tunisie. Formules pures pour la force, le muscle, l'énergie et la vitalité.",
      ctaLabel: "Diagnostic Nutritionnel",
      ctaHref: "/diagnostic",
    },
    groups: [
      {
        title: "VOS OBJECTIFS",
        items: [
          { name: "Force & Volume Musculaire", slug: "creatine", badge: "Populaire" },
          { name: "Prise de Masse & Anabolisme", slug: "gainers-proteines" },
          { name: "Énergie Explosive & Focus", slug: "pre-workout", badge: "Booster" },
          { name: "Récupération & Anti-Catabolisme", slug: "bcaa" },
          { name: "Sèche & Brûleurs de Graisse", slug: "l-carnitine" },
          { name: "Vitalité, Zinc & Immunité", slug: "vitamines" },
          { name: "Anti-Stress & Sommeil", slug: "ashwagandha" },
        ],
      },
      {
        title: "NOS GAMMES",
        items: [
          { name: "Créatine Monohydrate", slug: "creatine" },
          { name: "Whey Protéine & Gainers", slug: "whey-proteine" },
          { name: "Pre-Workout & Boosters", slug: "pre-workout" },
          { name: "BCAA, EAA & Acides Aminés", slug: "bcaa" },
          { name: "Vitamines C, D3+K2 & Complexes", slug: "vitamines" },
          { name: "Zinc Chélaté & Magnésium B6", slug: "zinc" },
          { name: "Ashwagandha & Sommeil", slug: "ashwagandha", badge: "Tendance" },
          { name: "L-Carnitine & Fat Burners", slug: "l-carnitine" },
          { name: "Accessoires & Shakers", slug: "accessoires", badge: "Nouveau" },
        ],
      },
    ],
    heroProduct: {
      badge: "COUP DE CŒUR ICONIQUE",
      product: {
        id: "p02",
        name: "Micronised Creatine",
        brand: "Optimum Nutrition",
        slug: "micronised-creatine-optimum-nutrition-317g",
        benefit: "La référence mondiale en créatine pure pour le gain de force et de volume.",
        priceMillimes: 179000,
        image: "/uploads/products/micronised-creatine-optimum-nutrition-317g-b84738f3.webp",
      },
    },
  },
  {
    id: "creatine",
    label: "Créatine & Force",
    href: "/creatine",
    type: "products-grid",
    editorial: {
      eyebrow: "FORCE & PUISSANCE",
      title: "Créatine Pure",
      description:
        "Créatines monohydrates micronisées 100% pures pour maximiser l'explosivité, la force intra-cellulaire et la récupération musculaire.",
      ctaLabel: "Voir toutes les créatines",
      ctaHref: "/creatine",
    },
    featuredProducts: [
      {
        id: "p01",
        name: "Creatine Monohydrate 500g",
        brand: "OstroVit",
        slug: "creatine-monohydrate-ostrovit-500gr",
        benefit: "Pureté maximale, format économique 500g.",
        priceMillimes: 149000,
        image: "/uploads/products/creatine-monohydrate-ostrovit-500gr-73fe18fd.webp",
      },
      {
        id: "p02",
        name: "Micronised Creatine 317g",
        brand: "Optimum Nutrition",
        slug: "micronised-creatine-optimum-nutrition-317g",
        benefit: "Standard mondial, micro-particules ultra solubles.",
        priceMillimes: 179000,
        image: "/uploads/products/micronised-creatine-optimum-nutrition-317g-b84738f3.webp",
      },
      {
        id: "p06",
        name: "100% Creatine Monohydrate 300g",
        brand: "BioTechUSA",
        slug: "100-creatine-monohydrate-300g-biotech-usa",
        benefit: "Sans arôme, grade pharmaceutique européen.",
        priceMillimes: 129000,
        image: "/uploads/products/100-creatine-monohydrate-300g-biotech-usa-eca8075b.webp",
      },
      {
        id: "p04",
        name: "Créatine Pure 300g",
        brand: "Real Pharm",
        slug: "creatine-real-pharm-300g",
        benefit: "Concentration maximale sans additifs.",
        priceMillimes: 99000,
        image: "/uploads/products/creatine-real-pharm-300g-f2ec3b61.webp",
      },
    ],
  },
  {
    id: "proteines",
    label: "Protéines & Masse",
    href: "/whey-proteine",
    type: "products-grid",
    editorial: {
      eyebrow: "DÉVELOPPEMENT MUSCULAIRE",
      title: "Protéines & Gainers",
      description:
        "Protéines pures et gainers hypercaloriques pour accélérer la synthèse protéique, réparer vos fibres et bâtir du muscle sec.",
      ctaLabel: "Voir toutes les protéines",
      ctaHref: "/whey-proteine",
    },
    featuredProducts: [
      {
        id: "p28",
        name: "Anabolic Whey 80 2.25kg",
        brand: "ProActive",
        slug: "anabolic-whey-80-2-25kg-proactive",
        benefit: "80% de protéines, profil d'acides aminés complet.",
        priceMillimes: 289000,
        image: "/uploads/products/anabolic-whey-80-2-25kg-proactive-d1e70098.webp",
      },
      {
        id: "p29",
        name: "Thunder Gainer 5.4kg",
        brand: "Challenger Nutrition",
        slug: "thunder-gainer-5-4kg-challenger-nutrition",
        benefit: "Prise de masse rapide, formule haute teneur calorique.",
        priceMillimes: 319000,
        image: "/uploads/products/thunder-gainer-5-4kg-challenger-nutrition-20b49293.webp",
      },
      {
        id: "p31",
        name: "Xtend BCAA 420g",
        brand: "Xtend",
        slug: "xtend-bcaa-420g",
        benefit: "7g de BCAA 2:1:1 + électrolytes d'hydratation.",
        priceMillimes: 159000,
        image: "/uploads/products/xtend-bcaa-420g-f3c29f70.webp",
      },
      {
        id: "p33",
        name: "EAA Master Amino 390g",
        brand: "Scenit Nutrition",
        slug: "eaa-master-amino-390g-scenit-nutrition",
        benefit: "9 acides aminés essentiels pour l'anti-catabolisme.",
        priceMillimes: 139000,
        image: "/uploads/products/eaa-master-amino-390g-scenit-nutrition-21d315c0.webp",
      },
    ],
  },
  {
    id: "energie",
    label: "Énergie & Boosters",
    href: "/pre-workout",
    type: "products-grid",
    editorial: {
      eyebrow: "EXPLOSIVITÉ & INTENSITÉ",
      title: "Pre-Workout & Sèche",
      description:
        "Formules d'avant-entraînement intenses pour décupler votre focus mental, votre vasodilatation et stimuler la combustion calorique.",
      ctaLabel: "Voir tous les boosters",
      ctaHref: "/pre-workout",
    },
    featuredProducts: [
      {
        id: "p08",
        name: "Pre-Workout Born Rage",
        brand: "Eric Favre",
        slug: "pre-workout-born-rage-original-eric-favre",
        benefit: "Congestion explosive, énergie sans crash post-séance.",
        priceMillimes: 149000,
        image: "/uploads/products/pre-workout-born-rage-original-eric-favre-2b562692.webp",
      },
      {
        id: "p10",
        name: "Psychotic Pre-Workout",
        brand: "Insane Labz",
        slug: "psychotic-pre-workout",
        benefit: "Booster surpuissant pour séances haute intensité.",
        priceMillimes: 169000,
        image: "/uploads/products/psychotic-pre-workout-c7dabc0f.webp",
      },
      {
        id: "p36",
        name: "Lipo-6 Black Ultra Concentrate",
        brand: "Nutrex Research",
        slug: "lipo-6-black-ultra-concentrate-60caps",
        benefit: "Thermogénique ultra-concentré pour la sèche.",
        priceMillimes: 140000,
        image: "/uploads/products/lipo-6-black-ultra-concentrate-60caps-7abcdedc.webp",
      },
      {
        id: "p34",
        name: "Gold L-Carnitine 3000 500ml",
        brand: "FA Engineered Nutrition",
        slug: "gold-l-carnitine-3000-500ml",
        benefit: "Transport des graisses et endurance lipidique.",
        priceMillimes: 99000,
        image: "/uploads/products/gold-l-carnitine-3000-500ml-f9c4c91a.webp",
      },
    ],
  },
  {
    id: "sante",
    label: "Santé & Vitamines",
    href: "/vitamines",
    type: "products-grid",
    editorial: {
      eyebrow: "SANTÉ & VITALITÉ",
      title: "Vitamines & Minéraux",
      description:
        "Micronutriments essentiels hautement assimilables pour renforcer votre système immunitaire, vos articulations et votre récupération.",
      ctaLabel: "Voir toutes les vitamines",
      ctaHref: "/vitamines",
    },
    featuredProducts: [
      {
        id: "p23",
        name: "One-A-Day Multivitamines 100 Tabs",
        brand: "BioTechUSA",
        slug: "one-a-day-biotech-usa",
        benefit: "12 vitamines & 10 minéraux pour la vitalité quotidienne.",
        priceMillimes: 79000,
        image: "/uploads/products/one-a-day-biotech-usa-635bcef6.webp",
      },
      {
        id: "p20",
        name: "Vitamine D3 + K2 Vegan 365 Tabs",
        brand: "WeightWorld",
        slug: "vegan-vitamin-d3-k2-365-tablets-weightworld",
        benefit: "Fixation du calcium et capital osseux renforcé.",
        priceMillimes: 89000,
        image: "/uploads/products/vegan-vitamin-d3-k2-365-tablets-weightworld-f4276b19.webp",
      },
      {
        id: "p13",
        name: "Zinc Duo 60 Gélules",
        brand: "BioTechUSA",
        slug: "zinc-duo-biotech-usa-60-capsules",
        benefit: "Soutien immunitaire & synthèse de testostérone.",
        priceMillimes: 49000,
        image: "/uploads/products/zinc-duo-biotech-usa-60-capsules-73f31972.webp",
      },
      {
        id: "p24",
        name: "Vitamine C 1000 mg 110 Tabs",
        brand: "OstroVit",
        slug: "vitamin-c-110-tabs-ostrovit",
        benefit: "Défense immunitaire puissante & antioxydant.",
        priceMillimes: 49000,
        image: "/uploads/products/vitamin-c-110-tabs-ostrovit-77c8e6df.webp",
      },
    ],
  },
  {
    id: "ashwagandha",
    label: "Ashwagandha",
    href: "/ashwagandha",
    type: "products-grid",
    editorial: {
      eyebrow: "BIEN-ÊTRE & ANTI-STRESS",
      title: "Ashwagandha Pure",
      description:
        "Plante adaptogène premium (Withania Somnifera) titrée en withanolides pour réguler le cortisol, réduire le stress, optimiser le sommeil et soutenir la vitalité.",
      ctaLabel: "Voir tout l'Ashwagandha",
      ctaHref: "/ashwagandha",
    },
    featuredProducts: [
      {
        id: "p25",
        name: "Ashwagandha 60 Gélules",
        brand: "BioTechUSA",
        slug: "ashwagandha-60-gelules-biotech-usa",
        benefit: "Extrait standardisé de racine d'Ashwagandha.",
        priceMillimes: 95000,
        image: "/uploads/products/ashwagandha-60-gelules-biotech-usa-471eea81.webp",
      },
      {
        id: "p26",
        name: "Ashwagandha 100% Natural 90 Tabs",
        brand: "Real Pharm",
        slug: "ashwagandha-100-natural-90tabs",
        benefit: "Formule pure 100% naturelle haute concentration.",
        priceMillimes: 89000,
        image: "/uploads/products/ashwagandha-100-natural-90tabs-8d2183dc.webp",
      },
    ],
  },
  {
    id: "accessoires",
    label: "Accessoires",
    href: "/accessoires",
    type: "products-grid",
    editorial: {
      eyebrow: "ÉQUIPEMENT & MATÉRIEL",
      title: "Accessoires Musculation",
      description:
        "Shakers sans BPA, gants de musculation, ceintures lombaires professionnelles et sangles de tirage pour optimiser vos performances à la salle.",
      ctaLabel: "Voir tout l'équipement",
      ctaHref: "/accessoires",
    },
    featuredProducts: [
      {
        id: "acc_1",
        name: "Protein Shaker 450ml",
        brand: "Sport Life",
        slug: "protein-shaker-450ml-sport-life",
        benefit: "Anti-fuite, boule mélangeuse inox, sans BPA.",
        priceMillimes: 35000,
        image: "/uploads/products/protein-shaker-450ml-sport-life.webp",
      },
      {
        id: "acc_7",
        name: "Gants de Musculation",
        brand: "Kong Sport Nutrition",
        slug: "gants-de-musculation",
        benefit: "Grip optimal, protection paumes, ventilation.",
        priceMillimes: 49000,
        image: "/uploads/products/gants-de-musculation.webp",
      },
      {
        id: "acc_9",
        name: "Ceinture Lombaire Gold's Gym",
        brand: "Gold's Gym",
        slug: "ceinture-dos-gold-s-gym",
        benefit: "Cuir véritable, soutien pro pour squat et deadlift.",
        priceMillimes: 129000,
        image: "/uploads/products/ceinture-dos-gold-s-gym.webp",
      },
      {
        id: "acc_3",
        name: "Lifting Straps",
        brand: "Kong Sport Nutrition",
        slug: "lifting-straps",
        benefit: "Grip renforcé pour tirage lourd et soulevé de terre.",
        priceMillimes: 35000,
        image: "/uploads/products/lifting-straps.webp",
      },
    ],
  },
];

export function MegaMenu() {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeSection = MEGA_MENU_DATA.find((s) => s.id === activeSectionId);

  const handleMouseEnter = (id: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSectionId(id);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setActiveSectionId(null);
    }, 150);
  };

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveSectionId(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center gap-0.5 text-xs font-bold text-ink"
    >
      {/* ── Top Level Navigation Links ─────────────────────────────────── */}
      <Link
        href="/"
        className="px-3.5 py-2 rounded-lg transition-colors hover:bg-white hover:text-primary text-ink/90"
      >
        Accueil
      </Link>

      {MEGA_MENU_DATA.map((section) => {
        const isOpen = activeSectionId === section.id;
        return (
          <div
            key={section.id}
            onMouseEnter={() => handleMouseEnter(section.id)}
            className="relative"
          >
            <Link
              href={section.href}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all ${
                isOpen
                  ? "bg-white text-primary shadow-2xs font-extrabold"
                  : "text-ink/85 hover:bg-white/80 hover:text-primary"
              }`}
            >
              <span>{section.label}</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 opacity-60 ${
                  isOpen ? "rotate-180 text-primary opacity-100" : ""
                }`}
              />
            </Link>
          </div>
        );
      })}

      <Link
        href="/marques"
        className="px-3.5 py-2 rounded-lg transition-colors hover:bg-white hover:text-primary text-ink/90"
      >
        Marques
      </Link>

      <Link
        href="/accessoires"
        className="px-3.5 py-2 rounded-lg transition-colors hover:bg-white hover:text-primary text-ink/90 flex items-center gap-1"
      >
        Accessoires
        <span className="ml-1 text-[0.6rem] font-extrabold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
          Nouveau
        </span>
      </Link>

      <Link
        href="/conseils"
        className="px-3.5 py-2 rounded-lg transition-colors hover:bg-white hover:text-primary text-ink/90"
      >
        Conseils
      </Link>

      {/* ── Mega Menu Floating Dropdown Panel ───────────────────────── */}
      {activeSection && (
        <div
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-[96vw] max-w-[1240px] rounded-3xl border border-border/80 bg-white/98 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(43,35,38,0.12)] z-50 animate-in fade-in zoom-in-98 duration-150"
        >
          {/* ── LAYOUT 1: Curated 3-Column ("Nos Catégories") ─────────────── */}
          {activeSection.type === "curated" && (
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.8fr_1.1fr] gap-8 items-start">
              {/* Left Column: Editorial & Diagnostic CTA */}
              <div className="flex flex-col justify-between h-full space-y-4 border-b md:border-b-0 md:border-r border-border/70 pr-0 md:pr-6 pb-6 md:pb-0">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
                    <Sparkles size={11} className="text-primary" />
                    <span>{activeSection.editorial?.eyebrow}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-tight">
                    {activeSection.editorial?.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {activeSection.editorial?.description}
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    href={activeSection.editorial?.ctaHref || "/diagnostic"}
                    onClick={() => setActiveSectionId(null)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-primary-hover active:scale-98 transition-all"
                  >
                    <span>{activeSection.editorial?.ctaLabel}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Center Columns: Groups / Goals & Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activeSection.groups?.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h4 className="text-[0.6875rem] font-extrabold tracking-wider text-primary uppercase">
                      {group.title}
                    </h4>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <Link
                            href={`/${item.slug}`}
                            onClick={() => setActiveSectionId(null)}
                            className="group flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-soft-nude/80 transition-colors"
                          >
                            <span className="text-xs font-medium text-ink group-hover:text-primary transition-colors">
                              {item.name}
                            </span>
                            {item.badge ? (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-primary">
                                {item.badge}
                              </span>
                            ) : (
                              <ArrowRight
                                size={12}
                                className="text-ink-muted/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100"
                              />
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="sm:col-span-2 pt-2 border-t border-border/50">
                  <Link
                    href="/shop"
                    onClick={() => setActiveSectionId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline"
                  >
                    <span>Voir tout le catalogue (36 compléments alimentaires)</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Featured Hero Product */}
              {activeSection.heroProduct && (
                <div className="border-t md:border-t-0 md:border-l border-border/70 pl-0 md:pl-6 pt-6 md:pt-0">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-primary">
                      {activeSection.heroProduct.badge}
                    </span>
                  </div>

                  <Link
                    href={`/produits/${activeSection.heroProduct.product.slug}`}
                    onClick={() => setActiveSectionId(null)}
                    className="group block rounded-2xl border border-border/70 bg-soft-nude/20 p-4 hover:border-primary/40 hover:bg-soft-nude/40 transition-all shadow-2xs"
                  >
                    <div className="aspect-square w-full rounded-xl bg-white p-3 flex items-center justify-center border border-border/40 overflow-hidden mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeSection.heroProduct.product.image}
                        alt={activeSection.heroProduct.product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[0.625rem] font-extrabold uppercase tracking-wider text-primary">
                      {activeSection.heroProduct.product.brand}
                    </p>
                    <h5 className="text-xs font-bold text-ink group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
                      {activeSection.heroProduct.product.name}
                    </h5>
                    <p className="text-[0.6875rem] text-ink-muted line-clamp-2 mt-1 leading-4">
                      {activeSection.heroProduct.product.benefit}
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="font-tabular text-xs font-extrabold text-ink">
                        {formatPrice(activeSection.heroProduct.product.priceMillimes)}
                      </span>
                      <span className="text-[0.6875rem] font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Découvrir <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── LAYOUT 2: Products Grid (Editorial + 4 Featured Cards) ─────── */}
          {activeSection.type === "products-grid" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_3.5fr] gap-8 items-start">
              {/* Left Column: Editorial & Category Link */}
              <div className="flex flex-col justify-between h-full space-y-4 border-b lg:border-b-0 lg:border-r border-border/70 pr-0 lg:pr-6 pb-6 lg:pb-0">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
                    <Zap size={11} className="text-primary" />
                    <span>{activeSection.editorial?.eyebrow}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-tight">
                    {activeSection.editorial?.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {activeSection.editorial?.description}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={activeSection.editorial?.ctaHref || activeSection.href}
                    onClick={() => setActiveSectionId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <span>{activeSection.editorial?.ctaLabel}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Right Column: 4 Real Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {activeSection.featuredProducts?.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produits/${product.slug}`}
                    onClick={() => setActiveSectionId(null)}
                    className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-white p-3 hover:border-primary/40 hover:shadow-md transition-all shadow-2xs"
                  >
                    <div>
                      <div className="aspect-square w-full rounded-xl bg-soft-nude/20 p-2.5 flex items-center justify-center border border-border/40 overflow-hidden mb-2.5 group-hover:bg-soft-nude/40 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-[0.58rem] font-extrabold uppercase tracking-wider text-primary truncate">
                        {product.brand}
                      </p>
                      <h5 className="text-xs font-bold text-ink group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
                        {product.name}
                      </h5>
                      <p className="text-[0.65rem] text-ink-muted line-clamp-2 mt-1 leading-tight">
                        {product.benefit}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="font-tabular text-xs font-extrabold text-ink">
                        {formatPrice(product.priceMillimes)}
                      </span>
                      <span className="text-primary group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
