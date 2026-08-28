"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Globe,
  FileText,
  CheckCircle2,
  Clock,
  Copy,
  Archive,
  BookOpen,
  RefreshCw,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";
import { ArticleDrawer, type ArticleFormData } from "@/components/article-drawer";
import { SeoCompletenessScore, computeSeoScore } from "@/components/seo-completeness-score";

/* ── Types ─────────────────────────────────────────────────────────────── */

type ArticleStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  authorName?: string;
  expertReviewer?: string;
  category: string;
  readTime: string;
  featuredImage?: string;
  publishedAt?: string;
  scheduledFor?: string;
  updatedAt: string;
  createdAt: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  indexable: boolean;
  ogImage?: string;
  targetKeyword?: string;
  products?: { productId: string; productName?: string }[];
  brands?: { brandId: string }[];
  concerns?: { concernId: string }[];
  faqs?: { id: string; question: string; answer: string }[];
}

const EDITORIAL_CATEGORIES = [
  "Créatine",
  "Protéines & Masse",
  "Performance",
  "Acides Aminés",
  "Vitamines & Santé",
  "Bien-être",
  "Sèche & Minceur",
  "Débutants",
];

const STATUS_CONFIG: Record<ArticleStatus, { label: string; color: string; dot: string }> = {
  PUBLISHED: { label: "Publié", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", dot: "bg-emerald-500" },
  DRAFT: { label: "Brouillon", color: "bg-amber-500/10 text-amber-700 border-amber-500/20", dot: "bg-amber-500" },
  SCHEDULED: { label: "Planifié", color: "bg-blue-500/10 text-blue-700 border-blue-500/20", dot: "bg-blue-500" },
  ARCHIVED: { label: "Archivé", color: "bg-slate-200 text-slate-600 border-slate-300", dot: "bg-slate-400" },
};

function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("paratunisie.com")) {
      return "https://paratunisie.com/api/v1";
    }
  }
  return process.env.API_URL || "http://localhost:3001/api/v1";
}

/* ── Main component ──────────────────────────────────────────────────── */

export default function ArticlesPage() {
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [seoFilter, setSeoFilter] = useState<string>("ALL"); // ALL | INCOMPLETE | COMPLETE
  const [productsFilter, setProductsFilter] = useState<string>("ALL"); // ALL | NONE | WITH

  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Article | null>(null);

  /* ── Fetch from API ── */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/content/articles`, { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (Array.isArray(data)) {
        setArticles(data);
        setApiAvailable(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("paratunisie_admin_articles", JSON.stringify(data));
        }
      }
    } catch {
      setApiAvailable(false);
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("paratunisie_admin_articles");
        if (cached) {
          try {
            setArticles(JSON.parse(cached));
          } catch {
            /* ignore */
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === "PUBLISHED").length;
    const drafts = articles.filter((a) => a.status === "DRAFT").length;
    const scheduled = articles.filter((a) => a.status === "SCHEDULED").length;
    const seoIncomplete = articles.filter((a) => {
      const score = computeSeoScore({
        ...a,
        products: (a.products ?? []).map((p) => ({ id: p.productId })),
      });
      return score.score < 9;
    }).length;
    return { published, drafts, scheduled, seoIncomplete };
  }, [articles]);

  /* ── Filters ── */
  const filtered = useMemo(() => {
    let list = [...articles];
    if (statusFilter !== "ALL") list = list.filter((a) => a.status === statusFilter);
    if (categoryFilter !== "ALL") list = list.filter((a) => a.category === categoryFilter);
    if (seoFilter === "INCOMPLETE") {
      list = list.filter((a) => {
        const s = computeSeoScore({ ...a, products: (a.products ?? []).map((p) => ({ id: p.productId })) });
        return s.score < 9;
      });
    } else if (seoFilter === "COMPLETE") {
      list = list.filter((a) => {
        const s = computeSeoScore({ ...a, products: (a.products ?? []).map((p) => ({ id: p.productId })) });
        return s.score >= 9;
      });
    }
    if (productsFilter === "NONE") list = list.filter((a) => (a.products?.length ?? 0) === 0);
    if (productsFilter === "WITH") list = list.filter((a) => (a.products?.length ?? 0) > 0);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.authorName ?? "").toLowerCase().includes(q) ||
          (a.targetKeyword ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [articles, search, statusFilter, categoryFilter, seoFilter, productsFilter]);

  /* ── Actions ── */
  async function handleSaveArticle(data: ArticleFormData, _action: "draft" | "publish") {
    const baseUrl = getApiBaseUrl();
    if (apiAvailable) {
      const isNew = !data.id;
      const url = isNew ? `${baseUrl}/content/articles` : `${baseUrl}/content/articles/${data.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          productIds: data.products.map((p, i) => ({
            productId: p.productId,
            rationale: p.rationale,
            position: i,
          })),
          faqs: data.faqs,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const savedArticle = await res.json();

      setArticles((prev) => {
        const next = data.id
          ? prev.map((a) => (a.id === data.id ? { ...a, ...savedArticle, featuredImage: data.featuredImage || savedArticle.featuredImage } : a))
          : [savedArticle, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("paratunisie_admin_articles", JSON.stringify(next));
        }
        return next;
      });

      await fetchArticles();
    } else {
      // Local fallback
      const article: Article = {
        id: data.id ?? `local-${Date.now()}`,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        status: (data.status as ArticleStatus) ?? "DRAFT",
        authorName: data.authorName,
        category: data.category,
        readTime: data.readTime,
        featuredImage: data.featuredImage,
        publishedAt: data.publishedAt,
        updatedAt: new Date().toISOString(),
        createdAt: data.id ? articles.find((a) => a.id === data.id)?.createdAt ?? new Date().toISOString() : new Date().toISOString(),
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        indexable: data.indexable,
        ogImage: data.ogImage,
        targetKeyword: data.targetKeyword,
        products: data.products.map((p) => ({ productId: p.productId })),
        faqs: data.faqs.map((f, i) => ({ id: f.id ?? `faq-${i}`, question: f.question, answer: f.answer })),
      };
      setArticles((prev) => {
        const next = data.id ? prev.map((a) => (a.id === data.id ? article : a)) : [article, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("paratunisie_admin_articles", JSON.stringify(next));
        }
        return next;
      });
    }
  }

  function handleOpenNew() {
    setEditTarget(null);
    setDrawerOpen(true);
  }

  function handleOpenEdit(article: Article) {
    setEditTarget(article);
    setDrawerOpen(true);
  }

  async function handleToggleStatus(article: Article) {
    const baseUrl = getApiBaseUrl();
    const newStatus: ArticleStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    if (apiAvailable) {
      await fetch(`${baseUrl}/content/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchArticles();
    } else {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id
            ? {
                ...a,
                status: newStatus,
                publishedAt: newStatus === "PUBLISHED" && !a.publishedAt ? new Date().toISOString() : a.publishedAt,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );
    }
    toast("success", `Article « ${article.title} » ${newStatus === "PUBLISHED" ? "publié" : "mis en brouillon"}.`);
  }

  async function handleDuplicate(article: Article) {
    const baseUrl = getApiBaseUrl();
    if (apiAvailable) {
      await fetch(`${baseUrl}/content/articles/${article.id}/duplicate`, { method: "POST" });
      await fetchArticles();
    } else {
      const copy: Article = {
        ...article,
        id: `local-${Date.now()}`,
        title: `${article.title} (copie)`,
        slug: `${article.slug}-copie`,
        status: "DRAFT",
        publishedAt: undefined,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setArticles((prev) => [copy, ...prev]);
    }
    toast("success", "Article dupliqué.");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const baseUrl = getApiBaseUrl();
    if (apiAvailable) {
      await fetch(`${baseUrl}/content/articles/${deleteTarget.id}`, { method: "DELETE" });
      await fetchArticles();
    } else {
      setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    }
    toast("success", `Article « ${deleteTarget.title} » supprimé.`);
    setDeleteTarget(null);
  }

  /* ── Drawer article → form ── */
  function toFormData(article: Article | null): ArticleFormData | null {
    if (!article) return null;
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      authorName: article.authorName ?? "",
      expertReviewer: article.expertReviewer ?? "",
      status: article.status,
      featuredImage: article.featuredImage ?? "",
      readTime: article.readTime,
      scheduledFor: article.scheduledFor ?? "",
      publishedAt: article.publishedAt,
      content: article.content,
      seoTitle: article.seoTitle ?? "",
      metaDescription: article.metaDescription ?? "",
      canonicalUrl: article.canonicalUrl ?? "",
      indexable: article.indexable,
      ogTitle: "",
      ogDescription: "",
      ogImage: article.ogImage ?? "",
      targetKeyword: article.targetKeyword ?? "",
      products: (article.products ?? []).map((p) => ({
        productId: p.productId,
        productName: p.productName ?? p.productId,
      })),
      brandIds: (article.brands ?? []).map((b) => b.brandId),
      concernIds: (article.concerns ?? []).map((c) => c.concernId),
      faqs: (article.faqs ?? []).map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
      updatedAt: article.updatedAt,
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink">Conseils & Articles</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              {articles.length} articles
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Contenu éditorial SEO — conseils beauté, routines, guides d&apos;achat
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!apiAvailable && !loading && (
            <span className="text-[0.625rem] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 font-semibold">
              Mode hors-ligne
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchArticles()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-soft-nude transition-all"
          >
            <RefreshCw size={13} />
            Actualiser
          </button>
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition-all shadow-xs"
          >
            <Plus size={15} />
            Nouvel Article
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Publiés"
          value={stats.published}
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          accent="border-l-emerald-500"
          valueColor="text-emerald-600"
        />
        <KpiCard
          label="Brouillons"
          value={stats.drafts}
          icon={<FileText size={16} className="text-amber-500" />}
          accent="border-l-amber-500"
          valueColor="text-amber-600"
        />
        <KpiCard
          label="Planifiés"
          value={stats.scheduled}
          icon={<Clock size={16} className="text-blue-500" />}
          accent="border-l-blue-500"
          valueColor="text-blue-600"
        />
        <KpiCard
          label="SEO incomplet"
          value={stats.seoIncomplete}
          icon={<Globe size={16} className="text-primary" />}
          accent="border-l-primary"
          valueColor="text-primary"
          hint="Articles publiés avec score SEO < 9/11"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Titre, slug, auteur, mot-clé…"
            className="w-full rounded-xl border border-border bg-surface-alt pl-9 pr-3 py-2 text-xs placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="DRAFT">Brouillons</option>
          <option value="SCHEDULED">Planifiés</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="ALL">Toutes les catégories</option>
          {EDITORIAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={seoFilter}
          onChange={(e) => setSeoFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="ALL">SEO — tous</option>
          <option value="INCOMPLETE">SEO incomplet</option>
          <option value="COMPLETE">SEO complet</option>
        </select>
        <select
          value={productsFilter}
          onChange={(e) => setProductsFilter(e.target.value)}
          className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="ALL">Produits — tous</option>
          <option value="NONE">Sans produits</option>
          <option value="WITH">Avec produits</option>
        </select>
        {(search || statusFilter !== "ALL" || categoryFilter !== "ALL" || seoFilter !== "ALL" || productsFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setCategoryFilter("ALL");
              setSeoFilter("ALL");
              setProductsFilter("ALL");
            }}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-primary transition-colors"
          >
            <Filter size={12} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-alt">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={18} className="text-primary animate-spin" />
              <p className="text-xs text-ink-muted">Chargement des articles…</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-soft-nude/40 text-[0.6875rem] uppercase tracking-wider font-semibold text-ink-muted">
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4 hidden md:table-cell">Auteur</th>
                <th className="py-3 px-4 hidden lg:table-cell">Catégorie</th>
                <th className="py-3 px-4 hidden sm:table-cell">Publication</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 hidden xl:table-cell">SEO</th>
                <th className="py-3 px-4 hidden lg:table-cell text-center">Produits</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <BookOpen size={24} className="mx-auto text-ink-faint mb-2" />
                    <p className="text-xs text-ink-muted">Aucun article trouvé</p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-2 text-xs text-primary hover:underline"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((article) => {
                  const statusCfg = STATUS_CONFIG[article.status] ?? STATUS_CONFIG.DRAFT;
                  const seoScore = computeSeoScore({
                    ...article,
                    products: (article.products ?? []).map((p) => ({ id: p.productId })),
                  });
                  return (
                    <tr key={article.id} className="hover:bg-soft-nude/30 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {article.featuredImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="h-9 w-9 rounded-md object-cover border border-border bg-soft-nude shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-md bg-soft-nude border border-border flex items-center justify-center shrink-0">
                              <BookOpen size={13} className="text-ink-faint" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-ink text-xs truncate max-w-[180px]">{article.title}</p>
                            <p className="text-[0.6875rem] font-mono text-primary/80 truncate">/{article.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell text-ink-muted font-medium">
                        {article.authorName ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        <span className="px-2.5 py-0.5 rounded-full text-[0.625rem] font-semibold bg-soft-nude text-ink-muted border border-border/40">
                          {article.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden sm:table-cell text-ink-muted">
                        {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border ${statusCfg.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 hidden xl:table-cell">
                        <SeoCompletenessScore
                          article={{
                            ...article,
                            products: (article.products ?? []).map((p) => ({ id: p.productId })),
                          }}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 hidden lg:table-cell text-center">
                        <span
                          className={`inline-flex items-center justify-center h-6 min-w-[1.5rem] rounded-full text-[0.6rem] font-bold px-1.5 ${
                            (article.products?.length ?? 0) > 0
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-soft-nude text-ink-faint border border-border"
                          }`}
                        >
                          {article.products?.length ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`http://localhost:3000/conseils/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Voir l'article"
                          >
                            <Eye size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(article)}
                            className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Dupliquer"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(article)}
                            className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted hover:text-ink"
                            title={article.status === "PUBLISHED" ? "Mettre en brouillon" : "Publier"}
                          >
                            {article.status === "PUBLISHED" ? <Archive size={13} /> : <Globe size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(article)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(article)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-[0.6875rem] text-ink-faint">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""} sur {articles.length}
        </p>
      )}

      {/* Article drawer */}
      <ArticleDrawer
        open={drawerOpen}
        article={toFormData(editTarget)}
        onClose={() => {
          setDrawerOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSaveArticle}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Supprimer l'article"
        description={`Supprimer définitivement « ${deleteTarget?.title} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  accent,
  valueColor,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  valueColor: string;
  hint?: string;
}) {
  return (
    <div className={`glass-card p-4 border-l-2 ${accent}`} title={hint}>
      <div className="flex items-center justify-between">
        <span className="text-[0.6875rem] font-semibold text-ink-muted uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className={`text-xl font-extrabold mt-1 tabular-nums ${valueColor}`}>{value}</p>
      {hint && <p className="text-[0.5625rem] text-ink-faint mt-0.5">{hint}</p>}
    </div>
  );
}
