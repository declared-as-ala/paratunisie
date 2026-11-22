import type { Metadata } from "next";
import { HomePage, type HomeCollection } from "@/components/home/home-page";
import {
  fetchBestSellers,
  fetchBrands,
  fetchCategoryDepartments,
  fetchCheapestByCategory,
  fetchFeaturedProduct,
  fetchPaginatedProducts,
  fetchShopDepartments,
} from "@/lib/api/client";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { articles } from "@/lib/data/articles";


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
  const list = (category: string, limit: number) => fetchPaginatedProducts({ category, limit }).then((r) => r.products);

  const [featured, cheapest, bestSellers, departments, shopDepartments, brands, creatine, whey, isolate, gainers, vitamines, preWorkout] =
    await Promise.all([
      fetchFeaturedProduct(),
      fetchCheapestByCategory(),
      fetchBestSellers(10),
      fetchCategoryDepartments(),
      fetchShopDepartments(),
      fetchBrands(),
      list("creatine", 8),
      list("whey-proteine", 5),
      list("whey-isolate", 3),
      list("gainers-proteines", 8),
      list("vitamines", 8),
      list("pre-workout", 8),
    ]);

  const collections: HomeCollection[] = [
    {
      id: "home-creatine",
      title: "Créatine",
      accent: "Force & Performance",
      subtitle: "Monohydrate micronisée et formules avancées, des marques de référence.",
      href: "/creatine",
      products: creatine,
    },
    {
      id: "home-whey",
      title: "Whey Protéine",
      accent: "Nutrition & Récupération",
      subtitle: "Concentrées et isolates pour compléter vos apports en protéines.",
      href: "/whey-proteine",
      products: [...whey, ...isolate],
    },
    {
      id: "home-gainers",
      title: "Mass Gainers",
      accent: "Prise de Masse",
      subtitle: "Formules riches en calories et en protéines pour accompagner votre prise de masse.",
      href: "/gainers-proteines",
      products: gainers,
    },
    {
      id: "home-vitamines",
      title: "Vitamines",
      accent: "Vitalité au quotidien",
      subtitle: "Vitamines C, D3 et multivitamines pour votre routine de tous les jours.",
      href: "/vitamines",
      products: vitamines,
    },
    {
      id: "home-pre-workout",
      title: "Pre-Workout",
      accent: "Énergie & Intensité",
      subtitle: "Boosters à prendre avant la séance, à choisir selon votre tolérance aux stimulants.",
      href: "/pre-workout",
      products: preWorkout,
    },
  ];

  return (
    <HomePage
      collections={collections}
      featured={featured}
      cheapest={cheapest}
      bestSellers={bestSellers}
      articles={articles.slice(0, 5)}
      departments={departments}
      shopDepartments={shopDepartments}
      brands={brands}
    />
  );
}
