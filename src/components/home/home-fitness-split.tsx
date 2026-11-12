import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Dumbbell, Flame, Heart, Sparkles, Zap } from "lucide-react";

/**
 * Two-column fitness promotional and trust section directly matching the reference:
 * Left: "Objectifs Fitness ? On vous accompagne !" with athlete photo and 4 goals.
 * Right: "Pourquoi choisir ParaTunisie ?" with 5 verified selling points.
 */
export function HomeFitnessSplit() {
  return (
    <section aria-label="Nos objectifs fitness et engagements" className="bg-[#FAF7F5] py-6 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 sm:gap-5 items-stretch">
          
          {/* ── LEFT: Objectifs Fitness ? On vous accompagne ! ─────────── */}
          <div className="relative min-h-[360px] sm:min-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#5E203C] text-white p-5 sm:p-10 flex flex-col justify-between shadow-sm">
            {/* Background Athlete Image */}
            <div className="absolute inset-0 size-full overflow-hidden select-none">
              <Image
                src="/assets/fitness-athlete-shaker.webp"
                alt="Objectifs Fitness ParaTunisie"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-[70%_center] sm:object-[65%_center]"
              />
              {/* Dark Burgundy Gradient Overlay for Clean Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A122A] via-[#4A122A]/90 sm:via-[#4A122A]/70 to-[#4A122A]/20 sm:to-transparent" />
            </div>

            {/* Title */}
            <div className="relative z-10 max-w-md">
              <h3 className="font-serif text-xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Objectifs Fitness ?
                <span className="block italic font-normal text-lg sm:text-3xl text-white/95 mt-1">
                  On vous accompagne !
                </span>
              </h3>
            </div>

            {/* 4 Fitness Goals Pillars */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-4 sm:my-6 max-w-lg">
              <div className="flex flex-col items-start gap-1 p-2.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/15">
                <Dumbbell size={16} className="text-brand-champagne" />
                <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 leading-tight">Prise de masse</span>
              </div>

              <div className="flex flex-col items-start gap-1 p-2.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/15">
                <Zap size={16} className="text-amber-400" />
                <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 leading-tight">Sèche &amp; définition</span>
              </div>

              <div className="flex flex-col items-start gap-1 p-2.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/15">
                <Flame size={16} className="text-red-400" />
                <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 leading-tight">Énergie &amp; force</span>
              </div>

              <div className="flex flex-col items-start gap-1 p-2.5 rounded-xl bg-black/30 backdrop-blur-xs border border-white/15">
                <Heart size={16} className="text-emerald-400" />
                <span className="text-[11px] sm:text-xs font-bold text-white mt-0.5 leading-tight">Bien-être quotidien</span>
              </div>
            </div>

            {/* White Pill CTA */}
            <div className="relative z-10">
              <Link
                href="/conseils"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#5E203C] shadow-sm transition-all hover:bg-[#FAF7F5] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Découvrir nos guides</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Pourquoi choisir ParaTunisie ? ─────────────────── */}
          <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-white p-5 sm:p-10 flex flex-col justify-between shadow-2xs">
            {/* Top Header with Icon */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  Pourquoi choisir
                  <span className="block text-primary italic font-normal text-xl sm:text-2xl mt-0.5">
                    ParaTunisie ?
                  </span>
                </h3>
              </div>

              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <Sparkles size={22} />
              </span>
            </div>

            {/* 5 Verified Checkmarks */}
            <ul className="my-6 space-y-4">
              {[
                "Produits 100% authentiques",
                "Grand choix de marques internationales",
                "Livraison rapide partout en Tunisie",
                "Paiement à la livraison ou en ligne",
                "Conseils et guides d'experts",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-ink">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Bottom link */}
            <div className="pt-4 border-t border-border/60">
              <Link
                href="/authenticite"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                <span>En savoir plus sur notre charte d&apos;authenticité</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
