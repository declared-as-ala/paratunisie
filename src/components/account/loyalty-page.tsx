"use client";

import Link from "next/link";
import { Crown, Gift, Star, Truck, Percent } from "lucide-react";

const TIERS = [
  { name: "Bronze", min: 0, color: "bg-amber-700", benefits: ["1 point par 1 DT", "Livraison offerte dès 150 DT"] },
  { name: "Argent", min: 500, color: "bg-gray-400", benefits: ["1.5 points par 1 DT", "Livraison offerte dès 120 DT", "Offre anniversaire"] },
  { name: "Or", min: 1500, color: "bg-brand-champagne", benefits: ["2 points par 1 DT", "Livraison offerte dès 99 DT", "Offre anniversaire", "Accès anticipé aux soldes"] },
];

const WAYS_TO_EARN = [
  { icon: Truck, label: "Commander", description: "1 point par 1 DT dépensé" },
  { icon: Star, label: "Avis vérifié", description: "+25 points par avis" },
  { icon: Gift, label: "Parrainer un ami", description: "+100 points par parrainage" },
  { icon: Percent, label: "Offres spéciales", description: "Points doublés sur sélection" },
];

export function LoyaltyPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
      <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-muted sm:text-sm">
        <ol className="flex items-center gap-1.5 sm:gap-2">
          <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
          <li aria-hidden className="text-ink-muted/50">/</li>
          <li aria-current="page" className="text-ink">Le Cercle ParaTunisie</li>
        </ol>
      </nav>

      <header className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-champagne/20">
          <Crown className="size-8 text-brand-champagne" aria-hidden />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-sm">
          Le Cercle ParaTunisie
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Votre fidélité, récompensée
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
          Accumulez des points à chaque commande, échangez-les contre des réductions et profitez d&apos;avantages exclusifs. Plus vous dépensez, plus vous gagnez.
        </p>
      </header>

      <section className="mt-12" aria-label="Comment gagner des points">
        <h2 className="text-center font-serif text-xl font-medium text-ink sm:text-2xl">
          Comment gagner des points
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {WAYS_TO_EARN.map((way) => (
            <div key={way.label} className="flex flex-col items-center rounded-xl border border-border bg-surface-alt p-5 text-center sm:p-6">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <way.icon className="size-6 text-primary" aria-hidden />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{way.label}</h3>
              <p className="mt-1 text-xs text-ink-muted">{way.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-label="Niveaux de fidélité">
        <h2 className="text-center font-serif text-xl font-medium text-ink sm:text-2xl">
          Les niveaux du Cercle
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {TIERS.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border p-6 sm:p-8 ${
                index === 2 ? "border-brand-champagne bg-brand-champagne/5" : "border-border bg-surface-alt"
              }`}
            >
              {index === 2 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-champagne px-3 py-0.5 text-[0.65rem] font-semibold text-white sm:text-xs">
                  Le plus populaire
                </span>
              )}
              <div className={`flex size-12 items-center justify-center rounded-full ${tier.color}/15`}>
                <Crown className={`size-6 ${tier.color === "bg-brand-champagne" ? "text-brand-champagne" : tier.color === "bg-gray-400" ? "text-gray-400" : "text-amber-700"}`} aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{tier.name}</h3>
              <p className="mt-1 text-xs text-ink-muted">{tier.min}+ points</p>
              <ul className="mt-4 space-y-2">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-ink">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/shop"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Commencer à accumuler
        </Link>
      </div>
    </div>
  );
}
