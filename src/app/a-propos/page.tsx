import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, HeartHandshake, ShieldCheck, Sparkles, Truck, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "À Propos de ParaTunisie | Spécialiste Nutrition Sportive & Bien-être",
  description:
    "Découvrez ParaTunisie, son catalogue de nutrition sportive et de bien-être, son service client et ses modalités de livraison en Tunisie.",
  alternates: { canonical: "/a-propos" },
};

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <Sparkles className="size-3.5" />
          Votre Partenaire Performance & Santé
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
          À Propos de ParaTunisie
        </h1>
        <p className="mt-3 text-sm text-ink-muted sm:text-base max-w-2xl mx-auto">
          Une boutique tunisienne de compléments alimentaires, nutrition sportive et produits de bien-être.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-ink-muted">
        {/* Intro Card */}
        <section className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif text-xl font-bold text-ink mb-4">Notre Mission &amp; Engagement</h2>
          <p>
            <strong>ParaTunisie</strong> est une plateforme e-commerce tunisienne spécialisée dans la nutrition sportive, les compléments alimentaires, le bien-être et une sélection de produits de parapharmacie.
          </p>
          <p className="mt-3">
            Notre objectif est de rendre accessibles en Tunisie des références issues de grandes marques reconnues, avec une expérience d’achat en ligne simple, des informations produit transparentes et un accompagnement client réactif avant et après commande.
          </p>
          <p className="mt-3">
            Nous commercialisons des produits de nutrition sportive et de micronutrition (créatine, whey, gainers, vitamines, minéraux). Les indications du fabricant figurant sur l’emballage restent la référence avant utilisation.
          </p>
        </section>

        {/* 4 Pillars */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <BadgeCheck className="size-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-ink mb-1">Identification des produits</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Les fiches indiquent la marque et le format. Vérifiez le scellé, le numéro de lot et la date présents sur le produit reçu.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 mb-3">
              <Truck className="size-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-ink mb-1">Livraison Express Partout en Tunisie</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Expédition rapide et soignée sur l’ensemble des 24 gouvernorats tunisiens avec suivi direct et paiement en espèces à la livraison.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 mb-3">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-ink mb-1">Conseils Scientifiques & Pédagogie</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Notre pôle éditorial rédige des guides complets et objectifs pour vous aider à choisir les bons dosages et les bons compléments sans promesses excessives.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-700 mb-3">
              <HeartHandshake className="size-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-ink mb-1">Service Client & Fidélité</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Une équipe à votre écoute par téléphone ou WhatsApp, doublée d’un programme de fidélité avantageux (20 points = 1 DT de remise).
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-white p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-ink">Prêt à optimiser vos entraînements ?</h3>
            <p className="text-xs text-ink-muted mt-1">Explorez notre catalogue de créatines, protéines et vitamines authentiques.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              Voir le catalogue
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
