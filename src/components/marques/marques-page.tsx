import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { BrandDirectory } from "@/components/marques/brand-directory";
import { COMPANY_CONFIG } from "@/lib/config/company";
import type { BrandListItem, BrandRayon } from "@/lib/api/client";

const formatCount = (n: number) => n.toLocaleString("fr-FR").replace(/ | /g, " ");
const plural = (n: number, one: string, many: string) => `${formatCount(n)} ${n > 1 ? many : one}`;

const sectionTitle = "font-serif text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-3xl";

/** Brands page: catalogue hero, flagship sports brands, other brands, brands per rayon, A–Z directory, FAQ. */
export function MarquesPage({
  brands,
  rayons,
  categoryCount,
}: {
  brands: BrandListItem[];
  rayons: BrandRayon[];
  categoryCount: number;
}) {
  const live = brands.filter((b) => (b.productCount ?? 0) > 0);
  const productTotal = live.reduce((sum, b) => sum + (b.productCount ?? 0), 0);
  const bySlug = new Map(live.map((b) => [b.slug, b]));

  // Sports flagship brands: brands present in the sports rayons, in-stock first.
  const sportStats = new Map<string, { inStock: number; count: number }>();
  for (const rayon of rayons.filter((r) => r.sport)) {
    for (const b of rayon.brands) {
      const cur = sportStats.get(b.slug) ?? { inStock: 0, count: 0 };
      sportStats.set(b.slug, { inStock: cur.inStock + b.inStock, count: cur.count + b.count });
    }
  }
  const flagships = [...sportStats.entries()]
    .map(([slug, stat]) => ({ brand: bySlug.get(slug), ...stat }))
    .filter((x): x is { brand: BrandListItem; inStock: number; count: number } => Boolean(x.brand?.logo))
    .sort((a, b) => b.inStock - a.inStock || (b.brand.productCount ?? 0) - (a.brand.productCount ?? 0))
    .slice(0, Math.min(24, Math.floor(sportStats.size / 6) * 6 || 6));
  const flagshipSlugs = new Set(flagships.map((f) => f.brand.slug));

  const others = live
    .filter((b) => !flagshipSlugs.has(b.slug))
    .sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0))
    .slice(0, 8);

  const wheyBrands = rayons.find((r) => r.slug === "whey-proteine")?.brands.slice(0, 4).map((b) => b.name).join(", ");
  const creatineBrands = rayons.find((r) => r.slug === "creatine")?.brands.slice(0, 4).map((b) => b.name).join(", ");

  const faq: { q: string; a: string }[] = [
    {
      q: `Combien de marques trouve-t-on sur ${COMPANY_CONFIG.name} ?`,
      a: `${formatCount(live.length)} marques ont au moins un produit publié, pour ${formatCount(productTotal)} produits. Elles sont toutes listées de A à Z dans le répertoire ci-dessus.`,
    },
    ...(wheyBrands
      ? [{ q: "Quelles marques de whey protéine sont disponibles ?", a: `Parmi les marques du rayon whey : ${wheyBrands}. Retrouvez la liste complète dans la rubrique « Whey protéine » ci-dessus.` }]
      : []),
    ...(creatineBrands
      ? [{ q: "Quelles marques de créatine sont disponibles ?", a: `Parmi les marques du rayon créatine : ${creatineBrands}. Retrouvez la liste complète dans la rubrique « Créatine » ci-dessus.` }]
      : []),
    {
      q: "Les produits vendus sont-ils authentiques ?",
      a: `${COMPANY_CONFIG.guarantees.authenticity}. Consultez la marque et le format sur chaque fiche, puis vérifiez le scellé, le lot et la date indiqués sur le produit reçu.`,
    },
    {
      q: "Et si ma marque n'est pas dans la liste ?",
      a: "Contactez-nous en précisant la marque et le produit souhaités : nous étudions chaque demande.",
    },
    {
      q: "Comment se passe la livraison ?",
      a: `Livraison en ${COMPANY_CONFIG.deliveryTime} dans les ${COMPANY_CONFIG.coverage}, frais de livraison de ${COMPANY_CONFIG.shippingFeeTnd} DT, paiement à la livraison.`,
    },
  ];

  return (
    <div className="bg-background pb-20 text-ink">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="py-4 text-xs font-medium text-ink-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">Accueil</Link>
            </li>
            <li aria-hidden className="opacity-40">/</li>
            <li aria-current="page" className="font-bold text-ink">Marques</li>
          </ol>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header className="grid gap-8 rounded-[2rem] bg-secondary p-6 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-soft/80">Le catalogue</p>
            <h1 className="mt-3 font-serif text-3xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
              Marques de protéines et compléments en Tunisie
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              Chaque marque de nutrition sportive (whey, créatine, pré-workout, gainers) et de compléments santé a sa page : catalogue complet et prix en dinars. Livraison dans les {COMPANY_CONFIG.coverage}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#repertoire"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-xs font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
              >
                <Search className="size-4" aria-hidden /> Chercher une marque
              </a>
              <a
                href="#marques-phares"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                Marques phares <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-6 border-t border-white/15 pt-6 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
            {[
              ["Marques", formatCount(live.length)],
              ["Produits", formatCount(productTotal)],
              ["Catégories", formatCount(categoryCount)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/60">{label}</dt>
                <dd className="mt-1 font-serif text-3xl font-extrabold tabular-nums sm:text-4xl">{value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <main className="mt-12 space-y-16">
          {/* ── Nutrition sportive : marques phares ───────────────────── */}
          {flagships.length > 0 && (
            <section id="marques-phares" aria-labelledby="brands-flagship" className="scroll-mt-48">
              <h2 id="brands-flagship" className={sectionTitle}>Nutrition sportive : marques phares</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Les marques présentes dans nos rayons whey, créatine, pré-workout et gainers, celles qui ont du stock aujourd&apos;hui en premier.
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {flagships.map(({ brand, inStock }) => (
                  <li key={brand.slug}>
                    <Link
                      href={`/marques/${brand.slug}`}
                      className="group flex h-full flex-col items-center rounded-xl bg-card p-4 text-center ring-1 ring-border-strong/60 transition-all hover:-translate-y-0.5 hover:ring-primary/50 hover:shadow-[0_18px_30px_-22px_rgba(90,27,61,0.5)]"
                    >
                      <span className="relative block h-16 w-full">
                        <Image
                          src={brand.logo as string}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 45vw, 200px"
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </span>
                      <span className="mt-3 text-sm font-extrabold text-foreground">{brand.name}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                        {plural(brand.productCount ?? 0, "produit", "produits")}
                        {inStock > 0 && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                            en stock
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {others.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-muted">Autres marques phares</h3>
                  <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                    {others.map((b) => (
                      <li key={b.slug}>
                        <Link href={`/marques/${b.slug}`} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-foreground hover:text-primary">
                          {b.name}
                          <span className="font-normal text-ink-muted">· {plural(b.productCount ?? 0, "produit", "produits")}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* ── Les marques par rayon ─────────────────────────────────── */}
          {rayons.some((r) => r.brandCount > 0) && (
            <section aria-labelledby="brands-rayons">
              <h2 id="brands-rayons" className={sectionTitle}>Les marques par rayon</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Les marques de chaque rayon, celles qui ont du stock aujourd&apos;hui en premier, avec leur nombre de références.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rayons
                  .filter((r) => r.brandCount > 0)
                  .map((rayon) => (
                    <article key={rayon.slug} className="flex flex-col rounded-2xl bg-card p-6 ring-1 ring-border-strong/60">
                      <h3 className="font-serif text-lg font-extrabold uppercase tracking-tight text-foreground">{rayon.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-ink-muted">
                        {plural(rayon.brandCount, "marque", "marques")} · {plural(rayon.productCount, "produit", "produits")}
                      </p>
                      <ul className="mt-4 flex-1 divide-y divide-border/60">
                        {rayon.brands.slice(0, 6).map((b) => (
                          <li key={b.slug}>
                            <Link href={`/marques/${b.slug}`} className="flex min-h-10 items-center justify-between gap-3 text-sm text-foreground hover:text-primary">
                              <span className="truncate font-semibold">{b.name}</span>
                              <span className="shrink-0 text-xs text-ink-muted">
                                {plural(b.count, "produit", "produits")}
                                {b.inStock > 0 && <span className="text-emerald-700"> ({b.inStock} en stock)</span>}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/${rayon.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover">
                        Tout le rayon {rayon.linkLabel} <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {/* ── Répertoire A–Z ────────────────────────────────────────── */}
          <BrandDirectory brands={live.map((b) => ({ slug: b.slug, name: b.name, count: b.productCount ?? 0 }))} />

          {/* ── À propos ──────────────────────────────────────────────── */}
          <section aria-labelledby="brands-about" className="rounded-3xl bg-primary-soft/60 p-6 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Acheter vos marques sur {COMPANY_CONFIG.name}</p>
            <h2 id="brands-about" className={`${sectionTitle} mt-2`}>Deux catalogues, une seule liste</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">Nutrition sportive et santé</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Whey, créatine, pré-workout, gainers, mais aussi vitamines, minéraux, oméga 3 et plantes : les deux familles cohabitent dans ce répertoire, classées de A à Z et par rayon.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">Une page par marque</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Chaque nom de cette liste mène au catalogue complet de la marque, avec les mêmes prix et la même disponibilité que le reste de la boutique.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-foreground">Commander, où que vous soyez</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Livraison en {COMPANY_CONFIG.deliveryTime} dans les {COMPANY_CONFIG.coverage} : {COMPANY_CONFIG.shippingFeeTnd} DT, paiement à la livraison.
                </p>
              </div>
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────── */}
          <section aria-labelledby="brands-faq">
            <h2 id="brands-faq" className={sectionTitle}>Questions fréquentes</h2>
            <div className="mt-6 divide-y divide-border-strong/60 rounded-2xl bg-card ring-1 ring-border-strong/60">
              {faq.map(({ q, a }) => (
                <details key={q} className="group px-5 py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-foreground [&::-webkit-details-marker]:hidden">
                    {q}
                    <span aria-hidden className="text-xl leading-none text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-4 text-sm leading-relaxed text-ink-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────── */}
          <section className="rounded-[2rem] bg-secondary p-8 text-center text-white sm:p-12">
            <h2 className="font-serif text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">Vous ne trouvez pas votre marque ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
              Dites-nous laquelle et quel produit exactement, nous étudions chaque demande.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-xs font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
            >
              Nous écrire <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
