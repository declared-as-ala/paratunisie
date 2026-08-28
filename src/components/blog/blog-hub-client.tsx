"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, Search, Calendar, Sparkles } from "lucide-react";
import type { Article } from "@/lib/data/articles";

interface BlogHubClientProps {
  initialArticles: Article[];
  categories: string[];
}

export function BlogHubClient({ initialArticles, categories }: BlogHubClientProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredArticles = React.useMemo(() => {
    let list = initialArticles;

    if (selectedCategory !== "ALL") {
      list = list.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.focusKeyword.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [initialArticles, selectedCategory, searchQuery]);

  const allCategories = ["ALL", ...categories];

  return (
    <div className="space-y-10">
      {/* ── 1. Top Header (Matching Screenshot) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-4 h-[2px] bg-primary inline-block"></span>
            Blog
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight uppercase leading-tight font-heading">
          Blog Nutrition Sportive & Compléments en Tunisie
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Conseils, guides et actualités : whey, créatine, prise de masse et compléments alimentaires.
        </p>
      </div>

      {/* ── 2. Category Filter Bar (Matching Screenshot) ── */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            Tous les articles
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] md:min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un guide..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* ── 3. Publications Header Section ── */}
      <div className="flex items-center justify-between pt-2 border-b border-slate-200/60 pb-4">
        <div>
          <span className="text-primary font-bold text-[0.7rem] uppercase tracking-wider block mb-0.5">
            — Publications
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase font-heading">
            {selectedCategory === "ALL" ? "Tous les articles" : `Articles : ${selectedCategory}`}
          </h2>
        </div>
        <div className="bg-slate-100/90 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xs">
          {filteredArticles.length} {filteredArticles.length > 1 ? "articles" : "article"}
        </div>
      </div>

      {/* ── 4. 3-Column Articles Grid (Matching Screenshot) ── */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <p className="text-slate-500 text-sm mb-3">Aucun article ne correspond à votre recherche.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setSearchQuery("");
            }}
            className="text-xs font-semibold text-primary underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredArticles.map((article) => {
            const formattedDate = new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(article.date));

            return (
              <article
                key={article.slug}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Container with Floating Badges */}
                <Link
                  href={`/conseils/${article.slug}`}
                  className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 block"
                >
                  <Image
                    src={
                      article.featuredImage && article.featuredImage !== "/assets/hero-paratunisie.webp"
                        ? article.featuredImage
                        : `/assets/blog/${article.slug}.webp`
                    }
                    alt={article.imageAlt || article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Top-Left Floating Date Badge (Screenshot Style) */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[0.72rem] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-slate-200/50">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{formattedDate}</span>
                  </div>

                  {/* Top-Right Category Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[0.68rem] font-medium px-2.5 py-0.5 rounded-full">
                    {article.category}
                  </div>
                </Link>

                {/* Body Content */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div className="space-y-2.5">
                    <Link href={`/conseils/${article.slug}`}>
                      <h3 className="font-bold text-slate-900 text-[1.05rem] leading-snug group-hover:text-primary transition-colors line-clamp-2 min-h-[2.8rem]">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Footer Meta Row (Screenshot Style) */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{article.readTime} de lecture</span>
                    </div>

                    <Link
                      href={`/conseils/${article.slug}`}
                      className="inline-flex items-center gap-1 text-primary font-semibold text-xs group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Lire l&apos;article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
