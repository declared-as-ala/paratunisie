import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, SunMedium } from "lucide-react";

import { adviceArticles } from "@/lib/data/home";

export function HomeEditorial() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="flex items-center px-4 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-20">
            <div className="max-w-xl">
              <p className="text-sm font-medium tracking-[0.14em] text-brand-blush uppercase">
                Votre routine
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
                Une routine qui vous ressemble
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-primary-foreground/80">
                Quelques questions suffisent pour organiser des soins cohérents,
                du geste essentiel à la routine complète.
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-md bg-background px-5 py-3 text-sm font-medium text-primary transition-transform hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-brand-blush focus-visible:outline-none active:translate-y-0"
              >
                Découvrir nos soins
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <p className="mt-5 text-xs leading-5 text-primary-foreground/65">
                Ce parcours propose des conseils cosmétiques et ne remplace pas
                un avis médical.
              </p>
            </div>
          </div>
          <div className="relative min-h-[32rem] lg:min-h-[44rem]">
            <Image
              src="/assets/routine-paratunisie.webp"
              alt="Routine de soins composée d'un nettoyant, d'un sérum, d'une crème et d'une protection solaire"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <h2 className="max-w-2xl font-serif text-4xl leading-tight font-medium tracking-tight text-ink sm:text-5xl">
          Les gestes de saison
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="flex min-h-[26rem] flex-col justify-end rounded-xl bg-brand-blush p-6 sm:p-10">
            <SunMedium className="mb-auto size-8 text-primary" aria-hidden />
            <h3 className="max-w-xl font-serif text-3xl leading-tight font-medium text-ink sm:text-4xl">
              Le solaire qui suit votre rythme
            </h3>
            <p className="mt-4 max-w-lg text-base leading-7 text-ink-muted">
              Ville, plage ou sport : trouvez une texture agréable et une
              protection adaptée à votre peau.
            </p>
            <Link
              href="/solaire"
              className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border-b border-primary py-2 text-sm font-medium text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Choisir ma protection
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </article>

          <article className="flex min-h-[26rem] flex-col rounded-xl border border-border bg-surface-alt p-6 sm:p-8">
            <Sparkles className="size-8 text-brand-champagne" aria-hidden />
            <div className="mt-auto">
              <h3 className="font-serif text-3xl leading-tight font-medium text-ink">
                Retrouver l&apos;éclat
              </h3>
              <p className="mt-4 text-base leading-7 text-ink-muted">
                Vitamine C, hydratation et protection : trois repères pour un
                teint plus lumineux.
              </p>
              <Link
                href="/besoins/taches-eclat"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                Voir la sélection
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-soft-nude py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <ShieldCheck className="size-9 text-primary" aria-hidden />
              <h2 className="mt-5 font-serif text-4xl leading-tight font-medium tracking-tight text-ink sm:text-5xl">
                Nos repères pour mieux choisir
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-ink-muted">
                Des sélections lisibles, construites autour de l&apos;usage, de la
                tolérance et du plaisir d&apos;application.
              </p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {[
                ["Peau sensible", "Formules douces et textures confortables", "/besoins/peau-sensible"],
                ["Protection quotidienne", "Indices élevés et finis adaptés au visage", "/solaire"],
                ["Cheveux fragilisés", "Routines simples pour le cuir chevelu et les longueurs", "/besoins/chute-cheveux"],
              ].map(([title, description, href], index) => (
                <Link
                  key={title}
                  href={href}
                  className="group grid min-h-32 grid-cols-[auto_1fr_auto] items-center gap-4 py-6 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:gap-6"
                >
                  <span className="font-tabular text-sm text-primary">
                    0{index + 1}
                  </span>
                  <span>
                    <span className="block text-lg font-medium text-ink">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-ink-muted">
                      {description}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 text-primary transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
              Conseils
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight font-medium tracking-tight text-ink sm:text-5xl">
              Comprendre avant de choisir
            </h2>
            <Link
              href="/conseils"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md border border-primary px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Tous les conseils
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {adviceArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="group grid min-h-28 grid-cols-[1fr_auto] items-center gap-4 py-5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span>
                  <span className="block text-xs font-medium tracking-wide text-primary uppercase">
                    {article.category}
                  </span>
                  <span className="mt-2 block text-lg font-medium text-ink">
                    {article.title}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
