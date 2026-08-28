import Link from "next/link";
import { ShieldCheck, Truck, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

export function HomeSeoSection() {
  return (
    <section className="bg-white py-16 sm:py-20 border-t border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Main SEO Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-primary font-extrabold">
            Parapharmacie en Ligne Tunisie
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-bold tracking-tight mt-2">
            ParaTunisie : Votre Parapharmacie et Nutrition Sportive de Référence en Tunisie
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">
            Bienvenue sur <strong>ParaTunisie</strong>, votre destination parapharmaceutique en ligne numéro 1 en Tunisie. Nous réunissons une sélection rigoureuse de compléments alimentaires, nutrition sportive de haut niveau, vitamines et soins dermatologiques 100% certifiés authentiques, livrés rapidement à votre porte partout en Tunisie.
          </p>
        </div>

        {/* 3 Editorial Thematic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-surface-alt border border-border/60">
            <h3 className="text-base font-bold text-ink mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              Compléments & Nutrition Sportive
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-4">
              Retrouvez les meilleures marques mondiales (<em>Optimum Nutrition, BioTechUSA, OstroVit, Real Pharm, Eric Favre</em>) : <strong>créatine monohydrate</strong> micronisée pour la force, <strong>whey isolate</strong> pour le muscle sec, <strong>gainers</strong> pour la prise de masse, <strong>pre-workout</strong> et <strong>BCAA / EAA</strong>.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link href="/creatine" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Créatine Tunisie
              </Link>
              <Link href="/whey-proteine" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Whey Protéine
              </Link>
              <Link href="/ashwagandha" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Ashwagandha
              </Link>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-surface-alt border border-border/60">
            <h3 className="text-base font-bold text-ink mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              Santé, Vitamines & Bien-être
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-4">
              Prenez soin de votre vitalité au quotidien avec des formules hautement biodisponibles : <strong>Vitamines D3 + K2</strong>, <strong>Zinc chélaté</strong>, <strong>Magnésium B6</strong>, <strong>Omega 3</strong> concentrés en EPA/DHA et <strong>Ashwagandha pure</strong> pour la régulation du stress et le sommeil réparateur.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link href="/vitamines" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Vitamines & Immunité
              </Link>
              <Link href="/zinc" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Zinc & Minéraux
              </Link>
              <Link href="/omega-3" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Omega 3 Tunisie
              </Link>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-surface-alt border border-border/60">
            <h3 className="text-base font-bold text-ink mb-3 flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              Livraison Partout en Tunisie 24-48h
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-4">
              Commandez en ligne en toute sérénité avec paiement sécurisé à la livraison (Cash on Delivery). Nous expédions dans les <strong>24 gouvernorats tunisiens</strong> (Tunis, Ariana, Ben Arous, Sousse, Sfax, Nabeul, Bizerte, Monastir, etc.) avec livraison gratuite dès 99 DT.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <Link href="/livraison" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Conditions de livraison
              </Link>
              <Link href="/marques" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Toutes les Marques
              </Link>
              <Link href="/contact" className="px-2.5 py-1 rounded-md bg-white border border-border text-ink hover:text-primary font-medium">
                Service Client
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Quick Category Tags Bar */}
        <div className="pt-8 border-t border-border/50">
          <span className="text-xs font-bold text-ink block mb-3">Recherches fréquentes en Tunisie :</span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Parapharmacie Tunisie", href: "/" },
              { label: "Créatine Monohydrate Tunisie", href: "/creatine" },
              { label: "Whey Protéine Tunisie", href: "/whey-proteine" },
              { label: "Ashwagandha Tunisie", href: "/ashwagandha" },
              { label: "Gainer Prise de Masse", href: "/gainers-proteines" },
              { label: "Pre-Workout Booster", href: "/pre-workout" },
              { label: "BCAA & EAA Récupération", href: "/bcaa" },
              { label: "Vitamines C & D3+K2", href: "/vitamines" },
              { label: "Zinc & Magnésium", href: "/zinc" },
              { label: "Omega 3 Huile de Poisson", href: "/omega-3" },
              { label: "L-Carnitine & Brûleur", href: "/l-carnitine" },
              { label: "Accessoires & Shakers Musculation", href: "/accessoires" },
            ].map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="text-xs text-ink/75 hover:text-primary bg-surface-alt hover:bg-white px-3 py-1.5 rounded-full border border-border/70 transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
