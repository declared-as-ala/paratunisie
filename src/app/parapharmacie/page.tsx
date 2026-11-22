import type { Metadata } from "next";
import Link from "next/link";

import { RegionDirectory } from "@/components/local/region-directory";
import { buildPageMetadata } from "@/lib/seo/metadata";

// Directory page: kept noindex until the regional pages it lists have proven useful in Search Console.
export const metadata: Metadata = buildPageMetadata({
  title: "Parapharmacie par gouvernorat",
  description: "Choisissez votre gouvernorat pour consulter les vitamines et compléments en stock et les conditions de livraison.",
  path: "/parapharmacie",
  noindex: true,
});

export default function Page() {
  return (
    <div className="bg-[#FAF7F5] text-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Fil d'Ariane" className="mb-5 text-xs text-ink-muted"><Link href="/" className="hover:text-primary">Accueil</Link> / <span className="font-bold text-ink">Parapharmacie par gouvernorat</span></nav>
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">Parapharmacie par gouvernorat</h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted sm:text-base">Choisissez votre gouvernorat pour consulter les vitamines et compléments en stock et les conditions de livraison. ParaTunisie est une boutique en ligne : la livraison couvre les 24 gouvernorats.</p>
        <div className="mt-8"><RegionDirectory cluster="parapharmacie" /></div>
      </div>
    </div>
  );
}
