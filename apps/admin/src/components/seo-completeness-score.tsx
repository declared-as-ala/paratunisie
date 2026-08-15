"use client";

interface SeoCompletenessProps {
  article: {
    seoTitle?: string | null;
    metaDescription?: string | null;
    slug?: string | null;
    featuredImage?: string | null;
    ogImage?: string | null;
    canonicalUrl?: string | null;
    indexable?: boolean;
    products?: { id: string }[];
    category?: string | null;
    authorName?: string | null;
    updatedAt?: string | null;
  };
  size?: "sm" | "md";
}

const CHECKS = [
  { key: "seoTitle", label: "Titre SEO" },
  { key: "metaDescription", label: "Méta description" },
  { key: "slug", label: "Slug" },
  { key: "featuredImage", label: "Image principale" },
  { key: "ogImage", label: "OG Image" },
  { key: "canonical", label: "Canonical" },
  { key: "indexable", label: "Indexable" },
  { key: "products", label: "Produits liés" },
  { key: "category", label: "Catégorie" },
  { key: "author", label: "Auteur" },
  { key: "freshness", label: "Fraîcheur (< 6 mois)" },
] as const;

export function computeSeoScore(article: SeoCompletenessProps["article"]): {
  score: number;
  total: number;
  checks: { label: string; passed: boolean }[];
} {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const checks = [
    { label: "Titre SEO", passed: !!article.seoTitle?.trim() },
    { label: "Méta description", passed: !!article.metaDescription?.trim() },
    { label: "Slug", passed: !!article.slug?.trim() },
    { label: "Image principale", passed: !!article.featuredImage?.trim() },
    { label: "OG Image", passed: !!article.ogImage?.trim() },
    { label: "Canonical", passed: !!article.canonicalUrl?.trim() },
    { label: "Indexable", passed: article.indexable !== false },
    { label: "Produits liés", passed: (article.products?.length ?? 0) > 0 },
    { label: "Catégorie", passed: !!article.category?.trim() },
    { label: "Auteur", passed: !!article.authorName?.trim() },
    {
      label: "Fraîcheur (< 6 mois)",
      passed: !!article.updatedAt && new Date(article.updatedAt) > sixMonthsAgo,
    },
  ];

  const score = checks.filter((c) => c.passed).length;
  return { score, total: CHECKS.length, checks };
}

export function SeoCompletenessScore({ article, size = "sm" }: SeoCompletenessProps) {
  const { score, total } = computeSeoScore(article);
  const ratio = score / total;

  const color =
    ratio >= 0.82
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      : ratio >= 0.55
      ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
      : "bg-rose-500/10 text-rose-700 border-rose-500/20";

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold tabular-nums ${color}`}
        title={`SEO Complétude: ${score}/${total} critères remplis`}
      >
        SEO {score}/{total}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">
          Complétude SEO
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums ${color}`}
        >
          {score} / {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            ratio >= 0.82 ? "bg-emerald-500" : ratio >= 0.55 ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${(score / total) * 100}%` }}
        />
      </div>
      <p className="text-[0.625rem] text-ink-faint">
        Indicateur interne de qualité éditoriale — non lié au classement Google.
      </p>
    </div>
  );
}
