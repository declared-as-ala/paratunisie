import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, CreditCard } from "lucide-react";

import { HeroVisual } from "./hero-visual";

const REVEAL =
  "transition-[opacity,transform] duration-[var(--duration-large)] ease-[var(--ease-out-standard)] starting:opacity-0 starting:translate-y-3";

function HeroCopy({ mobileOverlay = false }: { mobileOverlay?: boolean }) {
  return (
    <div className={mobileOverlay ? "max-w-md" : "max-w-xl"}>
      <div
        className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
          mobileOverlay
            ? "border-white/25 bg-white/15 text-white"
            : "border-primary/15 bg-primary/10 text-primary"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            mobileOverlay ? "bg-brand-champagne" : "animate-pulse bg-primary"
          }`}
        />
        Le soin dermatologique en toute confiance
      </div>

      <h1
        className={`font-serif text-3xl font-medium leading-[1.08] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl ${
          mobileOverlay ? "text-white drop-shadow-sm" : "text-ink md:text-primary"
        } ${REVEAL}`}
      >
        Votre routine beauté
        <br className="hidden sm:inline" />
        {" "}commence par le{" "}
        <span
          className={`relative inline-block ${
            mobileOverlay ? "text-[#f2d7a8]" : "text-primary"
          }`}
        >
          bon conseil
          <span
            className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-brand-champagne"
            style={{
              animation: "heroShimmer 3s ease-in-out infinite",
              backgroundSize: "200% 100%",
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(200,164,107,0.8) 50%, transparent 100%)",
            }}
            aria-hidden="true"
          />
        </span>
        .
      </h1>

      <p
        className={`mt-4 max-w-lg text-sm leading-relaxed sm:text-base ${
          mobileOverlay ? "text-white/85" : "text-ink-muted"
        } delay-[80ms] ${REVEAL}`}
      >
        Découvrez une sélection experte de soins 100% authentiques, adaptés à votre peau, vos besoins et votre budget.
      </p>

      <div className={`mt-7 flex flex-col gap-3 sm:flex-row delay-[160ms] ${REVEAL}`}>
        <Link
          href="/shop"
          className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition-all duration-[var(--duration-standard)] active:scale-[0.97] ${
            mobileOverlay
              ? "bg-white text-primary shadow-lg shadow-black/10 hover:bg-soft-nude"
              : "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20"
          }`}
        >
          Découvrir tous les produits
          <ArrowRight
            className="size-4 transition-transform duration-[var(--duration-standard)] group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>

      {!mobileOverlay && (
        <div className={`mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-muted delay-[200ms] ${REVEAL}`}>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
            Produits 100% authentiques
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={15} className="shrink-0 text-emerald-600" />
            Livraison partout en Tunisie
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard size={15} className="shrink-0 text-emerald-600" />
            Paiement à la livraison
          </span>
        </div>
      )}
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="border-b border-border/50 bg-soft-nude/60">
      {/* Mobile: image-led hero with copy anchored safely near the bottom. */}
      <div className="p-3 sm:p-5 md:hidden">
        <div className="relative min-h-[42rem] w-full overflow-hidden rounded-[1.5rem] border border-border/70 bg-primary shadow-sm sm:min-h-[44rem]">
          <Image
            src="/assets/hero-cinematic-poster.webp"
            alt="Composition de soins dermatologiques ParaTunisie"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,35,38,0.02)_18%,rgba(43,35,38,0.18)_48%,rgba(43,35,38,0.88)_100%)]"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-7 pt-28 sm:px-8 sm:pb-9">
            <HeroCopy mobileOverlay />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-3 py-4 text-[0.6875rem] font-semibold text-ink-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            100% authentiques
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={14} className="text-emerald-600" />
            Livraison en Tunisie
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard size={14} className="text-emerald-600" />
            Paiement à la livraison
          </span>
        </div>
      </div>

      {/* Desktop view */}
      <div className="relative isolate hidden overflow-hidden py-12 md:block lg:py-20">
        <HeroVisual />
        <div className="relative z-10 mx-auto flex max-w-[1440px] items-center px-8 lg:px-12 xl:px-20">
          <HeroCopy />
        </div>
      </div>
    </section>
  );
}
