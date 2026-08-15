import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { concernPages } from "@/lib/data/concerns";
import { getProductsForConcern } from "@/lib/data/concerns";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Nos besoins — Trouvez le soin adapté | ParaTunisie",
  description:
    "Explorez nos catégories de besoins : peau sensible, imperfections, hydratation, anti-âge, chute de cheveux et protection solaire. Trouvez les soins adaptés à votre peau.",
  alternates: { canonical: "/besoins" },
  openGraph: {
    type: "website",
    title: "Nos besoins | ParaTunisie",
    description: "Les soins adaptés à chaque besoin de peau.",
    url: "/besoins",
  },
};

export default function BesoinsPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Besoins", item: `${SITE_URL}/besoins` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-muted-foreground sm:text-sm">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            <li><Link href="/" className="hover:text-primary">Accueil</Link></li>
            <li aria-hidden className="text-muted-foreground/50">/</li>
            <li aria-current="page" className="text-ink">Besoins</li>
          </ol>
        </nav>

        <header>
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase sm:text-sm">
            Trouvez votre soin
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Parcourir par besoin
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Chaque peau a des besoins spécifiques. Choisissez votre préoccupation
            pour découvrir les soins les plus adaptés.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {concernPages.map((concern) => {
            const count = getProductsForConcern(concern).length;
            return (
              <Link
                key={concern.slug}
                href={`/besoins/${concern.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all duration-[var(--duration-standard)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(43,35,38,0.08)] sm:p-6"
              >
                {concern.eyebrow && (
                  <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">
                    {concern.eyebrow}
                  </p>
                )}
                <h2 className="mt-2 font-serif text-xl font-medium text-ink transition-colors group-hover:text-primary sm:text-2xl">
                  {concern.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {concern.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {count} produit{count === 1 ? "" : "s"}
                    </span>
                  )}
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
