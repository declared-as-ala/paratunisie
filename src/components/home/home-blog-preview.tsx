"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Article } from "@/lib/data/articles";

const FALLBACK_ARTICLES = [
  {
    slug: "whey-sans-lactose-tunisie",
    title: "Whey sans lactose : quelle option choisir en Tunisie ?",
    excerpt: "Tout ce que vous devez savoir sur la whey sans lactose et ses avantages pour la digestion.",
    category: "WHEY PROTÉINE",
    categoryColor: "bg-emerald-600",
    image: "/assets/blog/whey-sans-lactose-tunisie.webp",
    date: "12 Nov 2024",
  },
  {
    slug: "creatine-monohydrate-guide-complet-tunisie",
    title: "Créatine : quels sont les réels bénéfices ?",
    excerpt: "Guide complet sur la créatine monohydrate, son dosage optimal et son utilisation quotidienne.",
    category: "CRÉATINE",
    categoryColor: "bg-blue-600",
    image: "/assets/blog/creatine-femme.webp",
    date: "10 Nov 2024",
  },
  {
    slug: "pack-musculation-debutant-essentiels-tunisie",
    title: "Compléments authentiques vs contrefaçons : comment les reconnaître ?",
    excerpt: "Nos conseils pour vérifier l'authenticité de vos protéines et compléments en toute sécurité en Tunisie.",
    category: "GUIDE D'ACHAT",
    categoryColor: "bg-amber-600",
    image: "/assets/blog/pack-musculation-debutant-essentiels-tunisie.webp",
    date: "08 Nov 2024",
  },
  {
    slug: "ashwagandha-ksm66-sommeil-stress-tunisie",
    title: "Ashwagandha : bienfaits, utilisation et précautions",
    excerpt: "Tout savoir sur l'ashwagandha KSM-66, ses effets sur le cortisol, le stress et le sommeil réparateur.",
    category: "BIEN-ÊTRE",
    categoryColor: "bg-purple-600",
    image: "/assets/blog/passiflore-valeriane-sommeil-naturel-tunisie.webp",
    date: "05 Nov 2024",
  },
];

/**
 * "Derniers articles et conseils" carousel: header with "Voir tous les articles →",
 * and up to 5 swipeable cards with category badges, images, titles, excerpts, and date.
 */
export function HomeBlogPreview({ articles = [] }: { articles?: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Use real passed articles when any exist; curated fallback only covers the empty case.
  const items = articles.length > 0 ? articles.slice(0, 5) : null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section aria-labelledby="home-blog-heading" className="bg-[#FAF8F6] py-8 sm:py-12 border-t border-border/50">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">

        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="mb-5 sm:mb-6 flex items-end justify-between gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            {/* Red Signal Bar Icon */}
            <div className="flex items-end gap-0.5 h-6 pt-1 text-primary shrink-0" aria-hidden>
              <span className="w-1.5 h-3.5 bg-primary rounded-full" />
              <span className="w-1.5 h-5 bg-primary rounded-full" />
              <span className="w-1.5 h-4 bg-primary rounded-full" />
            </div>

            <div className="min-w-0">
              <h2 id="home-blog-heading" className="font-serif text-lg min-[375px]:text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-ink">
                Derniers articles et conseils
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5 truncate">
                Découvrez nos guides pour faire les meilleurs choix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/conseils"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-ink hover:text-primary transition-colors"
            >
              <span className="sm:hidden">Tout voir</span>
              <span className="hidden sm:inline">Voir tous les articles</span>
              <ArrowRight size={14} />
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Articles précédents"
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-white text-ink shadow-2xs hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Articles suivants"
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-white text-ink shadow-2xs hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Blog Cards Carousel ──────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-3.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {(items ? items.map((art) => ({
            slug: art.slug,
            title: art.title,
            excerpt: art.excerpt,
            category: art.category?.toUpperCase() || "GUIDE",
            categoryColor: "bg-primary",
            image: art.featuredImage || "/assets/blog/whey-sans-lactose-tunisie.webp",
            date: art.date || "2024",
          })) : FALLBACK_ARTICLES).map((post) => (
            <article
              key={post.slug}
              className="group flex w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:w-[19rem] sm:rounded-3xl"
            >
              {/* Cover Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 82vw, 19rem"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Category Pill Tag */}
                <span className={`absolute start-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-white shadow-sm ${post.categoryColor || "bg-primary"}`}>
                  {post.category}
                </span>
              </div>

              {/* Text Body */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-ink group-hover:text-primary transition-colors leading-snug">
                  <Link href={`/conseils/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="mt-2 line-clamp-2 text-xs text-ink-muted leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Footer Link & Date */}
                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
                  <Link
                    href={`/conseils/${post.slug}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>Lire l&apos;article</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="text-[0.6875rem] font-medium text-ink-muted">
                    {post.date}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
