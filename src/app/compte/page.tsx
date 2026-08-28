import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/account/account-page";

const SITE_URL = "https://paratunisie.com";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez vos commandes, points fidélité, adresses et avis sur ParaTunisie.",
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
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
        <AccountPage />
      </Suspense>
    </>
  );
}
