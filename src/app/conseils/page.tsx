import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ChevronRight, User, Sparkles } from "lucide-react";
import { articles, type Article } from "@/lib/data/articles";

const SITE_URL = "https://paratunisie.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  title: "Conseils beauté & soins de la peau | ParaTunisie",
  description:
    "Guides pratiques, routines de soin et conseils d'experts pour prendre soin de votre peau, vos cheveux et votre corps. Parapharmacie en ligne en Tunisie.",
  alternates: { canonical: "/conseils" },
  openGraph: {
    type: "website",
    title: "Conseils beauté & soins | ParaTunisie",
    description: "Guides experts, routines et conseils parapharmaceutiques en Tunisie.",
    url: "/conseils",
  },
};

const CATEGORIES = [
  { label: "Tous", value: "" },
  { label: "Visage", value: "Visage" },
  { label: "Cheveux", value: "Cheveux" },
  { label: "Solaire", value: "Solaire" },
  { label: "Corps", value: "Corps" },
  { label: "Ingrédients", value: "Ingrédients" },
  { label: "Routines", value: "Routines" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Visage: "bg-rose-100 text-rose-700",
  Cheveux: "bg-amber-100 text-amber-700",
  Solaire: "bg-orange-100 text-orange-700",
  Corps: "bg-blue-100 text-blue-700",
  "Bébé & Maman": "bg-purple-100 text-purple-700",
  Ingrédients: "bg-emerald-100 text-emerald-700",
  Routines: "bg-pink-100 text-pink-700",
  "Guides d'achat": "bg-indigo-100 text-indigo-700",
  "Bien-être": "bg-teal-100 text-teal-700",
};

async function getPublishedArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${API_URL}/content/articles?status=PUBLISHED`, {
      next: { revalidate: 300 }, // 5 min cache
      signal: AbortSignal.timeout(1000),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data as Article[];
    return articles; // fallback to static
  } catch {
    return articles; // fallback to static
  }
}

export default async function ConseilsPage() {
  const allArticles = await getPublishedArticles();
  const featured = allArticles[0];
  const rest = allArticles.slice(1);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Conseils", item: `${SITE_URL}/conseils` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Conseils beauté ParaTunisie",
    itemListElement: allArticles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/conseils/${a.slug}`,
      name: a.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14">
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
            <li aria-current="page" className="text-ink">
              Conseils
            </li>
          </ol>
        </nav>

        {/* Hero section */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-primary" aria-hidden />
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              Notre expertise
            </p>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Conseils beauté & soins
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Guides pratiques, routines de soin et conseils d&apos;experts rédigés par notre équipe. Des
            informations fiables, sans jargon inutile, pour prendre soin de vous au quotidien.
          </p>
        </header>

        {/* Category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.value}
              href={cat.value ? `/conseils?categorie=${cat.value}` : "/conseils"}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                cat.value === ""
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-border text-ink-muted hover:border-primary hover:text-primary bg-surface-alt"
              }`}
            >
              {cat.label}
            </a>
          ))}
        </div>

        {/* Featured article */}
        {featured && (
          <div className="mb-12">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-3">
              À la une
            </p>
            <Link
              href={`/conseils/${featured.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface-alt flex flex-col lg:flex-row hover:shadow-[0_12px_40px_rgba(43,35,38,0.10)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Image placeholder / featured image */}
              <div className="lg:w-[42%] h-48 lg:h-auto bg-gradient-to-br from-primary/8 via-soft-nude to-primary/5 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border shrink-0 relative overflow-hidden">
                {(featured as Record<string, unknown>).featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(featured as Record<string, unknown>).featuredImage as string}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-primary/30">
                    <div className="w-16 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-serif text-3xl font-bold text-primary/20">A</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-primary/10" />
                    <div className="w-20 h-1.5 rounded-full bg-primary/10" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-6 lg:p-10">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${CATEGORY_COLORS[featured.category] ?? "bg-primary/10 text-primary"}`}
                  >
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1 text-[0.65rem] text-ink-muted">
                    <Clock size={11} aria-hidden />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="font-serif text-xl font-medium text-ink group-hover:text-primary transition-colors sm:text-2xl lg:text-3xl leading-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed line-clamp-3 max-w-prose">
                  {featured.excerpt}
                </p>
                {featured.authorName && (
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-ink-muted">
                    <User size={12} aria-hidden />
                    {featured.authorName}
                  </div>
                )}
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Lire l&apos;article
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Latest articles grid */}
        {rest.length > 0 && (
          <section aria-labelledby="latest-heading">
            <h2
              id="latest-heading"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-muted mb-5"
            >
              Derniers guides
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {allArticles.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={20} className="text-primary" />
            </div>
            <p className="text-base font-medium text-ink">Aucun article publié pour l&apos;instant</p>
            <p className="text-sm text-ink-muted">
              Nos conseils beauté seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Article card ─────────────────────────────────────────────────────── */

function ArticleCard({ article }: { article: Article }) {
  const authorName = (article as Record<string, unknown>).authorName as string | undefined;
  const featuredImage = (article as Record<string, unknown>).featuredImage as string | undefined;

  return (
    <Link
      href={`/conseils/${article.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-surface-alt overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(43,35,38,0.08)]"
    >
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-primary/8 via-soft-nude to-primary/5 flex items-center justify-center border-b border-border overflow-hidden">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col gap-2 items-center opacity-20">
            <div className="w-10 h-12 rounded-md bg-primary/40" />
            <div className="w-14 h-1 rounded-full bg-primary/40" />
            <div className="w-10 h-1 rounded-full bg-primary/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold ${CATEGORY_COLORS[article.category] ?? "bg-primary/10 text-primary"}`}
          >
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-[0.6rem] text-ink-muted">
            <Clock size={10} aria-hidden />
            {article.readTime}
          </span>
        </div>
        <h3 className="font-serif text-base font-medium text-ink group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-muted line-clamp-3">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          {authorName ? (
            <span className="flex items-center gap-1 text-[0.6rem] text-ink-faint">
              <User size={10} aria-hidden />
              {authorName}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
            Lire
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
