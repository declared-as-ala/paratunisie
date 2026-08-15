import type { Metadata } from "next";
import { AccountPage } from "@/components/account/account-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez vos commandes, adresses et routines ParaTunisie.",
  alternates: { canonical: "/compte" },
  openGraph: { type: "website", title: "Mon compte | ParaTunisie", url: "/compte" },
};

export default function ComptePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Mon compte", item: `${SITE_URL}/compte` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <AccountPage />
    </>
  );
}
