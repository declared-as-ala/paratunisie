"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

/**
 * Commercial hero:
 * - Center / Main Banner: Pack Anti-Stress (Primary) + Slide 2 (Sport)
 * - Right column: "À LA UNE SPORT" (Whey, Créatine, Performance)
 * - Mobile: Hero on top, followed directly by "À LA UNE SPORT" without any unnecessary tabs
 */
export function HomeHero({
  leftAside,
  rightAside,
  aside,
}: {
  leftAside?: React.ReactNode;
  rightAside?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const actualRightAside = rightAside || aside;

  const totalSlides = 2;

  const prevSlide = () => setCurrentSlide((s) => (s === 0 ? totalSlides - 1 : s - 1));
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % totalSlides);

  return (
    <section aria-label="Offres et nouveautés ParaTunisie" className="bg-[#FAF7F5] py-3 sm:py-5">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 ${
            actualRightAside ? "lg:grid-cols-[1fr_370px] xl:grid-cols-[1fr_400px]" : "grid-cols-1"
          } gap-4 sm:gap-5 items-stretch`}
        >
          {/* ── CENTER / MAIN COLUMN: Hero Carousel ────────────────────── */}
          <div className="relative min-h-[380px] sm:min-h-[500px] lg:min-h-[580px] rounded-3xl overflow-hidden shadow-lg border border-pink-100 flex flex-col justify-between group">
            {/* ── SLIDE 1: PACK ANTI-STRESS (DEFAULT) ── */}
            {currentSlide === 0 && (
              <div className="absolute inset-0 size-full overflow-hidden bg-gradient-to-r from-[#FFF5F7] via-[#FDE8ED] to-[#FCE3E9]">
                {/* Visual Banner Image */}
                <Image
                  src="/assets/hero-pack-anti-stress.webp"
                  alt="Pack Anti-Stress ParaTunisie — Magnésium B6 + Ashwagandha"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover object-center sm:object-[center_right] pointer-events-none select-none"
                />

                {/* Subtle soft gradient overlay on the left for maximum text contrast */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent sm:via-white/20"
                />

                {/* Clickable Overlay Link to Landing Page */}
                <Link
                  href="/pack-anti-stress"
                  className="absolute inset-0 z-10 block"
                  aria-label="Découvrir l'offre Pack Anti-Stress"
                />

                {/* Interactive CTA & Badge overlay positioned on top of the banner */}
                <div className="relative z-20 flex h-full flex-col justify-between p-4 sm:p-8 lg:p-10 pointer-events-none">
                  {/* Eyebrow Badge */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                      <Sparkles className="size-3.5 fill-white" />
                      NOUVEAU • ROUTINE BIEN-ÊTRE
                    </span>
                  </div>

                  {/* Headline and Benefits */}
                  <div className="max-w-xl my-auto space-y-2">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1E1B1D] tracking-tight leading-none drop-shadow-xs">
                      PACK <br />
                      <span className="text-[#E11D48]">ANTI-STRESS</span>
                    </h1>
                    <p className="text-xs sm:text-base font-extrabold text-[#7B2F52] leading-snug">
                      Retrouvez votre équilibre au quotidien
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-700 max-w-md hidden sm:block font-medium">
                      Magnésium + Vitamine B6 et Ashwagandha : deux compléments pour une vie plus calme et plus sereine.
                    </p>

                    {/* Prominent Pink Button */}
                    <div className="pt-2 sm:pt-4 pointer-events-auto">
                      <Link
                        href="/pack-anti-stress"
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:from-[#BE123C] hover:to-[#9F1239] text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 shadow-xl hover:shadow-2xl transition-all active:scale-95"
                      >
                        <span>Découvrir le Pack (159 DT)</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Bottom ratings note */}
                  <div className="pt-2">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      <span>Produits 100% originaux certifiés • Livraison 24-48h</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── SLIDE 2: ATHLETE / NUTRITION SPORTIVE ── */}
            {currentSlide === 1 && (
              <div className="absolute inset-0 size-full overflow-hidden bg-black text-white flex flex-col justify-between p-5 sm:p-8 lg:p-10">
                <Image
                  src="/assets/hero-fitness-athlete.webp"
                  alt="ParaTunisie — Nutrition Sportive"
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover object-[58%_center]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-black/45 backdrop-blur-md text-xs font-semibold">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    PARATUNISIE • NUTRITION SPORTIVE
                  </span>
                </div>

                <div className="relative z-10 max-w-xl my-auto py-4">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                    Performance &amp; Récupération
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-white/85">
                    Découvrez notre gamme complète de Whey, Créatines, Gainers et Acides Aminés certifiés.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/creatine"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-5 py-3 shadow-lg"
                    >
                      <Zap className="size-4 text-amber-300" />
                      <span>Créatine Tunisie</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-black/40 hover:bg-white/10 text-white font-bold text-xs sm:text-sm px-4 py-3"
                    >
                      <span>Tous les produits</span>
                    </Link>
                  </div>
                </div>

                <div className="relative z-10 pt-2 border-t border-white/15 text-xs text-white/80">
                  <span>Livraison partout en Tunisie sous 24-48h • Paiement à la livraison</span>
                </div>
              </div>
            )}

            {/* Slider Navigation Arrows */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Diapositive précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white transition-all cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Diapositive suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white transition-all cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
              {[0, 1].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Aller au slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? "w-6 bg-[#E11D48]" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── DESKTOP RIGHT COLUMN: "À LA UNE SPORT" ───────────────── */}
          {actualRightAside && (
            <aside className="hidden lg:flex w-full flex-col" aria-label="Produit du moment nutrition sportive">
              {actualRightAside}
            </aside>
          )}
        </div>

        {/* ── MOBILE: "À LA UNE SPORT" DIRECTLY BELOW HERO ───────────── */}
        {actualRightAside && (
          <div className="block lg:hidden mt-4">
            <div className="w-full">
              {actualRightAside}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
