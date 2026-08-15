import type { Metadata } from "next";

import { MarquesPage } from "@/components/marques/marques-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Nos marques — Marques dermocosmétiques | ParaTunisie",
  description:
    "Découvrez les marques dermocosmétiques sélectionnées par ParaTunisie : La Roche-Posay, Bioderma, Avène, CeraVe, Vichy et bien d'autres. Recherchez, explorez par univers, trouvez la marque idéale.",
  alternates: { canonical: "/marques" },
  openGraph: {
    type: "website",
    title: "Nos marques | ParaTunisie",
    description:
      "Les marques dermocosmétiques de confiance, sélectionnées pour vous.",
    url: "/marques",
  },
};

export default function MarquesRoute() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Marques", item: `${SITE_URL}/marques` },
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
      <MarquesPage />
    </>
  );
}
