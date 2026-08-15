import type { Metadata } from "next";
import { LoyaltyPage } from "@/components/account/loyalty-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Le Cercle ParaTunisie — Programme de fidélité",
  description: "Accumulez des points à chaque commande et profitez d'avantages exclusifs. Programme de fidélité ParaTunisie.",
  alternates: { canonical: "/le-cercle" },
  openGraph: { type: "website", title: "Le Cercle ParaTunisie | ParaTunisie", url: "/le-cercle" },
};

export default function LeCerclePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Le Cercle ParaTunisie", item: `${SITE_URL}/le-cercle` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <LoyaltyPage />
    </>
  );
}
