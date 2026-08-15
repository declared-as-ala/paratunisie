import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, User, ChevronRight, Calendar, Shield, Sparkles } from "lucide-react";

import { articles, getArticleBySlug, type Article } from "@/lib/data/articles";
import { products as mockProducts, formatPrice } from "@/lib/data/products";
import { ArticleBlockRenderer, extractTOC } from "@/components/article-block-renderer";

const SITE_URL = "https://paratunisie.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/* ── Data fetching ──────────────────────────────────────────────────── */

async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/content/articles/by-slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    return data ?? null;
  } catch {
    return getArticleBySlug(slug) ?? null;
  }
}

async function fetchRelatedArticles(category: string, currentSlug: string): Promise<Article[]> {
  try {
    const res = await fetch(
      `${API_URL}/content/articles?status=PUBLISHED&category=${encodeURIComponent(category)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return (Array.isArray(data) ? data : []).filter((a: Article) => a.slug !== currentSlug).slice(0, 3);
  } catch {
    return articles
      .filter((a) => a.category === category && a.slug !== currentSlug)
      .slice(0, 3);
  }
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
  if (!article) return { title: "Article introuvable" };

  const ext = article as Record<string, unknown>;
  const title = (ext.seoTitle as string) || article.title;
  const description = (ext.metaDescription as string) || article.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/conseils/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/conseils/${article.slug}`,
      images: ext.featuredImage ? [{ url: ext.featuredImage as string }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) notFound();

  const ext = article as Record<string, unknown>;
  const relatedArticles = await fetchRelatedArticles(article.category, article.slug);

  // Build TOC from content blocks
  const toc = extractTOC(article.content ?? "[]");

  // Linked products
  const linkedProducts = (
    Array.isArray(ext.products)
      ? (ext.products as { product?: Record<string, unknown>; productId?: string; rationale?: string }[])
      : []
  ).filter((p) => p.product);

  // FAQs
  const faqs = Array.isArray(ext.faqs)
    ? (ext.faqs as { question: string; answer: string }[])
    : [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: ext.publishedAt ?? article.date,
    dateModified: ext.updatedAt ?? article.date,
    author: {
      "@type": ext.authorName ? "Person" : "Organization",
      name: (ext.authorName as string) ?? "ParaTunisie",
    },
    publisher: {
      "@type": "Organization",
      name: "ParaTunisie",
      url: SITE_URL,
    },
    ...(ext.featuredImage ? { image: [ext.featuredImage as string] } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Conseils", item: `${SITE_URL}/conseils` },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}/conseils/${article.slug}`,
      },
    ],
  };

  const faqJsonLd = faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  const publishDate = ext.publishedAt
    ? new Date(ext.publishedAt as string).toLocaleDateString("fr-TN", { dateStyle: "long" })
    : article.date;

  const updatedDate = ext.updatedAt
    ? new Date(ext.updatedAt as string).toLocaleDateString("fr-TN", { dateStyle: "long" })
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

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
        <div className="lg:flex lg:gap-12 xl:gap-16">
          {/* ── Main content column ── */}
          <article className="min-w-0 max-w-[720px] flex-1">
            {/* Breadcrumb */}
            <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-ink-muted sm:text-sm">
              <ol className="flex items-center gap-1.5 sm:gap-2">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Accueil
                  </Link>
                </li>
                <li aria-hidden className="text-ink-muted/50">
                  /
                </li>
                <li>
                  <Link href="/conseils" className="hover:text-primary transition-colors">
                    Conseils
                  </Link>
                </li>
                <li aria-hidden className="text-ink-muted/50">
                  /
                </li>
                <li aria-current="page" className="text-ink line-clamp-1">
                  {article.title}
                </li>
              </ol>
            </nav>

            {/* Article header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-[0.65rem] text-ink-muted">
                  <Clock size={11} aria-hidden />
                  {article.readTime}
                </span>
              </div>

              <h1 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:text-4xl leading-tight">
                {article.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                {article.excerpt}
              </p>

              {/* Author & dates */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-ink-muted border-t border-border pt-4">
                {typeof ext.authorName === "string" && ext.authorName && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                      <User size={11} className="text-primary" />
                    </div>
                    <span className="font-medium text-ink">{ext.authorName}</span>
                  </div>
                )}
                {typeof ext.expertReviewer === "string" && ext.expertReviewer && (
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} className="text-emerald-600" />
                    <span>Relu par {ext.expertReviewer}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>
                    {publishDate}
                    {updatedDate && updatedDate !== publishDate && ` · Mis à jour le ${updatedDate}`}
                  </span>
                </div>
              </div>
            </header>

            {/* Featured image */}
            {typeof ext.featuredImage === "string" && ext.featuredImage && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ext.featuredImage}
                  alt={article.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "420px" }}
                  fetchPriority="high"
                />
              </div>
            )}

            {/* Content blocks */}
            {typeof article.content === "string" ? (
              <ArticleBlockRenderer content={article.content} />
            ) : Array.isArray(article.content) ? (
              /* Legacy format: array of paragraphs */
              <div className="space-y-5">
                {article.content.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-ink sm:text-base sm:leading-7">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {/* Product recommendations */}
            <section className="mt-12 border-t border-border pt-8" aria-labelledby="recommandations-heading">
              <h2
                id="recommandations-heading"
                className="font-serif text-xl sm:text-2xl font-medium text-ink mb-5 flex items-center gap-2"
              >
                <Sparkles className="text-primary size-5" />
                Soins recommandés dans cet article
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(linkedProducts.length > 0
                  ? linkedProducts
                  : mockProducts.slice(0, 2).map((p) => ({
                      product: {
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        image: p.image,
                        variants: [{ priceMillimes: p.priceMillimes }],
                      },
                      productId: p.id,
                      rationale: p.benefit,
                    }))
                ).map((ap) => {
                  const product = ap.product!;
                  const variant = Array.isArray(product.variants) && product.variants.length > 0
                    ? (product.variants[0] as { priceMillimes: number })
                    : null;
                  const price = variant?.priceMillimes
                    ? formatPrice(variant.priceMillimes)
                    : null;
                  const prodName = typeof product.name === "string" ? product.name : "";
                  const prodSlug = typeof product.slug === "string" ? product.slug : (product.id as string);
                  const prodImg = typeof product.image === "string" ? product.image : "";

                  return (
                    <div
                      key={ap.productId ?? (product.id as string)}
                      className="flex gap-3 rounded-2xl border border-border bg-surface-alt p-4 transition-all hover:border-primary/40 hover:shadow-xs"
                    >
                      {prodImg && (
                        <Link
                          href={`/produits/${prodSlug}`}
                          className="shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prodImg}
                            alt={prodName}
                            className="h-16 w-16 rounded-xl object-contain border border-border bg-white"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/produits/${prodSlug}`}
                          className="font-bold text-sm text-ink hover:text-primary transition-colors line-clamp-2"
                        >
                          {prodName}
                        </Link>
                        {price && (
                          <p className="text-sm font-extrabold text-primary font-tabular mt-1">{price}</p>
                        )}
                        {ap.rationale && (
                          <p className="text-xs text-ink-muted mt-1 line-clamp-2">{ap.rationale}</p>
                        )}
                        <Link
                          href={`/produits/${prodSlug}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                        >
                          Voir le produit
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* FAQ */}
            {faqs.length > 0 && (
              <section className="mt-12 border-t border-border pt-8" aria-labelledby="faq-heading">
                <h2
                  id="faq-heading"
                  className="font-serif text-xl font-medium text-ink mb-5"
                >
                  Questions fréquentes
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <details key={i} className="group rounded-xl border border-border bg-surface-alt">
                      <summary className="flex cursor-pointer items-start justify-between px-5 py-4 text-sm font-semibold text-ink select-none gap-3">
                        <span>{faq.question}</span>
                        <span className="shrink-0 text-primary group-open:rotate-180 transition-transform mt-0.5">▾</span>
                      </summary>
                      <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <section className="mt-12 border-t border-border pt-8" aria-labelledby="related-heading">
                <h2
                  id="related-heading"
                  className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-5"
                >
                  Lire aussi
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/conseils/${related.slug}`}
                      className="group rounded-xl border border-border bg-surface-alt p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-primary">
                          {related.category}
                        </span>
                        <span className="flex items-center gap-0.5 text-[0.6rem] text-ink-faint">
                          <Clock size={10} />
                          {related.readTime}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-ink group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Back link */}
            <div className="mt-12 border-t border-border pt-8">
              <Link
                href="/conseils"
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                ← Retour aux conseils
              </Link>
            </div>
          </article>

          {/* ── Sidebar (TOC) — visible lg+ ── */}
          {toc.length >= 3 && (
            <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
              <div className="sticky top-6">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-3">
                  Dans cet article
                </p>
                <nav aria-label="Table des matières">
                  <ul className="space-y-1.5">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className={`block text-xs leading-relaxed text-ink-muted hover:text-primary transition-colors ${
                            item.level === 3 ? "pl-3" : ""
                          }`}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
