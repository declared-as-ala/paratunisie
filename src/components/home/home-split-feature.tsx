"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";

interface SplitProduct {
  name: string;
  subtitle: string;
  price: string;
  image: string;
  href: string;
}

const FEATURED_PRODUCTS: SplitProduct[] = [
  {
    name: "Micronised Creatine",
    subtitle: "Optimum Nutrition • 317g",
    price: "179.000 DT",
    image: "/uploads/products/micronised-creatine-optimum-nutrition-317g-b84738f3.webp",
    href: "/produits/micronised-creatine-optimum-nutrition-317g",
  },
  {
    name: "Anabolic Whey 80",
    subtitle: "ProActive • 2.25kg",
    price: "259.000 DT",
    image: "/uploads/products/anabolic-whey-80-2-25kg-proactive-d1e70098.webp",
    href: "/produits/anabolic-whey-80-2-25kg-proactive",
  },
  {
    name: "One-A-Day Vitamines",
    subtitle: "BioTechUSA • 100 Tabs",
    price: "109.000 DT",
    image: "/uploads/products/one-a-day-biotech-usa-635bcef6.webp",
    href: "/produits/one-a-day-biotech-usa",
  },
  {
    name: "Lipo-6 Black Ultra",
    subtitle: "Nutrex Research • 60 Caps",
    price: "140.000 DT",
    image: "/uploads/products/lipo-6-black-ultra-concentrate-60caps-7abcdedc.webp",
    href: "/produits/lipo-6-black-ultra-concentrate-60caps",
  },
];

const ADVANTAGES = [
  "Plus de 36 formules certifiées 100% authentiques et pures",
  "Dosage micrométrique des principes actifs brevetés",
  "Sélection rigoureuse des plus grands laboratoires internationaux",
  "Conseils personnalisés par nos pharmaciens et préparateurs",
];

export function HomeSplitFeature() {
  return (
    <section className="bg-gradient-to-b from-[#FAF7F5]/80 via-white to-background py-20 sm:py-24 border-y border-border/70">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Brand Story & Bullet Points (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B3B62]/10 text-[#8B3B62] text-xs font-semibold uppercase tracking-widest">
              <Sparkles size={14} />
              <span>Expertise &amp; Performance</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-foreground tracking-tight leading-tight">
              La science de votre corps,{" "}
              <br className="hidden sm:inline" />
              <span className="font-serif italic text-[#8B3B62]">et d&apos;aucune autre.</span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Sélectionnés par des professionnels de la santé et du sport en Tunisie, nos soins et compléments combinent des principes actifs purs hautement dosés pour répondre exactement aux exigences de votre métabolisme.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-foreground/90 pt-1">
              {ADVANTAGES.map((adv) => (
                <li key={adv} className="flex items-center gap-2.5">
                  <span className="size-4 rounded-full bg-[#8B3B62]/15 text-[#8B3B62] flex items-center justify-center shrink-0">
                    <Check size={11} className="stroke-[3]" />
                  </span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-3.5">
              <Link
                href="/shop"
                className="group/button inline-flex shrink-0 items-center justify-center rounded-lg bg-[#8B3B62] hover:bg-[#a64775] text-white uppercase tracking-widest text-xs font-semibold px-6 py-3.5 shadow-md gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Découvrir le catalogue</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Curated Product Cards Grid (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURED_PRODUCTS.map((prod) => (
              <Link
                key={prod.name}
                href={prod.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border/80 bg-card hover:border-[#8B3B62]/50 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white p-2 mb-3">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-[#8B3B62] transition-colors line-clamp-1">
                    {prod.name}
                  </h4>
                  <p className="text-[0.6875rem] text-muted-foreground mt-0.5 line-clamp-1">
                    {prod.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[0.75rem] font-bold text-primary">{prod.price}</span>
                  <ArrowRight size={13} className="text-muted-foreground group-hover:text-[#8B3B62] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
