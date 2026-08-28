import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { articles, articleCategories, type Article } from "@/lib/data/articles";
import { BlogHubClient } from "@/components/blog/blog-hub-client";

export const metadata: Metadata = {
  title: "Blog Nutrition Sportive & Compléments en Tunisie | ParaTunisie",
  description:
    "Conseils, guides et actualités : whey protéine, créatine monohydrate, prise de masse, brûleurs de graisse et vitamines en Tunisie.",
  alternates: { canonical: "/conseils" },
  openGraph: {
    type: "website",
    title: "Blog Nutrition Sportive & Compléments | ParaTunisie",
    description:
      "Guides d'experts, comparatifs de créatines, protéines, pre-workouts et vitamines disponibles en Tunisie.",
    url: "/conseils",
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function getArticleImage(slug: string, apiImage?: string): string {
  if (apiImage && apiImage !== "/assets/hero-paratunisie.webp" && apiImage.trim() !== "") {
    return apiImage;
  }
  return `/assets/blog/${slug}.webp`;
}

async function fetchPublishedArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_URL}/content/articles?status=PUBLISHED`, {
      cache: "no-store",
    });
    if (!res.ok) return articles.map(a => ({ ...a, featuredImage: getArticleImage(a.slug, a.featuredImage) }));
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // Merge with static metadata for rich rendering
      return data.map((apiArt) => {
        const local = articles.find((a) => a.slug === apiArt.slug);
        return {
          ...local,
          ...apiArt,
          featuredImage: getArticleImage(apiArt.slug, apiArt.featuredImage || local?.featuredImage),
          title: apiArt.title || local?.title || "",
          excerpt: apiArt.excerpt || local?.excerpt || "",
          category: apiArt.category || local?.category || "Créatine",
          readTime: apiArt.readTime || local?.readTime || "5 min",
          date: apiArt.date || local?.date || "2026-08-28",
        };
      });
    }
    return articles.map(a => ({ ...a, featuredImage: getArticleImage(a.slug, a.featuredImage) }));
  } catch {
    return articles.map(a => ({ ...a, featuredImage: getArticleImage(a.slug, a.featuredImage) }));
  }
}

const COMMERCIAL_HUBS = [
  { name: "Créatine Monohydrate", url: "/creatine", count: "Toutes marques pures" },
  { name: "Whey Protéine", url: "/whey-proteine", count: "Isolate & Concentré" },
  { name: "Mass Gainers", url: "/gainers", count: "Prise de masse rapide" },
  { name: "Pre-Workout & Boosters", url: "/pre-workout", count: "Énergie & Focus" },
  { name: "BCAA & Acides Aminés", url: "/bcaa-acides-amines", count: "EAA, BCAA, Citrulline" },
  { name: "Ashwagandha KSM-66", url: "/ashwagandha", count: "Stress & Récupération" },
  { name: "Vitamines & Minéraux", url: "/vitamines-mineraux", count: "D3+K2, Zinc, Multi" },
  { name: "Brûleurs de Graisse", url: "/bruleurs-de-graisse", count: "Sèche & Minceur" },
];

export default async function ConseilsHubPage() {
  const publishedArticles = await fetchPublishedArticles();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Blog & Conseils</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* ── Main Interactive Blog Hub ── */}
        <BlogHubClient
          initialArticles={publishedArticles}
          categories={articleCategories}
        />

        {/* ── Commercial Category Quick Access ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-primary font-bold text-xs uppercase tracking-wider">
                — Catalogue ParaTunisie
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Explorer nos rayons de nutrition sportive
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>Voir toute la boutique</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {COMMERCIAL_HUBS.map((hub) => (
              <Link
                key={hub.url}
                href={hub.url}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-primary/5 border border-slate-200/70 hover:border-primary/30 transition-all group"
              >
                <div className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                  {hub.name}
                </div>
                <div className="text-[0.7rem] text-slate-500 mt-1">{hub.count}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Editorial Trust & Authenticity Guarantee ── */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Transparence & Rigueur Scientifique</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading">
              Une rédaction indépendante et des sources vérifiées
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Tous nos articles sont rédigés par l&apos;équipe éditoriale ParaTunisie sur la base d&apos;études scientifiques publiées (ISSN, EFSA, PubMed) et des retours terrain de nos coachs partenaires.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/politique-editoriale"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs sm:text-sm text-center hover:bg-slate-100 transition-colors"
            >
              Politique éditoriale
            </Link>
            <Link
              href="/a-propos"
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-xs sm:text-sm text-center hover:bg-slate-700 transition-colors border border-slate-700"
            >
              À propos de ParaTunisie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
