import type { Metadata } from "next";
import { SignupPage } from "@/components/account/signup-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Créer un compte | ParaTunisie",
  description: "Inscrivez-vous sur ParaTunisie pour suivre vos commandes, enregistrer vos adresses et gérer votre routine beauté.",
  alternates: { canonical: "/compte/inscription" },
  openGraph: { type: "website", title: "Créer un compte | ParaTunisie", url: "/compte/inscription" },
};

export default function SignupPageRoute() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Mon compte", item: `${SITE_URL}/compte` },
      { "@type": "ListItem", position: 3, name: "Inscription", item: `${SITE_URL}/compte/inscription` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SignupPage />
    </>
  );
}
