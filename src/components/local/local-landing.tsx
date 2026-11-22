import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Truck, Wallet } from "lucide-react";

import { CategoryProductCard } from "@/components/category/category-product-card";
import { buildLocalCopy, neighbourLinks, otherClusterPath } from "@/lib/local/content";
import { CLUSTER_LABEL, DELIVERY, type Cluster, type Governorate } from "@/lib/local/governorates";
import type { LocalPageData } from "@/lib/local/page-data";

/**
 * Server-rendered regional landing page, shared by /parapharmacie/<gouvernorat> and /proteine/<gouvernorat>.
 * Products, categories, prices and stock come from the live catalogue; delivery terms come from DELIVERY (verified).
 */
export function LocalLanding({ cluster, governorate, data }: { cluster: Cluster; governorate: Governorate; data: LocalPageData }) {
  const copy = buildLocalCopy(cluster, governorate, data);
  const neighbours = neighbourLinks(cluster, governorate.slug);
  const other = cluster === "parapharmacie" ? "proteine" : "parapharmacie";
  const shopHref = data.categories[0] ? `/${data.categories[0].slug}` : "/shop";

  return (
    <div className="bg-[#FAF7F5] text-ink">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <nav aria-label="Fil d'Ariane" className="mb-5 text-xs text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={CLUSTER_LABEL[cluster].path} className="hover:text-primary">{CLUSTER_LABEL[cluster].short}</Link></li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-bold text-ink">{governorate.name}</li>
          </ol>
        </nav>

        <header className="rounded-3xl border border-border bg-white p-6 shadow-xs sm:p-10">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
            <MapPin size={14} aria-hidden /> Livraison {governorate.in}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{copy.h1}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-muted sm:text-base">{copy.lead}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#produits" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Découvrir les produits <ArrowRight size={16} aria-hidden />
            </a>
            <Link href={shopHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-white px-6 text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary">
              Voir le rayon {data.categories[0]?.name ?? "boutique"}
            </Link>
          </div>
        </header>

        {data.categories.length > 0 && (
          <section aria-labelledby="rayons" className="mt-10">
            <h2 id="rayons" className="font-serif text-2xl font-bold">Rayons disponibles</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="flex min-h-14 flex-col justify-center rounded-2xl border border-border bg-white px-4 py-3 transition-colors hover:border-primary">
                    <span className="text-sm font-bold">{c.name}</span>
                    <span className="text-xs text-ink-muted">{c.inStock} en stock</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.products.length > 0 && (
          <section id="produits" aria-labelledby="selection" className="mt-10 scroll-mt-24">
            <h2 id="selection" className="font-serif text-2xl font-bold">Produits en stock</h2>
            <p className="mt-1 text-sm text-ink-muted">Une sélection de références actuellement disponibles, avec prix en dinars tunisiens.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {data.products.map((p, i) => (
                <CategoryProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="livraison" className="mt-10 rounded-3xl border border-border bg-white p-6 sm:p-8">
          <h2 id="livraison" className="font-serif text-2xl font-bold">Livraison {governorate.in}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            <li className="flex gap-3"><Truck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm leading-relaxed"><strong>Délai :</strong> {DELIVERY.timing}, confirmé à la commande.</span></li>
            <li className="flex gap-3"><Wallet className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm leading-relaxed"><strong>Frais :</strong> {DELIVERY.feeDt} DT par commande, affichés dans le panier.</span></li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm leading-relaxed"><strong>Paiement :</strong> en espèces à la livraison.</span></li>
          </ul>
          <p className="mt-4 text-xs text-ink-muted">
            Détails complets sur la page <Link href="/livraison" className="font-bold text-primary underline underline-offset-2">livraison</Link>. ParaTunisie est une boutique en ligne : aucun point de vente n&apos;est indiqué {governorate.in}.
          </p>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {copy.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-serif text-2xl font-bold">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                  {s.paragraphs.map((t, i) => <p key={i}>{t}</p>)}
                </div>
              </section>
            ))}

            <section aria-labelledby="faq">
              <h2 id="faq" className="font-serif text-2xl font-bold">Questions fréquentes</h2>
              <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-white">
                {copy.faqs.map((f) => (
                  <details key={f.q} className="group px-5 py-4">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">{f.q}<span aria-hidden className="text-primary transition-transform group-open:rotate-45">+</span></summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section aria-labelledby="guides" className="rounded-2xl border border-border bg-white p-5">
              <h2 id="guides" className="font-serif text-lg font-bold">Guides utiles</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {copy.guides.map((g) => <li key={g.href}><Link href={g.href} className="text-primary underline-offset-2 hover:underline">{g.label}</Link></li>)}
              </ul>
            </section>
            <section aria-labelledby="voisins" className="rounded-2xl border border-border bg-white p-5">
              <h2 id="voisins" className="font-serif text-lg font-bold">Autres gouvernorats ({governorate.region})</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {neighbours.map((n) => <li key={n.href}><Link href={n.href} className="inline-flex min-h-9 items-center rounded-full border border-border px-3 hover:border-primary hover:text-primary">{n.label}</Link></li>)}
              </ul>
              <p className="mt-4 text-xs text-ink-muted">
                {cluster === "parapharmacie" ? "Vous cherchez de la nutrition sportive ? " : "Vous cherchez des vitamines et compléments ? "}
                <Link href={otherClusterPath(cluster, governorate.slug)} className="font-bold text-primary underline underline-offset-2">Voir {CLUSTER_LABEL[other].short.toLowerCase()} {governorate.in}</Link>
              </p>
            </section>
          </aside>
        </div>

        <section className="mt-10 rounded-3xl bg-primary p-8 text-center text-primary-foreground sm:p-10">
          <h2 className="font-serif text-2xl font-bold">Commandez {governorate.in} en quelques clics</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm opacity-90">Choisissez vos produits en stock, validez le panier et payez à la livraison.</p>
          <a href="#produits" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-primary transition-opacity hover:opacity-90">Voir les produits</a>
        </section>
      </div>
    </div>
  );
}
