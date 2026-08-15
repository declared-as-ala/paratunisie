import type { Metadata } from "next";
import { WishlistPage } from "@/components/account/wishlist-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Mes favoris",
  description: "Retrouvez les produits que vous avez enregistrés dans vos favoris ParaTunisie.",
  alternates: { canonical: "/favoris" },
  openGraph: { type: "website", title: "Mes favoris | ParaTunisie", url: "/favoris" },
};

export default function FavorisPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Mes favoris", item: `${SITE_URL}/favoris` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <WishlistPage />
    </>
  );
}
