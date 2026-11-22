import Link from "next/link";
import { Truck, Wallet, ShieldCheck } from "lucide-react";

import { CLUSTER_LABEL, DELIVERY, GOVERNORATES, type Cluster, type RegionGroup } from "@/lib/local/governorates";
import { loadLocalPageData } from "@/lib/local/page-data";

const REGIONS: RegionGroup[] = ["Grand Tunis", "Nord-Est", "Nord-Ouest", "Centre-Est", "Centre-Ouest", "Sud-Est", "Sud-Ouest"];

/** Shopper-oriented hub: how to order, live rayons with stock, delivery terms, and the governorate directory grouped by region. */
export async function LocalHub({ cluster, title, intro }: { cluster: Cluster; title: string; intro: string }) {
  const data = await loadLocalPageData(cluster);
  return (
    <div className="bg-[#FAF7F5] text-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Fil d'Ariane" className="mb-5 text-xs text-ink-muted"><Link href="/" className="hover:text-primary">Accueil</Link> / <span className="font-bold text-ink">{CLUSTER_LABEL[cluster].short}</span></nav>
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted sm:text-base">{intro}</p>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Choisissez vos produits en stock", "Indiquez votre adresse dans votre gouvernorat", "Réglez en espèces à la livraison"].map((t, i) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-sm font-bold"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{i + 1}</span>{t}</li>
          ))}
        </ol>

        {data.categories.length > 0 && (
          <section className="mt-10" aria-labelledby="rayons">
            <h2 id="rayons" className="font-serif text-2xl font-bold">Rayons en stock aujourd&apos;hui</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.categories.map((c) => (
                <li key={c.slug}><Link href={`/${c.slug}`} className="flex min-h-14 flex-col justify-center rounded-2xl border border-border bg-white px-4 py-3 hover:border-primary"><span className="text-sm font-bold">{c.name}</span><span className="text-xs text-ink-muted">{c.inStock} en stock</span></Link></li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 rounded-3xl border border-border bg-white p-6" aria-labelledby="livraison-hub">
          <h2 id="livraison-hub" className="font-serif text-2xl font-bold">Livraison dans les 24 gouvernorats</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            <li className="flex gap-3"><Truck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm"><strong>Délai :</strong> {DELIVERY.timing}</span></li>
            <li className="flex gap-3"><Wallet className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm"><strong>Frais :</strong> {DELIVERY.feeDt} DT par commande</span></li>
            <li className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span className="text-sm"><strong>Paiement :</strong> en espèces à la livraison</span></li>
          </ul>
          <p className="mt-3 text-xs text-ink-muted">Les conditions sont les mêmes partout en Tunisie. Détails sur la page <Link href="/livraison" className="font-bold text-primary underline underline-offset-2">livraison</Link>.</p>
        </section>

        <section className="mt-10" aria-labelledby="regions">
          <h2 id="regions" className="font-serif text-2xl font-bold">Choisir votre gouvernorat</h2>
          {REGIONS.map((r) => {
            const list = GOVERNORATES.filter((g) => g.region === r);
            return (
              <div key={r} className="mt-5">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ink-muted">{r}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {list.map((g) => <li key={g.slug}><Link href={`${CLUSTER_LABEL[cluster].path}/${g.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-white px-4 text-sm font-bold hover:border-primary hover:text-primary">{g.name}</Link></li>)}
                </ul>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
