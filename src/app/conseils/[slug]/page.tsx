import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import { articles, getArticleBySlug, type Article } from "@/lib/data/articles";
import { getProductBySlug, formatPrice } from "@/lib/data/products";
import { fetchProductBySlug, fetchSeoRedirect } from "@/lib/api/client";
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
import {
  buildArticleMetadata,
  buildArticleSchema,
  buildBreadcrumbsSchema,
  buildFaqSchema,
} from "@/lib/seo";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function renderFormattedText(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] && match[2]) {
      parts.push(
        <Link
          key={match.index}
          href={match[2]}
          className="font-bold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {match[1]}
        </Link>
      );
    } else if (match[3]) {
      parts.push(<strong key={match.index} className="font-bold text-ink">{match[3]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

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
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      // The API answers 200 with an empty body for unknown slugs; treat that as "not found", not an outage.
      const raw = await res.text();
      const data = raw.trim() ? JSON.parse(raw) : null;
      if (data && data.slug) {
        let blocks: { type?: string; text?: string }[] = [];
        try { blocks = JSON.parse(data.content || "[]"); } catch {}
        const sections: Article['sections'] = [];
        // Structured editorial blocks stored in the same JSON: sources, key takeaways and related links (rendered by the dedicated components).
        const blockSources: Article['sources'] = [];
        const blockTakeaways: string[] = [];
        const blockCategories: Article['relatedCategories'] = [];
        const blockRelated: string[] = [];
        const catalogueResponse = await fetch(`${API_URL}/catalogue/sitemap-data`, { cache: 'no-store' });
        const catalogue = catalogueResponse.ok ? await catalogueResponse.json() : { products: [] };
        const productPaths = new Set((catalogue.products || []).map((product: { slug: string }) => `/produits/${product.slug}`));
        for (const block of Array.isArray(blocks) ? blocks : []) {
          const typed = block as { type?: string; items?: { title?: string; url?: string; org?: string }[] | string[]; categories?: { name: string; url: string }[]; articles?: string[] };
          if (typed.type === 'sources' && Array.isArray(typed.items)) { for (const it of typed.items as { title?: string; url?: string; org?: string }[]) if (it?.title && it?.url && /^https:\/\//.test(it.url)) blockSources.push({ title: it.title, url: it.url, org: it.org }); continue; }
          if (typed.type === 'takeaways' && Array.isArray(typed.items)) { for (const it of typed.items as string[]) if (typeof it === 'string' && it.trim()) blockTakeaways.push(it); continue; }
          if (typed.type === 'related') { for (const c of typed.categories || []) if (c?.name && c?.url?.startsWith('/')) blockCategories.push(c); for (const a of typed.articles || []) if (typeof a === 'string') blockRelated.push(a); continue; }
          if (!block.text) continue;
          if (block.type === 'heading' || block.type === 'heading2' || !sections.length) sections.push({ title: (block.type === 'heading' || block.type === 'heading2') ? block.text : data.title, anchor: `section-${sections.length + 1}`, content: [] });
          if (block.type !== 'heading' && block.type !== 'heading2') sections[sections.length - 1].content.push(block.text.replace(/\[([^\]]+)\]\((\/produits\/[^)]+)\)/g, (match, label, path) => productPaths.has(path) ? match : label));
        }
        return {
          ...local,
          ...data,
          h1: data.title,
          seoDescription: data.metaDescription || data.excerpt,
          focusKeyword: (data.targetKeyword || "").split(",")[0].trim(),
          secondaryKeywords: (data.targetKeyword || "").split(",").slice(1).map((value: string) => value.trim()),
          imageAlt: data.imageAlt || data.title,
          sections: sections.length > 0 ? sections : (local?.sections || []),
          takeaways: blockTakeaways.length ? blockTakeaways : (local?.takeaways || []),
          sources: blockSources.length ? blockSources : (local?.sources || []),
          relatedSlugs: blockRelated.length ? blockRelated : (local?.relatedSlugs || []),
          relatedCategories: blockCategories.length ? blockCategories : (local?.relatedCategories || []),
          products: (data.products || []).map((item: { product?: { slug: string; name: string }; rationale?: string }) => ({ productSlug: item.product?.slug, productName: item.product?.name, rationale: item.rationale })),
          featuredImage: getArticleImage(slug, data.featuredImage || local?.featuredImage),
        };
      }
      return null;
    }
  } catch {
    if (process.env.NODE_ENV === 'production') throw new Error('Article service unavailable');
    // fallback to static
  }
  if (!local || process.env.NODE_ENV === 'production') return null;
  return {
    ...local,
    featuredImage: getArticleImage(slug, local.featuredImage),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return { title: "Article introuvable | ParaTunisie" };

  return buildArticleMetadata({
    ...article,
    title: article.seoTitle || article.h1,
    slug: article.slug,
    metaDescription: article.seoDescription,
    excerpt: article.excerpt,
    image: article.featuredImage,
    indexable: article.indexable,
    publishedAt: article.date,
    updatedAt: article.updatedAt,
    tags: [article.focusKeyword, ...(article.secondaryKeywords || [])],
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) {
    const target = await fetchSeoRedirect(`/conseils/${slug}`);
    if (target) permanentRedirect(target);
    notFound();
  }
  const linkedProducts = await Promise.all((article.products || []).map(async (item) => item.productSlug ? fetchProductBySlug(item.productSlug) : null));
  const liveProducts = new Map(linkedProducts.filter((product) => product !== null).map((product) => [product.slug, product]));
  article.products = (article.products || []).filter((item) => item.productSlug && liveProducts.has(item.productSlug));

  // Related articles (merge DB published articles with static fallback so new DB articles resolve)
  let relatedArticles: Article[] = [];
  try {
    const relRes = await fetch(`${API_URL}/content/articles?status=PUBLISHED`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (relRes.ok) {
      const allDbArticles: Article[] = await relRes.json();
      if (Array.isArray(allDbArticles) && allDbArticles.length > 0) {
        if (article.relatedSlugs && article.relatedSlugs.length > 0) {
          relatedArticles = article.relatedSlugs
            .map((s) => allDbArticles.find((a) => a.slug === s) || getArticleBySlug(s))
            .filter((a): a is Article => Boolean(a))
            .slice(0, 3);
        }
        if (relatedArticles.length === 0) {
          relatedArticles = allDbArticles
            .filter((a) => a.category === article.category && a.slug !== article.slug)
            .slice(0, 3);
        }
      }
    }
  } catch {}
  if (relatedArticles.length === 0) {
    relatedArticles = article.relatedSlugs
      ? (article.relatedSlugs
          .map((s) => getArticleBySlug(s))
          .filter((a): a is Article => a !== undefined)
          .slice(0, 3))
      : articles.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);
  }

  // TOC extracted from sections
  const tocItems = article.sections?.map((sec) => ({
    id: sec.anchor,
    text: sec.title,
    level: 2 as const,
  })) || [];

  const articleJsonLd = buildArticleSchema({
    title: article.h1,
    slug: article.slug,
    description: article.seoDescription || article.excerpt,
    image: article.featuredImage,
    publishedAt: article.date,
    updatedAt: article.updatedAt,
    authorName: article.authorName,
  });

  const breadcrumbJsonLd = buildBreadcrumbsSchema([
    { name: "Accueil", url: "/" },
    { name: "Conseils", url: "/conseils" },
    { name: article.category, url: `/conseils?cat=${encodeURIComponent(article.category)}` },
    { name: article.title, url: `/conseils/${article.slug}` },
  ]);

  const faqJsonLd =
    article.faqs && article.faqs.length > 0
      ? buildFaqSchema(article.faqs)
      : null;

  const isArabic = /[\u0600-\u06FF]/.test(article.h1 || article.title);

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
          {/* Main Editorial Content */}
          <article dir={isArabic ? "rtl" : undefined} lang={isArabic ? "ar-TN" : undefined} className="min-w-0 max-w-[800px]">
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
                        {renderFormattedText(p)}
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
                            {renderFormattedText(p)}
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
                      initialProduct={item.productSlug ? liveProducts.get(item.productSlug) : undefined}
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

            {/* Commercial Category Links */}
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
                      const prod = item.productSlug ? liveProducts.get(item.productSlug) : null;
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

        {/* Related Articles */}
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
