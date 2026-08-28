import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Sparkles } from "lucide-react";
import { articles } from "@/lib/data/articles";

export function HomeExpertAdvice() {
  const featuredSlugs = [
    "meilleure-creatine-tunisie",
    "whey-protein-tunisie-guide",
    "ashwagandha-tunisie-guide",
    "complements-musculation-debutant",
  ];

  const displayArticles = articles.filter((a) => featuredSlugs.includes(a.slug));

  if (displayArticles.length === 0) return null;

  return (
    <section className="bg-soft-nude/40 py-12 sm:py-16 border-b border-border/50">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2 border border-primary/15">
              <Sparkles className="size-3.5" />
              Guides & Nutrition Sportive
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
              Nos derniers guides d&apos;experts
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-muted">
              Comprendre la créatine, les protéines et les vitamines pour progresser en toute sécurité.
            </p>
          </div>
          <Link
            href="/conseils"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
          >
            Voir tous les 20 guides
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayArticles.map((art) => (
            <article
              key={art.slug}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1">
                    <Clock className="size-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  <Link href={`/conseils/${art.slug}`}>{art.title}</Link>
                </h3>

                <p className="mt-2 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[11px] text-ink-muted font-medium">
                  Équipe éditoriale
                </span>
                <Link
                  href={`/conseils/${art.slug}`}
                  className="font-semibold text-primary inline-flex items-center gap-1 group-hover:underline"
                >
                  Lire le guide
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
