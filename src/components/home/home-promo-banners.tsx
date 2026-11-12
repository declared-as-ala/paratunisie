import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * 3 Category Promotional Banners directly matching the reference image:
 * 1. Whey Protéine (dark wine / black theme)
 * 2. Créatine (clean light silver theme)
 * 3. Vitamines & Minéraux (deep burgundy theme)
 */
export function HomePromoBanners() {
  return (
    <section aria-label="Sélections et promotions vedettes" className="bg-[#FAF7F5] py-3 sm:py-6">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">

          {/* ── Banner 1: Whey Protéine ─────────────────────────────────── */}
          <Link
            href="/whey-proteine"
            className="group relative h-40 sm:h-56 lg:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-black text-white p-5 sm:p-7 flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
          >
            {/* Background Image */}
            <Image
              src="/assets/hero-split-whey.webp"
              alt="Whey Protéine en Tunisie"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/15 sm:to-transparent" />

            {/* Content */}
            <div className="relative z-10 max-w-[70%] sm:max-w-[65%]">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                Whey Protéine
              </h3>
              <p className="mt-1 font-serif italic text-xs sm:text-sm text-white/90">
                Pour de meilleurs résultats
              </p>
            </div>

            {/* Pill CTA Button */}
            <div className="relative z-10 mt-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-ink shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                <span>Voir la sélection</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* ── Banner 2: Créatine ───────────────────────────────────────── */}
          <Link
            href="/creatine"
            className="group relative h-40 sm:h-56 lg:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F5F7] to-[#E8E8ED] text-ink p-5 sm:p-7 flex flex-col justify-between border border-border/60 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
          >
            {/* Background Image */}
            <Image
              src="/assets/hero-split-creatine.webp"
              alt="Créatine Monohydrate en Tunisie"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/15 sm:to-transparent" />

            {/* Content */}
            <div className="relative z-10 max-w-[70%] sm:max-w-[65%]">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink leading-tight">
                Créatine
              </h3>
              <p className="mt-1 font-serif italic text-xs sm:text-sm text-ink-muted">
                Force &amp; Performance
              </p>
            </div>

            {/* Pill CTA Button */}
            <div className="relative z-10 mt-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-sm transition-all group-hover:bg-primary-hover">
                <span>Voir la sélection</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* ── Banner 3: Vitamines & Minéraux ──────────────────────────── */}
          <Link
            href="/vitamines"
            className="group relative h-40 sm:h-56 lg:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#5E203C] text-white p-5 sm:p-7 flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
          >
            {/* Background Image */}
            <Image
              src="/assets/hero-split-vitamines.webp"
              alt="Vitamines & Minéraux en Tunisie"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-right group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#5E203C]/95 via-[#5E203C]/85 to-[#5E203C]/15 sm:to-transparent" />

            {/* Content */}
            <div className="relative z-10 max-w-[70%] sm:max-w-[65%]">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                Vitamines &amp; Minéraux
              </h3>
              <p className="mt-1 font-serif italic text-xs sm:text-sm text-white/90">
                Pour votre bien-être quotidien
              </p>
            </div>

            {/* Pill CTA Button */}
            <div className="relative z-10 mt-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-[#5E203C] shadow-sm transition-all group-hover:bg-[#FAF7F5]">
                <span>Voir la sélection</span>
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
