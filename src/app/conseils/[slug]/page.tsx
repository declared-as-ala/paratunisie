import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Package,
} from "lucide-react";

import { articles, getArticleBySlug, type Article } from "@/lib/data/articles";
import { getProductBySlug, formatPrice } from "@/lib/data/products";
import { ArticleProductCard } from "@/components/article/article-product-card";
import { ArticleProductComparison } from "@/components/article/article-product-comparison";
import { ArticleTableOfContents } from "@/components/article/article-table-of-contents";
import { ArticleFaq } from "@/components/article/article-faq";
import {
  ArticleTakeawayBox,
  ArticleDisclaimerBox,
  ArticleSourcesBox,
  ArticleEditorialAuthorBox,
} from "@/components/article/article-editorial-box";

const SITE_URL = "https://paratunisie.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getArticleImage(slug: string, apiImage?: string): string {
  if (apiImage && apiImage !== "/assets/hero-paratunisie.webp" && apiImage.trim() !== "") {
    return apiImage;
  }
  return `/assets/blog/${slug}.webp`;
}

async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const local = getArticleBySlug(slug);
  try {
    const res = await fetch(`${API_URL}/content/articles/by-slug/${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) {
        // Merge with local static full data if present
        return {
          ...local,
          ...data,
          featuredImage: getArticleImage(slug, data.featuredImage || local?.featuredImage),
        };
      }
    }
  } catch {
    // fallback to static
  }
  if (!local) return null;
  return {
    ...local,
    featuredImage: getArticleImage(slug, local.featuredImage),
  };
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return { title: "Article introuvable | ParaTunisie" };

  const title = article.seoTitle || `${article.h1} | ParaTunisie`;
  const description = article.seoDescription || article.excerpt;
  const canonical = `/conseils/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "ParaTunisie",
      locale: "fr_TN",
      images: [
        {
          url: article.featuredImage || "/assets/hero-paratunisie.webp",
          alt: article.imageAlt || article.title,
        },
      ],
      publishedTime: article.date,
      modifiedTime: article.updatedAt || article.date,
      authors: ["Équipe éditoriale ParaTunisie"],
      section: article.category,
      tags: [article.focusKeyword, ...article.secondaryKeywords],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.featuredImage || "/assets/hero-paratunisie.webp"],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) notFound();

  // Related articles
  const relatedArticles = article.relatedSlugs
    ? (article.relatedSlugs
        .map((s) => getArticleBySlug(s))
        .filter((a): a is Article => a !== undefined)
        .slice(0, 3))
    : articles.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);

  // TOC extracted from sections
  const tocItems = article.sections?.map((sec) => ({
    id: sec.anchor,
    text: sec.title,
    level: 2 as const,
  })) || [];

  // Schema.org Article / BlogPosting JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/conseils/${article.slug}`,
    },
    headline: article.h1,
    description: article.seoDescription || article.excerpt,
    image: [
      article.featuredImage?.startsWith("http")
        ? article.featuredImage
        : `${SITE_URL}${article.featuredImage || "/assets/hero-paratunisie.webp"}`,
    ],
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    author: {
      "@type": "Organization",
      name: "Équipe éditoriale ParaTunisie",
      url: `${SITE_URL}/politique-editoriale`,
    },
    publisher: {
      "@type": "Organization",
      name: "ParaTunisie",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/hero-paratunisie.webp`,
      },
    },
    articleSection: article.category,
    keywords: [article.focusKeyword, ...article.secondaryKeywords].join(", "),
  };

  // Schema.org BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Conseils",
        item: `${SITE_URL}/conseils`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.category,
        item: `${SITE_URL}/conseils?cat=${encodeURIComponent(article.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: `${SITE_URL}/conseils/${article.slug}`,
      },
    ],
  };

  // Schema.org FAQPage if FAQs exist
  const faqJsonLd =
    article.faqs && article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Bar */}
        <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-muted sm:text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true" className="text-ink-muted/40">/</li>
            <li>
              <Link href="/conseils" className="hover:text-primary transition-colors">
                Conseils
              </Link>
            </li>
            <li aria-hidden="true" className="text-ink-muted/40">/</li>
            <li>
              <Link
                href={`/conseils?cat=${encodeURIComponent(article.category)}`}
                className="hover:text-primary transition-colors font-medium text-ink-muted"
              >
                {article.category}
              </Link>
            </li>
            <li aria-hidden="true" className="text-ink-muted/40">/</li>
            <li aria-current="page" className="text-ink font-semibold line-clamp-1 max-w-[280px] sm:max-w-md">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Two-Column Responsive Layout */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-14">
          {/* Main Editorial Content (720px max readable width) */}
          <article className="min-w-0 max-w-[800px]">
            {/* Header Meta */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-ink-muted font-medium">
                  <Clock className="size-3.5" />
                  {article.readTime} de lecture
                </span>
                <span className="text-ink-muted/40">•</span>
                <span className="flex items-center gap-1 text-xs text-ink-muted font-medium">
                  <Calendar className="size-3.5" />
                  Mis à jour le {new Date(article.updatedAt || article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-[2.25rem] leading-tight">
                {article.h1}
              </h1>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted font-medium">
                {article.excerpt}
              </p>
            </header>

            {/* Hero Image */}
            {article.featuredImage && (
              <figure className="my-6 overflow-hidden rounded-2xl border border-border/80 bg-soft-nude/40">
                <div className="relative aspect-16/9 w-full">
                  <Image
                    src={article.featuredImage}
                    alt={article.imageAlt || article.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                </div>
                {article.imageAlt && (
                  <figcaption className="p-3 text-center text-[11px] italic text-ink-muted">
                    {article.imageAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* "À retenir en bref" Takeaways Box */}
            {article.takeaways && article.takeaways.length > 0 && (
              <ArticleTakeawayBox points={article.takeaways} />
            )}

            {/* Table of Contents */}
            {tocItems.length > 0 && <ArticleTableOfContents items={tocItems} />}

            {/* Optional Comparison Table if configured */}
            {article.comparisonProducts && article.comparisonProducts.length > 0 && (
              <ArticleProductComparison items={article.comparisonProducts} />
            )}

            {/* Main Sections */}
            <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed text-ink">
              {article.sections?.map((section) => (
                <section key={section.anchor} id={section.anchor} className="scroll-mt-24">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink mb-3.5 tracking-tight border-b border-border/40 pb-2">
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-ink-muted">
                    {section.content.map((p, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {section.subsections?.map((sub) => (
                    <div key={sub.anchor} id={sub.anchor} className="mt-5 pl-3 border-l-2 border-primary/40 scroll-mt-24">
                      <h3 className="font-serif text-lg font-bold text-ink mb-2">
                        {sub.title}
                      </h3>
                      <div className="space-y-3 text-ink-muted">
                        {sub.content.map((p, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>

            {/* Contextual Real Product Cards (2-4 products) */}
            {article.products && article.products.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border/80">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="size-5 text-primary" />
                  <h3 className="font-serif text-xl font-bold text-ink">
                    Produits authentiques recommandés dans ce guide
                  </h3>
                </div>
                <div className="space-y-4">
                  {article.products.map((item, idx) => (
                    <ArticleProductCard
                      key={item.productSlug || idx}
                      productSlug={item.productSlug}
                      rationale={item.rationale}
                      highlightBadge={item.highlightBadge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {article.faqs && article.faqs.length > 0 && (
              <ArticleFaq items={article.faqs} />
            )}

            {/* Scientific Sources */}
            {article.sources && article.sources.length > 0 && (
              <ArticleSourcesBox sources={article.sources} />
            )}

            {/* Medical Disclaimer Box */}
            <ArticleDisclaimerBox />

            {/* Editorial Author Box */}
            <ArticleEditorialAuthorBox
              publishedAt={article.date}
              updatedAt={article.updatedAt}
              authorName={article.authorName}
            />

            {/* Commercial Category Links (Topic Cluster Bridge) */}
            {article.relatedCategories && article.relatedCategories.length > 0 && (
              <div className="mt-8 rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-white p-6">
                <h4 className="font-serif text-base font-bold text-ink mb-2 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Explorer les rayons associés sur ParaTunisie
                </h4>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {article.relatedCategories.map((cat) => (
                    <Link
                      key={cat.url}
                      href={cat.url}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-border px-3.5 py-2 text-xs font-semibold text-ink hover:border-primary hover:text-primary transition-colors shadow-xs"
                    >
                      {cat.name}
                      <ArrowRight className="size-3 text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar (Desktop Sticky) */}
          <aside className="hidden lg:block space-y-6">
            {/* Quick Summary Card */}
            <div className="rounded-2xl border border-border/80 bg-white p-5 shadow-xs sticky top-24">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-ink mb-3 pb-2 border-b border-border/60">
                Dans ce guide
              </h4>
              <ul className="space-y-2 text-xs text-ink-muted">
                {article.sections?.map((sec) => (
                  <li key={sec.anchor}>
                    <a
                      href={`#${sec.anchor}`}
                      className="block hover:text-primary transition-colors leading-snug line-clamp-1"
                    >
                      • {sec.title}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Mentioned Products mini-list */}
              {article.products && article.products.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary block mb-2">
                    Produits cités ({article.products.length})
                  </span>
                  <div className="space-y-2">
                    {article.products.map((item, idx) => {
                      const prod = item.productSlug ? getProductBySlug(item.productSlug) : null;
                      if (!prod) return null;
                      return (
                        <Link
                          key={item.productSlug || idx}
                          href={`/produits/${prod.slug}`}
                          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-soft-nude/40 transition-colors group"
                        >
                          {prod.image ? (
                            <div className="relative size-8 shrink-0 rounded border border-border bg-white p-0.5">
                              <Image src={prod.image} alt={prod.name} fill sizes="32px" className="object-contain" />
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1 text-[11px]">
                            <p className="font-medium text-ink group-hover:text-primary line-clamp-1">{prod.name}</p>
                            <p className="font-tabular font-bold text-primary">{formatPrice(prod.priceMillimes)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guaranteed Authentic Badge */}
              <div className="mt-6 rounded-xl bg-soft-nude/50 p-3 text-center text-[11px] text-ink-muted">
                <p className="font-bold text-ink">✓ 100% Produits Originaux</p>
                <p className="mt-0.5 text-[10px]">Expédition rapide partout en Tunisie.</p>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Related Articles (Topic Cluster Internal Silo) ── */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 border-t border-border/80 pt-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-ink sm:text-2xl">
                  Articles & Guides complémentaires
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Approfondissez vos connaissances en nutrition sportive et micronutrition.
                </p>
              </div>
              <Link
                href="/conseils"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Tous nos guides
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((rel) => (
                <article
                  key={rel.slug}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-white p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {rel.category}
                      </span>
                      <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1">
                        <Clock className="size-3" />
                        {rel.readTime}
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/conseils/${rel.slug}`}>{rel.title}</Link>
                    </h4>

                    <p className="mt-2 text-xs text-ink-muted line-clamp-3 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-ink-muted">
                      {new Date(rel.date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                    </span>
                    <Link
                      href={`/conseils/${rel.slug}`}
                      className="font-semibold text-primary inline-flex items-center gap-1 group-hover:underline"
                    >
                      Lire le guide
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
