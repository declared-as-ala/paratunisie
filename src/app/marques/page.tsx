import type { Metadata } from "next";

import { MarquesPage } from "@/components/marques/marques-page";
import { fetchBrands } from "@/lib/api/client";
import { buildPageMetadata, buildBreadcrumbsSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Nos marques — Marques Officielles en Tunisie",
  description:
    "Découvrez les marques de nutrition sportive et compléments alimentaires disponibles chez ParaTunisie : BioTechUSA, Real Pharm, Optimum Nutrition, Scitec, et bien d'autres.",
  path: "/marques",
  keywords: [
    "marques nutrition sportive tunisie",
    "marques proteines tunisie",
    "marques complements alimentaires",
  ],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MarquesRoute() {
  const brands = await fetchBrands();
  const breadcrumbJsonLd = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: "Marques", url: "/marques" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <MarquesPage initialBrands={brands} />
    </>
  );
}
