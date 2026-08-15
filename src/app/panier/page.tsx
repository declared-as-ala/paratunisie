import type { Metadata } from "next";

import { CartPage } from "@/components/cart/cart-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Mon panier",
  description: "Consultez votre panier et préparez votre commande sur ParaTunisie.",
  alternates: { canonical: "/panier" },
  robots: { index: false },
  openGraph: {
    type: "website",
    title: "Mon panier | ParaTunisie",
    description: "Consultez votre panier et préparez votre commande.",
    url: "/panier",
  },
};

export default function CartRoute() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Panier", item: `${SITE_URL}/panier` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <CartPage />
    </>
  );
}
