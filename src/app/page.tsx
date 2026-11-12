import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { fetchBestSellers, fetchFeaturedProduct, fetchHomepageCategoryRows } from "@/lib/api/client";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { articles } from "@/lib/data/articles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Parapharmacie en Ligne & Nutrition Sportive en Tunisie | ParaTunisie",
  description:
    "ParaTunisie : votre parapharmacie en ligne en Tunisie. Compléments alimentaires, nutrition sportive, vitamines et soins bien-être authentiques livrés à domicile.",
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
  openGraph: {
    title: "Parapharmacie en Ligne & Nutrition Sportive en Tunisie | ParaTunisie",
    description:
      "ParaTunisie : votre plateforme e-commerce en Tunisie. Compléments alimentaires, nutrition sportive, vitamines et soins bien-être authentiques livrés à domicile.",
    url: buildCanonicalUrl("/"),
    locale: "fr_TN",
    type: "website",
  },
};

export default async function Home() {
  const [categoryRows, featured, bestSellers] = await Promise.all([
    fetchHomepageCategoryRows(),
    fetchFeaturedProduct(),
    fetchBestSellers(10),
  ]);

  const recentArticles = articles.slice(0, 4);

  return (
    <HomePage
      categoryRows={categoryRows}
      featured={featured}
      bestSellers={bestSellers}
      articles={recentArticles}
    />
  );
}
