import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Gift,
  MessageCircle,
  PackageCheck,
  Truck,
} from "lucide-react";
import { hasConfiguredWhatsApp, whatsappHref } from "@/lib/contact";

const trustPoints = [
  {
    icon: BadgeCheck,
    title: "Produits authentiques",
    description: "Une sélection issue de circuits de distribution identifiés.",
  },
  {
    icon: Truck,
    title: "Livraison en Tunisie",
    description: "Une expérience pensée pour vos habitudes et vos adresses.",
  },
  {
    icon: PackageCheck,
    title: "Commande accompagnée",
    description: "Des informations claires avant, pendant et après l'achat.",
  },
] as const;

export function HomeCommunity() {
  return (
    <>
      <section className="border-y border-border bg-surface-alt">
        <div className="mx-auto grid max-w-[1440px] divide-y divide-border px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 py-8 md:px-7 md:py-10 first:ps-0 last:pe-0">
              <Icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-base font-medium text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid overflow-hidden rounded-xl border border-border bg-soft-nude lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-10 lg:p-14">
            <Gift className="size-8 text-brand-champagne" aria-hidden />
            <h2 className="mt-6 max-w-xl font-serif text-4xl leading-tight font-medium tracking-tight text-ink sm:text-5xl">
              Entrez dans Le Cercle ParaTunisie
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted">
              Recevez nos guides, découvrez les nouveautés et profitez bientôt
              d&apos;attentions pensées pour votre routine.
            </p>
            <Link
              href="/le-cercle"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Découvrir Le Cercle
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid content-center gap-0 border-t border-border bg-brand-blush/70 p-6 sm:p-10 lg:border-t-0 lg:border-s">
            {[
              "Conseils adaptés à la saison",
              "Nouveautés et sélections éditoriales",
              "Avantages fidélité à venir",
            ].map((item) => (
              <p
                key={item}
                className="border-b border-primary/15 py-5 text-base font-medium text-ink last:border-b-0"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-14">
          <div className="flex max-w-2xl gap-5">
            <MessageCircle className="mt-1 size-8 shrink-0 text-brand-blush" aria-hidden />
            <div>
              <h2 className="font-serif text-3xl leading-tight font-medium sm:text-4xl">
                Besoin d&apos;aide pour choisir ?
              </h2>
              <p className="mt-3 text-base leading-7 text-primary-foreground/80">
                {hasConfiguredWhatsApp
                  ? "Écrivez-nous sur WhatsApp pour être orienté vers la bonne catégorie de soins."
                  : "Notre équipe vous aide à trouver la bonne catégorie de soins."}
              </p>
            </div>
          </div>
          <a
            href={whatsappHref}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-background px-6 py-3 text-sm font-medium text-primary transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-brand-blush focus-visible:outline-none active:translate-y-0"
            aria-label={
              hasConfiguredWhatsApp
                ? "Écrire à ParaTunisie sur WhatsApp"
                : "Ouvrir le centre d'aide ParaTunisie"
            }
          >
            {hasConfiguredWhatsApp ? "Ouvrir WhatsApp" : "Centre d'aide"}
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
      </section>
    </>
  );
}
