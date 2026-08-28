"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, CreditCard, Sparkles, ChevronDown, Zap } from "lucide-react";

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, [prefersReducedMotion]);

  const scrollToContent = () => {
    const target = document.getElementById("homepage-content");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      data-testid="cinematic-hero"
      className="relative w-full min-h-[88vh] sm:min-h-[94vh] flex items-end overflow-hidden bg-black text-white"
    >
      {/* ── 1. Hero Background Video & Poster ──────────────────────────── */}
      <div className="absolute inset-0 size-full overflow-hidden select-none">
        {/* Base Poster Image */}
        <Image
          src="/assets/hero-poster.webp"
          alt="ParaTunisie — Parapharmacie et Nutrition sportive en Tunisie"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] sm:object-[56%_center] lg:object-[58%_center] transition-opacity duration-700"
        />

        {/* HTML5 Autoplay Video */}
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/hero-poster.webp"
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-[58%_center] sm:object-[56%_center] lg:object-[58%_center] pointer-events-none"
          >
            <source src="/assets/hero-video-optimized.mp4" type="video/mp4" />
            <source
              src="/assets/hf_20260826_190907_af0b25d6-4401-4b39-8132-c86ed8c156f1.mp4"
              type="video/mp4"
            />
          </video>
        )}
      </div>

      {/* ── 2. Cinematic Luxury Gradient Overlays (IOMA Paris Style) ─────── */}
      {/* Lightened overlays — show more of the video */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_30%,rgba(0,0,0,0.35)_85%)]"
      />

      {/* ── 3. Foreground Content (Anchored Bottom-Left) ────────────────── */}
      <div className="relative mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12 pb-14 sm:pb-20 pt-28 sm:pt-36 z-10">
        <div className="max-w-3xl">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium mb-4">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span>ParaTunisie — Parapharmacie en Ligne en Tunisie</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.85)]">
            Votre Parapharmacie en Ligne
            <br />
            <span className="text-white font-normal italic">en Tunisie.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-white/90 font-light drop-shadow-md">
            Parapharmacie en ligne de référence en Tunisie : compléments alimentaires certifiés, créatine, whey protéine, ashwagandha, vitamines et soins 100% authentiques avec livraison rapide à domicile.
          </p>

          {/* Dual CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
            {/* Primary CTA */}
            <Link
              href="/shop"
              className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-[#8B3B62] hover:bg-[#a64775] text-white uppercase tracking-widest font-semibold shadow-[0_4px_25px_rgba(139,59,98,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] px-6 py-3.5 text-xs sm:text-sm gap-2"
            >
              <Sparkles size={16} className="text-white" />
              <span>Découvrir nos produits</span>
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/creatine"
              className="group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-white/40 bg-black/40 backdrop-blur-sm text-white uppercase tracking-widest hover:bg-white/20 hover:text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] px-6 py-3.5 text-xs sm:text-sm gap-2"
            >
              <Zap size={15} className="text-brand-champagne" />
              <span>Nutrition sportive</span>
            </Link>
          </div>

          {/* Trust Strip */}
          <div className="mt-10 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl text-xs text-white/85">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>100% Authentiques</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-emerald-400 shrink-0" />
              <span>Livraison 24-48h Tunisie</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-400 shrink-0" />
              <span>Paiement à la livraison</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Scroll Down Floating Indicator (Bottom-Right) ───────────── */}
      <button
        type="button"
        onClick={scrollToContent}
        aria-label="Découvrir les compléments et soins"
        className="absolute bottom-5 end-4 sm:end-12 z-20 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors cursor-pointer group"
      >
        <span className="hidden sm:inline font-medium">Découvrir les soins</span>
        <div className="size-8 rounded-full border border-white/25 bg-white/10 flex items-center justify-center group-hover:border-white/50 group-hover:bg-white/20 transition-all shadow-sm">
          <ChevronDown size={16} className="text-white group-hover:translate-y-0.5 transition-transform" />
        </div>
      </button>
    </section>
  );
}
