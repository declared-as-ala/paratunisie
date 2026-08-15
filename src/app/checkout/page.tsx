import type { Metadata } from "next";

import { CheckoutPage } from "@/components/checkout/checkout-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Passer la commande",
  description: "Finalisez votre commande ParaTunisie — livraison partout en Tunisie, paiement à la livraison.",
  alternates: { canonical: "/checkout" },
  robots: { index: false },
  openGraph: {
    type: "website",
    title: "Commande | ParaTunisie",
    description: "Finalisez votre commande ParaTunisie.",
    url: "/checkout",
  },
};

export default function CheckoutRoute() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Panier", item: `${SITE_URL}/panier` },
      { "@type": "ListItem", position: 3, name: "Commande", item: `${SITE_URL}/checkout` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <CheckoutPage />
    </>
  );
}
