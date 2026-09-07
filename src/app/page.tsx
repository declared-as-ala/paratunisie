import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { fetchHomepageCategoryRows } from "@/lib/api/client";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Parapharmacie en Ligne Tunisie | ParaTunisie",
  description:
    "ParaTunisie : votre parapharmacie en ligne en Tunisie. Compléments alimentaires, nutrition sportive, vitamines et soins bien-être authentiques livrés à domicile.",
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
  openGraph: {
    title: "Parapharmacie en Ligne Tunisie | ParaTunisie",
    description:
      "ParaTunisie : votre parapharmacie en ligne en Tunisie. Compléments alimentaires, nutrition sportive, vitamines et soins bien-être authentiques livrés à domicile.",
    url: buildCanonicalUrl("/"),
    locale: "fr_TN",
    type: "website",
  },
};

export default async function Home() {
  const categoryRows = await fetchHomepageCategoryRows();
  return <HomePage categoryRows={categoryRows} />;
}

