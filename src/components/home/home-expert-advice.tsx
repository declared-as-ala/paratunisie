import Link from "next/link";
import { BookOpen, Clock, ChevronRight, User } from "lucide-react";
import { articles } from "@/lib/data/articles";

export function HomeExpertAdvice() {
  const featuredArticle = articles[0];

  if (!featuredArticle) return null;

  return (
    <section className="bg-soft-nude/40 py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/15">
              <BookOpen size={13} />
              Expertise Pharmacie
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Conseils de nos pharmaciens
            </h2>
          </div>
          <Link
            href="/conseils"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Tous nos conseils
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Featured Editorial Spotlight Banner */}
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                {featuredArticle.category}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-ink-muted">
                <Clock size={12} />
                {featuredArticle.readTime}
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-medium text-ink leading-snug">
              <Link href={`/conseils/${featuredArticle.slug}`} className="hover:text-primary transition-colors">
                {featuredArticle.title}
              </Link>
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-3">
              {featuredArticle.excerpt}
            </p>

            <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-ink-muted">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-primary" />
                Dr. Amira Selmi
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Recommandations parapharmaceutiques</span>
            </div>
          </div>

          <div className="shrink-0 pt-4 md:pt-0">
            <Link
              href={`/conseils/${featuredArticle.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-primary-hover transition-all shadow-xs"
            >
              Lire le guide complet <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
