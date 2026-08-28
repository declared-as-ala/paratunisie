"use client";

import { useState, useCallback, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Globe,
  FileText,
  Image as ImageIcon,
  Tag,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Drawer } from "@/components/drawer";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@/components/confirm-modal";
import { UnsavedChangesModal } from "@/components/unsaved-changes-modal";
import { MediaUploader } from "@/components/media-uploader";
import { SeoFormSection } from "@/components/seo-form-section";
import { SeoCompletenessScore, computeSeoScore } from "@/components/seo-completeness-score";

/* ── Types ─────────────────────────────────────────────────────────────── */

const EDITORIAL_CATEGORIES = [
  "Créatine",
  "Protéines & Masse",
  "Performance",
  "Acides Aminés",
  "Vitamines & Santé",
  "Bien-être",
  "Sèche & Minceur",
  "Débutants",
] as const;

const ARTICLE_STATUSES = [
  { value: "DRAFT", label: "Brouillon", color: "text-amber-700" },
  { value: "PUBLISHED", label: "Publié", color: "text-emerald-700" },
  { value: "SCHEDULED", label: "Planifié", color: "text-blue-700" },
  { value: "ARCHIVED", label: "Archivé", color: "text-ink-muted" },
] as const;

interface ArticleProduct {
  productId: string;
  productName: string;
  productImage?: string;
  rationale?: string;
  position?: number;
}

interface ArticleFaq {
  id?: string;
  question: string;
  answer: string;
  position?: number;
}

export interface ArticleFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  authorName: string;
  expertReviewer: string;
  status: string;
  featuredImage: string;
  readTime: string;
  scheduledFor: string;
  publishedAt?: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  indexable: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  targetKeyword: string;
  products: ArticleProduct[];
  brandIds: string[];
  concernIds: string[];
  faqs: ArticleFaq[];
  updatedAt?: string;
}

interface ApiProduct {
  id: string;
  name: string;
  image: string;
}

interface ArticleDrawerProps {
  open: boolean;
  article: ArticleFormData | null;
  onClose: () => void;
  onSave: (article: ArticleFormData, action: "draft" | "publish") => Promise<void>;
}

type Tab = "info" | "media" | "content" | "relations" | "seo";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "info", label: "Informations", icon: FileText },
  { id: "media", label: "Médias", icon: ImageIcon },
  { id: "content", label: "Contenu", icon: BookOpen },
  { id: "relations", label: "Produits & Liens", icon: Tag },
  { id: "seo", label: "SEO", icon: Globe },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function emptyForm(): ArticleFormData {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: "Visage",
    authorName: "Dr. Amira Selmi",
    expertReviewer: "",
    status: "DRAFT",
    featuredImage: "",
    readTime: "5 min",
    scheduledFor: "",
    content: "[]",
    seoTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    indexable: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    targetKeyword: "",
    products: [],
    brandIds: [],
    concernIds: [],
    faqs: [],
  };
}

/* ── Main component ──────────────────────────────────────────────────── */

export function ArticleDrawer({ open, article, onClose, onSave }: ArticleDrawerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [form, setForm] = useState<ArticleFormData>(emptyForm());
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [availableProducts, setAvailableProducts] = useState<ApiProduct[]>([]);
  const [showDeleteFaq, setShowDeleteFaq] = useState<number | null>(null);
  const [faqExpanded, setFaqExpanded] = useState<number[]>([]);

  /* Reset form when drawer opens */
  const formKey = open ? (article?.id ?? "new") : "closed";
  const [lastKey, setLastKey] = useState(formKey);
  if (formKey !== lastKey) {
    setLastKey(formKey);
    if (open) {
      setForm(
        article
          ? { ...emptyForm(), ...article }
          : emptyForm()
      );
      setIsDirty(false);
      setActiveTab("info");
    }
  }

  /* Fetch products for relation panel */
  useEffect(() => {
    if (!open) return;
    fetch("http://localhost:3001/catalogue/products")
      .then((r) => r.json())
      .then((data: ApiProduct[]) => setAvailableProducts(Array.isArray(data) ? data : []))
      .catch(() => {
        /* fallback — no products available */
      });
  }, [open]);

  const update = useCallback((field: keyof ArticleFormData, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug from title if slug is empty
      if (field === "title" && !prev.slug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
    setIsDirty(true);
  }, []);

  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowUnsaved(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleSave = useCallback(
    async (action: "draft" | "publish") => {
      if (!form.title.trim()) {
        toast("error", "Le titre de l'article est obligatoire.");
        return;
      }
      if (!form.excerpt.trim()) {
        toast("error", "L'extrait est obligatoire.");
        return;
      }
      setIsSaving(true);
      try {
        const toSave: ArticleFormData = {
          ...form,
          status: action === "publish" ? "PUBLISHED" : form.status === "PUBLISHED" ? "PUBLISHED" : form.status,
          slug: form.slug || slugify(form.title),
        };
        await onSave(toSave, action);
        setIsDirty(false);
        toast(
          "success",
          action === "publish" ? "Article publié avec succès." : "Article enregistré."
        );
        onClose();
      } catch {
        toast("error", "Erreur lors de l'enregistrement.");
      } finally {
        setIsSaving(false);
      }
    },
    [form, onSave, onClose, toast]
  );

  const addProduct = useCallback(
    (product: ApiProduct) => {
      if (form.products.some((p) => p.productId === product.id)) return;
      update("products", [
        ...form.products,
        { productId: product.id, productName: product.name, productImage: product.image, rationale: "", position: form.products.length },
      ]);
    },
    [form.products, update]
  );

  const removeProduct = useCallback(
    (productId: string) => {
      update(
        "products",
        form.products.filter((p) => p.productId !== productId)
      );
    },
    [form.products, update]
  );

  const updateProductRationale = useCallback(
    (productId: string, rationale: string) => {
      update(
        "products",
        form.products.map((p) => (p.productId === productId ? { ...p, rationale } : p))
      );
    },
    [form.products, update]
  );

  const addFaq = useCallback(() => {
    const newFaqs = [...form.faqs, { question: "", answer: "", position: form.faqs.length }];
    update("faqs", newFaqs);
    setFaqExpanded((prev) => [...prev, newFaqs.length - 1]);
  }, [form.faqs, update]);

  const removeFaq = useCallback(
    (idx: number) => {
      update(
        "faqs",
        form.faqs.filter((_, i) => i !== idx).map((f, i) => ({ ...f, position: i }))
      );
      setShowDeleteFaq(null);
    },
    [form.faqs, update]
  );

  const updateFaq = useCallback(
    (idx: number, field: "question" | "answer", value: string) => {
      update(
        "faqs",
        form.faqs.map((f, i) => (i === idx ? { ...f, [field]: value } : f))
      );
    },
    [form.faqs, update]
  );

  const seoScore = computeSeoScore({
    ...form,
    products: form.products.map((p) => ({ id: p.productId })),
  });

  const filteredProducts = availableProducts.filter(
    (p) =>
      !form.products.some((fp) => fp.productId === p.id) &&
      (productSearch === "" || p.name.toLowerCase().includes(productSearch.toLowerCase()))
  );

  /* ── Content blocks (simplified textarea for now) ── */
  let contentBlocks: string[] = [];
  try {
    const parsed = JSON.parse(form.content);
    if (Array.isArray(parsed)) {
      contentBlocks = parsed
        .map((b) => {
          if (typeof b === "string") return b;
          if (b?.type === "paragraph") return b.text;
          return "";
        })
        .filter(Boolean);
    }
  } catch {
    contentBlocks = [];
  }

  return (
    <>
      <Drawer
        open={open}
        title={article ? "Modifier l'article" : "Nouvel article"}
        description={article ? article.title : "Créer un nouveau conseil ou guide"}
        onClose={handleClose}
        footer={
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-ink-muted hover:bg-soft-nude transition-colors"
            >
              Annuler
            </button>
            <div className="flex-1" />
            {seoScore.score < 9 && (
              <span className="flex items-center gap-1 text-[0.625rem] text-amber-600">
                <AlertCircle size={11} />
                SEO {seoScore.score}/{seoScore.total}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-ink hover:bg-soft-nude transition-colors disabled:opacity-50"
            >
              Brouillon
            </button>
            <button
              type="button"
              onClick={() => handleSave("publish")}
              disabled={isSaving}
              className="px-4 py-1.5 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {form.status === "PUBLISHED" ? "Enregistrer" : "Publier"}
            </button>
          </div>
        }
      >
        {/* Tab bar */}
        <div className="border-b border-border -mx-4 px-4 mb-5 sticky top-0 bg-surface-alt z-10 pt-1">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[0.7rem] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                  {tab.id === "seo" && (
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold ${
                        seoScore.score >= 9
                          ? "bg-emerald-100 text-emerald-700"
                          : seoScore.score >= 6
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {seoScore.score}/{seoScore.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          {/* ── A. Informations ── */}
          {activeTab === "info" && (
            <>
              <Section title="Informations de base">
                <Field label="Titre de l'article" required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="Ex: Routine peau grasse — le guide complet"
                    className="field-input"
                  />
                </Field>

                <Field label="Slug (URL)" hint="Auto-généré depuis le titre — modifiable">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    placeholder="routine-peau-grasse-guide-complet"
                    className="field-input font-mono text-[0.75rem]"
                  />
                </Field>

                <Field label="Extrait" required hint="2-3 phrases résumant l'article">
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => update("excerpt", e.target.value)}
                    placeholder="Comment construire une routine efficace pour une peau à tendance grasse..."
                    rows={3}
                    className="field-input resize-none"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Catégorie éditoriale" required>
                    <select
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="field-input"
                    >
                      {EDITORIAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Temps de lecture">
                    <input
                      type="text"
                      value={form.readTime}
                      onChange={(e) => update("readTime", e.target.value)}
                      placeholder="5 min"
                      className="field-input"
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Auteur & Statut">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Auteur">
                    <input
                      type="text"
                      value={form.authorName}
                      onChange={(e) => update("authorName", e.target.value)}
                      placeholder="Dr. Amira Selmi"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Expert relecteur" hint="Optionnel">
                    <input
                      type="text"
                      value={form.expertReviewer}
                      onChange={(e) => update("expertReviewer", e.target.value)}
                      placeholder="Pharmacien, dermatologue..."
                      className="field-input"
                    />
                  </Field>
                </div>

                <Field label="Statut de publication">
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="field-input"
                  >
                    {ARTICLE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {form.status === "SCHEDULED" && (
                  <Field label="Date de publication planifiée" hint="Sera publié automatiquement à cette date">
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
                      <input
                        type="datetime-local"
                        value={form.scheduledFor}
                        onChange={(e) => update("scheduledFor", e.target.value)}
                        className="field-input pl-9"
                      />
                    </div>
                  </Field>
                )}

                {form.publishedAt && (
                  <p className="text-[0.625rem] text-ink-faint">
                    Publié le {new Date(form.publishedAt).toLocaleDateString("fr-TN", { dateStyle: "long" })}
                  </p>
                )}
              </Section>

              <Section title="Mot-clé cible (usage interne)">
                <Field label="Requête cible" hint="Pour la planification éditoriale — non affiché publiquement">
                  <input
                    type="text"
                    value={form.targetKeyword}
                    onChange={(e) => update("targetKeyword", e.target.value)}
                    placeholder="routine peau grasse tunisie"
                    className="field-input"
                  />
                </Field>
              </Section>
            </>
          )}

          {/* ── B. Médias ── */}
          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Media status card */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-7 rounded-lg flex items-center justify-center ${form.featuredImage ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                      <ImageIcon size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Image principale d&apos;en-tête</h4>
                      <p className="text-[0.625rem] text-ink-faint">Format recommandé: 1200×630px (16:9)</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[0.625rem] font-bold border ${form.featuredImage ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"}`}>
                    {form.featuredImage ? "✓ Configurée" : "Non définie"}
                  </span>
                </div>

                {/* Main image preview banner */}
                {form.featuredImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border group bg-soft-nude/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.featuredImage}
                      alt={form.title || "Aperçu de l'image"}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-[0.65rem] text-white/90 font-medium truncate max-w-[70%] font-mono">
                        {form.featuredImage}
                      </span>
                      <button
                        type="button"
                        onClick={() => update("featuredImage", "")}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[0.6875rem] font-semibold transition-colors shadow-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Media Uploader */}
                <MediaUploader
                  value={form.featuredImage}
                  onChange={(url) => update("featuredImage", url ?? "")}
                  label="Téléverser ou saisir l'URL de l'image"
                  hint="Filtres MinIO et stockage média ParaTunisie"
                />
              </div>

              {/* Storefront Card Live Preview */}
              <Section title="Aperçu sur le site (Storefront)">
                <p className="text-[0.6875rem] text-ink-muted mb-3">
                  Aperçu en temps réel de la carte de cet article sur la page <code className="text-primary font-mono">/conseils</code>.
                </p>
                <div className="rounded-2xl border border-border bg-surface-alt overflow-hidden p-4 max-w-sm mx-auto shadow-xs">
                  <div className="h-36 rounded-xl bg-gradient-to-br from-primary/8 via-soft-nude to-primary/5 flex items-center justify-center border border-border overflow-hidden relative mb-3">
                    {form.featuredImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={form.featuredImage}
                        alt={form.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-ink-faint">
                        <ImageIcon size={20} />
                        <span className="text-[0.625rem]">Aperçu de l&apos;image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-primary">
                      {form.category || "Visage"}
                    </span>
                    <span className="text-[0.6rem] text-ink-muted">{form.readTime || "5 min"}</span>
                  </div>
                  <h5 className="font-serif text-sm font-medium text-ink line-clamp-2">
                    {form.title || "Titre de l'article"}
                  </h5>
                  <p className="mt-1 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                    {form.excerpt || "Extrait de l'article..."}
                  </p>
                </div>
              </Section>
            </div>
          )}

          {/* ── C. Contenu ── */}
          {activeTab === "content" && (
            <Section title="Contenu de l'article">
              <p className="text-[0.6875rem] text-ink-muted mb-3">
                Rédigez le contenu de l'article. Chaque paragraphe séparé par une ligne vide deviendra un bloc.
              </p>
              <textarea
                value={contentBlocks.join("\n\n")}
                onChange={(e) => {
                  const paragraphs = e.target.value
                    .split(/\n\n+/)
                    .map((t) => t.trim())
                    .filter(Boolean);
                  const blocks = paragraphs.map((text) => ({ type: "paragraph", text }));
                  update("content", JSON.stringify(blocks));
                }}
                placeholder="Rédigez votre article ici. Séparez les paragraphes par une ligne vide..."
                rows={20}
                className="field-input resize-none font-sans text-sm leading-relaxed"
              />
              <p className="text-[0.625rem] text-ink-faint mt-1">
                {contentBlocks.length} paragraphe{contentBlocks.length !== 1 ? "s" : ""}
              </p>

              {/* FAQ section */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">
                    Questions Fréquentes (FAQ)
                  </h4>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-1 text-[0.6875rem] font-semibold text-primary hover:text-primary-hover"
                  >
                    <Plus size={12} /> Ajouter une question
                  </button>
                </div>

                {form.faqs.length === 0 && (
                  <p className="text-[0.6875rem] text-ink-faint text-center py-4 border border-dashed border-border rounded-lg">
                    Aucune FAQ — cliquez sur « Ajouter une question » pour en créer.
                  </p>
                )}

                {form.faqs.map((faq, idx) => {
                  const isExpanded = faqExpanded.includes(idx);
                  return (
                    <div key={idx} className="rounded-lg border border-border bg-background overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setFaqExpanded((prev) =>
                            isExpanded ? prev.filter((i) => i !== idx) : [...prev, idx]
                          )
                        }
                        className="flex items-center justify-between w-full px-3 py-2 text-left"
                      >
                        <span className="text-xs font-medium text-ink truncate">
                          {faq.question || `Question ${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteFaq(idx);
                            }}
                            className="p-1 rounded hover:bg-rose-50 text-rose-500"
                          >
                            <Trash2 size={12} />
                          </button>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border p-3 space-y-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(idx, "question", e.target.value)}
                            placeholder="Question…"
                            className="field-input"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                            placeholder="Réponse détaillée…"
                            rows={3}
                            className="field-input resize-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ── D. Produits & Relations ── */}
          {activeTab === "relations" && (
            <>
              <Section title="Produits recommandés">
                <p className="text-[0.6875rem] text-ink-muted mb-3">
                  Les produits liés apparaissent dans la section « NOS RECOMMANDATIONS » de l'article et sur les pages produit.
                </p>

                {/* Product search */}
                <div className="relative mb-3">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Rechercher un produit…"
                    className="field-input pl-9"
                  />
                </div>

                {/* Available products list */}
                {filteredProducts.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border/50 mb-3">
                    {filteredProducts.slice(0, 20).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-soft-nude transition-colors"
                      >
                        {product.image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-8 w-8 rounded object-contain border border-border bg-soft-nude shrink-0"
                          />
                        )}
                        <span className="text-xs font-medium text-ink truncate">{product.name}</span>
                        <Plus size={13} className="shrink-0 text-primary ml-auto" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected products */}
                {form.products.length === 0 && (
                  <p className="text-[0.6875rem] text-ink-faint text-center py-4 border border-dashed border-border rounded-lg">
                    Aucun produit associé — recherchez et sélectionnez des produits ci-dessus.
                  </p>
                )}

                <div className="space-y-2">
                  {form.products.map((product) => (
                    <div key={product.productId} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center gap-3 mb-2">
                        {product.productImage && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="h-8 w-8 rounded object-contain border border-border bg-soft-nude shrink-0"
                          />
                        )}
                        <span className="text-xs font-semibold text-ink flex-1 truncate">
                          {product.productName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProduct(product.productId)}
                          className="p-1 rounded hover:bg-rose-50 text-rose-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={product.rationale ?? ""}
                        onChange={(e) => updateProductRationale(product.productId, e.target.value)}
                        placeholder="Pourquoi ce produit ? Ex: Texture légère, adaptée aux peaux grasses"
                        className="field-input text-[0.75rem]"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── E. SEO ── */}
          {activeTab === "seo" && (
            <>
              <SeoCompletenessScore
                article={{
                  ...form,
                  products: form.products.map((p) => ({ id: p.productId })),
                }}
                size="md"
              />

              <SeoFormSection
                data={{
                  seoTitle: form.seoTitle,
                  seoDescription: form.metaDescription,
                  canonicalUrl: form.canonicalUrl,
                  indexable: form.indexable,
                  ogTitle: form.ogTitle,
                  ogDescription: form.ogDescription,
                  ogImage: form.ogImage,
                }}
                slug={`conseils/${form.slug}`}
                entityName={form.title || "Article"}
                onChange={(updated) => {
                  setForm((prev) => ({
                    ...prev,
                    seoTitle: updated.seoTitle ?? prev.seoTitle,
                    metaDescription: updated.seoDescription ?? prev.metaDescription,
                    canonicalUrl: updated.canonicalUrl ?? prev.canonicalUrl,
                    indexable: updated.indexable ?? prev.indexable,
                    ogTitle: updated.ogTitle ?? prev.ogTitle,
                    ogDescription: updated.ogDescription ?? prev.ogDescription,
                    ogImage: updated.ogImage ?? prev.ogImage,
                  }));
                  setIsDirty(true);
                }}
              />
            </>
          )}
        </div>
      </Drawer>

      <UnsavedChangesModal
        open={showUnsaved}
        onContinueEditing={() => setShowUnsaved(false)}
        onDiscardAndLeave={() => {
          setShowUnsaved(false);
          setIsDirty(false);
          onClose();
        }}
      />

      <ConfirmModal
        open={showDeleteFaq !== null}
        title="Supprimer cette question ?"
        description="Cette question FAQ sera supprimée de l'article."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (showDeleteFaq !== null) removeFaq(showDeleteFaq);
        }}
        onCancel={() => setShowDeleteFaq(null)}
      />
    </>
  );
}

/* ── Section & Field helpers ─────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[0.75rem] font-medium text-ink">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[0.625rem] text-ink-faint">{hint}</p>}
    </div>
  );
}
