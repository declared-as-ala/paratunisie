"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  Home,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CategoryProductCard } from "@/components/category/category-product-card";
import { ProductRichText } from "@/components/product/product-rich-text";
import type { ProductSummary } from "@/lib/data/products";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SubcategoryTab {
  key: string;
  label: string;
  href: string;
  active?: boolean;
  count?: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CategoryCatalogViewProps {
  title: string;
  categoryName: string;
  categorySlug: string;
  description?: string | null;
  crumbs: BreadcrumbItem[];
  products: ProductSummary[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize?: number;
  pinnedProductId?: string;
  availableBrands: { name: string; count: number }[];
  inStockCount: number;
  priceCounts: {
    under_60: number;
    between_60_120: number;
    above_120: number;
  };
  currentQuery: {
    q?: string;
    brand?: string;
    price?: string;
    in_stock?: string;
    sort?: string;
    tab?: string;
  };
  subcategoryTabs?: SubcategoryTab[];
  seoContent?: string | null;
  faqs?: FaqItem[];
}

const RAYONS_LIST = [
  { label: "WHEY PROTÉINE", slug: "whey-proteine" },
  { label: "CRÉATINE MONOHYDRATE", slug: "creatine" },
  { label: "PRISE DE MASSE & GAINERS", slug: "gainers-proteines" },
  { label: "PRE-WORKOUT & ÉNERGIE", slug: "pre-workout" },
  { label: "BCAA & ACIDES AMINÉS", slug: "acides-amines" },
  { label: "VITAMINES & IMMUNITÉ", slug: "vitamines" },
  { label: "BIEN-ÊTRE, SOMMEIL & STRESS", slug: "bien-etre" },
  { label: "PERTE DE POIDS & BRÛLEURS", slug: "bruleurs-de-graisse" },
  { label: "ACCESSOIRES MUSCULATION", slug: "accessoires" },
];

function getDefaultGuidePoints(slug: string, name: string) {
  if (slug.includes("creatine")) {
    return [
      {
        title: "Force et puissance explosive",
        text: "La créatine monohydrate micronisée est l'actif le plus documenté pour augmenter la force sur les séries courtes et intenses.",
      },
      {
        title: "Dosage quotidien optimal",
        text: "Prenez 3 g à 5 g par jour tous les jours (entraînement et repos), dilués dans de l'eau ou votre shaker post-entraînement.",
      },
      {
        title: "Pureté et assimilation",
        text: "Privilégiez une poudre 100% pure monohydrate (200 mesh ou Creapure) sans sucres ajoutés pour une digestion optimale.",
      },
      {
        title: "Association recommandée",
        text: "La créatine se combine parfaitement avec votre Whey Protéine, vos BCAA/EAA ou un Pre-Workout avant la séance.",
      },
    ];
  }
  if (slug.includes("bien-etre") || slug.includes("ashwagandha") || slug.includes("magnesium")) {
    return [
      {
        title: "Gestion du stress et du cortisol",
        text: "L'Ashwagandha (notamment BioTechUSA et KSM-66) est une plante adaptogène reconnue pour favoriser la détente mentale et l'équilibre nerveux.",
      },
      {
        title: "Sommeil profond et récupération nerveuse",
        text: "Le Magnésium associé à la Vitamine B6 réduit la fatigue neuromusculaire, prévient les crampes et prépare un sommeil réparateur.",
      },
      {
        title: "Quand les consommer ?",
        text: "Prenez l'Ashwagandha et le Magnésium de préférence en fin de journée ou au cours du repas du soir pendant 4 à 8 semaines.",
      },
      {
        title: "Synergie Bien-être",
        text: "L'association Ashwagandha + Magnésium + Oméga 3 constitue la base idéale pour calmer le système nerveux et optimiser la récupération.",
      },
    ];
  }
  return [
    {
      title: "Choisir selon votre objectif principal",
      text: `Chaque référence de la gamme ${name} répond à un besoin précis : performance, récupération musculaire, prise de masse ou vitalité quotidienne.`,
    },
    {
      title: "Qualité et traçabilité garanties",
      text: "Toutes nos références proviennent de marques internationales reconnues (BioTechUSA, Optimum Nutrition, Real Pharm, OstroVit, MuscleTech).",
    },
    {
      title: "Respect du dosage et régularité",
      text: "La régularité quotidienne et le respect des portions recommandées sur l'étiquette sont essentiels pour obtenir des résultats durables.",
    },
    {
      title: "Accompagnement personnalisé",
      text: "Consultez nos fiches détaillées pour comparer la composition nutritionnelle, le nombre de portions et les conseils d'utilisation.",
    },
  ];
}

function getDefaultFaqs(slug: string, name: string, minDt: number, maxDt: number, stockCount: number): FaqItem[] {
  if (slug.includes("bien-etre") || slug.includes("ashwagandha") || slug.includes("magnesium")) {
    return [
      {
        question: "Quels sont les bienfaits de l'Ashwagandha et du Magnésium ?",
        answer:
          "L'Ashwagandha aide l'organisme à s'adapter au stress émotionnel et physique tout en favorisant l'endormissement. Le Magnésium + Vitamine B6 soutient le système nerveux, réduit la fatigue et prévient les tensions musculaires.",
      },
      {
        question: "Peut-on associer l'Ashwagandha et le Magnésium le soir ?",
        answer:
          "Oui, leur association est particulièrement recommandée le soir : l'Ashwagandha apaise le stress et le cortisol tandis que le Magnésium détend les muscles et prépare un sommeil profond.",
      },
      {
        question: "Combien de temps dure une cure de bien-être ?",
        answer:
          "Une cure de 4 à 8 semaines avec une prise quotidienne régulière permet de ressentir pleinement les effets sur le sommeil, l'humeur et la récupération.",
      },
      {
        question: `Quel est le prix des compléments ${name} en Tunisie ?`,
        answer: `Sur ParaTunisie, les compléments ${name.toLowerCase()} en stock coûtent de ${minDt} à ${maxDt} DT (${stockCount} références disponibles), avec livraison rapide 24–48h et paiement à la livraison.`,
      },
      {
        question: "Ces produits sont-ils 100% authentiques et livrés partout en Tunisie ?",
        answer:
          "Oui, ParaTunisie garantit l'authenticité de chaque boîte (lots officiels scellés) et assure la livraison en 24 à 48h dans les 24 gouvernorats de Tunisie.",
      },
    ];
  }
  return [
    {
      question: `Comment bien choisir son produit dans la gamme ${name} ?`,
      answer: `Sélectionnez votre ${name.toLowerCase()} selon votre objectif principal, la concentration en actifs par portion, le format (poudre, gélules ou comprimés) et votre budget.`,
    },
    {
      question: `Quand et comment consommer ${name.toLowerCase()} pour de meilleurs résultats ?`,
      answer:
        "Respectez la dose journalière indiquée sur l'emballage du fabricant. La régularité quotidienne, associée à une alimentation équilibrée et une bonne hydratation, maximise les résultats.",
    },
    {
      question: `Quel est le prix de ${name.toLowerCase()} en Tunisie ?`,
      answer: `Sur ParaTunisie, les références de ${name.toLowerCase()} en stock sont proposées de ${minDt} à ${maxDt} DT (${stockCount} produits disponibles immédiatement), livrées en 24–48h.`,
    },
    {
      question: "Ces produits sont-ils livrés partout en Tunisie ?",
      answer:
        "Oui, nous livrons dans les 24 gouvernorats tunisiens (Grand Tunis, Sousse, Sfax, Nabeul, Monastir, Bizerte, etc.) sous 24 à 48h avec paiement à la livraison.",
    },
    {
      question: "Comment vérifier l'authenticité des compléments sur ParaTunisie ?",
      answer:
        "Tous nos produits proviennent des distributeurs officiels des marques internationales avec scellé de sécurité d'origine, numéro de lot et date d'expiration vérifiables à la réception.",
    },
  ];
}

export function CategoryCatalogView({
  title,
  categoryName,
  categorySlug,
  description,
  crumbs,
  products,
  totalCount,
  page,
  totalPages,
  pageSize = 24,
  pinnedProductId,
  availableBrands,
  inStockCount,
  priceCounts,
  currentQuery,
  subcategoryTabs,
  seoContent,
  faqs = [],
}: CategoryCatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(currentQuery.q || "");
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Build URL with updated query params
  const buildFilterUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      tab: currentQuery.tab,
      q: currentQuery.q,
      brand: currentQuery.brand,
      price: currentQuery.price,
      in_stock: currentQuery.in_stock,
      sort: currentQuery.sort,
      ...updates,
    };

    Object.entries(merged).forEach(([key, val]) => {
      if (val && val.trim() !== "" && !(key === "tab" && val === "all")) {
        params.set(key, val.trim());
      }
    });

    if (!resetPage && page > 1) {
      params.set("page", String(page));
    }

    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  };

  const applyFilter = (updates: Record<string, string | undefined>) => {
    router.push(buildFilterUrl(updates, true));
  };

  const resetAllFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter({ q: searchInput });
  };

  const pageUrl = (nextPage: number) => {
    const params = new URLSearchParams();
    if (currentQuery.tab && currentQuery.tab !== "all") params.set("tab", currentQuery.tab);
    if (currentQuery.q) params.set("q", currentQuery.q);
    if (currentQuery.brand) params.set("brand", currentQuery.brand);
    if (currentQuery.price) params.set("price", currentQuery.price);
    if (currentQuery.in_stock) params.set("in_stock", currentQuery.in_stock);
    if (currentQuery.sort) params.set("sort", currentQuery.sort);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  };

  const activeFilterCount = [
    currentQuery.q,
    currentQuery.brand,
    currentQuery.price,
    currentQuery.in_stock,
  ].filter(Boolean).length;

  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(totalCount, (page - 1) * pageSize + products.length);

  // Price min/max in DT for SEO summary
  const { minDt, maxDt } = useMemo(() => {
    if (products.length === 0) return { minDt: 45, maxDt: 240 };
    const prices = products.map((p) => Math.round(p.priceMillimes / 1000));
    return {
      minDt: Math.min(...prices),
      maxDt: Math.max(...prices),
    };
  }, [products]);

  const guidePoints = getDefaultGuidePoints(categorySlug, categoryName);
  const displayFaqs =
    faqs.length > 0 ? faqs : getDefaultFaqs(categorySlug, categoryName, minDt, maxDt, inStockCount || totalCount);

  // Reusable Sidebar Filter Content (used in both Desktop Aside and Mobile Sheet)
  const renderFilterSections = (closeOnSelect = false) => {
    const trigger = (updates: Record<string, string | undefined>) => {
      applyFilter(updates);
      if (closeOnSelect) setMobileFilterOpen(false);
    };

    return (
      <div className="divide-y divide-border/70">
        {/* ── 1. Disponibilité ───────────────────────────────────────── */}
        <details open className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-[13px] font-bold uppercase tracking-wide text-ink transition-colors hover:text-primary">
            <span className="flex min-w-0 items-center gap-2">Disponibilité</span>
            <ChevronDown size={15} className="text-ink-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="pb-4 pt-0.5">
            <div className="space-y-1 pt-1">
              <button
                type="button"
                aria-pressed={currentQuery.in_stock === "in_stock"}
                onClick={() =>
                  trigger({ in_stock: currentQuery.in_stock === "in_stock" ? undefined : "in_stock" })
                }
                className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-start transition-colors hover:bg-[#FAF7F5] cursor-pointer"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                    currentQuery.in_stock === "in_stock"
                      ? "border-primary bg-primary text-white"
                      : "border-border-strong bg-white"
                  }`}
                >
                  {currentQuery.in_stock === "in_stock" && <Check size={12} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                  En stock uniquement
                </span>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-muted">
                  {inStockCount}
                </span>
              </button>
            </div>
            <p className="mt-1.5 px-1.5 text-[11px] leading-snug text-ink-muted">
              {inStockCount} produits sont expédiables immédiatement. Les autres sont commandables sur demande.
            </p>
          </div>
        </details>

        {/* ── 2. Catégories / Rayons ─────────────────────────────────── */}
        <details open className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-[13px] font-bold uppercase tracking-wide text-ink transition-colors hover:text-primary">
            <span className="flex min-w-0 items-center gap-2">Catégories</span>
            <ChevronDown size={15} className="text-ink-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="pb-4 pt-0.5">
            <div className="space-y-1 pt-1 max-h-64 overflow-y-auto scrollbar-thin pe-1">
              {RAYONS_LIST.map((rayon) => {
                const isCurrent = categorySlug === rayon.slug;
                return (
                  <Link
                    key={rayon.slug}
                    href={`/${rayon.slug}`}
                    onClick={() => closeOnSelect && setMobileFilterOpen(false)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-start transition-colors hover:bg-[#FAF7F5] ${
                      isCurrent ? "bg-primary/5 font-bold text-primary" : "text-ink"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                        isCurrent ? "border-primary bg-primary text-white" : "border-border-strong bg-white"
                      }`}
                    >
                      {isCurrent && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px]">{rayon.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </details>

        {/* ── 3. Marques ─────────────────────────────────────────────── */}
        {availableBrands.length > 0 && (
          <details open className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-[13px] font-bold uppercase tracking-wide text-ink transition-colors hover:text-primary">
              <span className="flex min-w-0 items-center gap-2">Marques</span>
              <ChevronDown size={15} className="text-ink-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="pb-4 pt-0.5">
              <div className="space-y-1 pt-1 max-h-60 overflow-y-auto scrollbar-thin pe-1">
                {availableBrands.map((b) => {
                  const selected = currentQuery.brand?.toLowerCase() === b.name.toLowerCase();
                  return (
                    <button
                      key={b.name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => trigger({ brand: selected ? undefined : b.name })}
                      className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-start transition-colors hover:bg-[#FAF7F5] cursor-pointer"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                          selected ? "border-primary bg-primary text-white" : "border-border-strong bg-white"
                        }`}
                      >
                        {selected && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{b.name}</span>
                      <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">{b.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </details>
        )}

        {/* ── 4. Prix (DT) ───────────────────────────────────────────── */}
        <details open className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-[13px] font-bold uppercase tracking-wide text-ink transition-colors hover:text-primary">
            <span className="flex min-w-0 items-center gap-2">Budget (DT)</span>
            <ChevronDown size={15} className="text-ink-muted transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="pb-4 pt-0.5">
            <div className="space-y-1 pt-1">
              {[
                { key: "under_60", label: "Moins de 60 DT", count: priceCounts.under_60 },
                { key: "60_120", label: "60 DT – 120 DT", count: priceCounts.between_60_120 },
                { key: "above_120", label: "Plus de 120 DT", count: priceCounts.above_120 },
              ].map((item) => {
                const selected = currentQuery.price === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => trigger({ price: selected ? undefined : item.key })}
                    className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-start transition-colors hover:bg-[#FAF7F5] cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                        selected ? "border-primary bg-primary text-white" : "border-border-strong bg-white"
                      }`}
                    >
                      {selected && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{item.label}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">{item.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </details>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* ── 1. Breadcrumb ──────────────────────────────────────────── */}
        <nav aria-label="Fil d'Ariane" className="mb-3 sm:mb-5">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-ink-muted">
            {crumbs.map((crumb, idx) => (
              <li key={crumb.url} className="inline-flex items-center gap-1.5 min-w-0">
                {idx > 0 && <ChevronRight size={13} className="text-border-strong shrink-0" />}
                {idx === crumbs.length - 1 ? (
                  <span className="font-semibold text-ink truncate max-w-[60vw] sm:max-w-none" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.url}
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {idx === 0 && <Home size={13} className="shrink-0" />}
                    <span>{crumb.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 2. Category Header Row (Uppercase H1 + Product Count) ──── */}
        <div className="mb-3 flex flex-col gap-1.5 sm:mb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0 sm:flex-1">
            <header>
              <h1 className="text-balance font-serif text-2xl font-extrabold uppercase leading-none tracking-[-0.02em] text-ink sm:text-[1.75rem] lg:text-[2.125rem]">
                {title}
              </h1>
              {description && (
                <p className="mt-1.5 max-w-3xl text-xs sm:text-sm text-ink-muted line-clamp-2">
                  {description}
                </p>
              )}
            </header>
          </div>
          <p className="shrink-0 text-[13px] tabular-nums text-ink-muted sm:pb-0.5">
            <span className="font-bold text-ink">
              {startItem}–{endItem}
            </span>{" "}
            sur <span className="font-bold text-ink">{totalCount}</span> produit{totalCount > 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Optional Subcategory / Tab Pills (e.g., Bien-être: Ashwagandha / Magnésium) ── */}
        {subcategoryTabs && subcategoryTabs.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {subcategoryTabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  tab.active
                    ? "border-primary bg-primary text-white shadow-2xs"
                    : "border-border/80 bg-white text-ink hover:border-primary/40 hover:text-primary"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                      tab.active ? "bg-white/20 text-white" : "bg-[#FAF7F5] text-ink-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* ── 3. Sticky Search, Sort & Filter Bar (Protein.tn Style) ──── */}
        <div className="sticky top-[7.25rem] lg:top-[5.25rem] z-30 mb-4 rounded-2xl border border-border/80 bg-white/95 p-2.5 shadow-2xs backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                aria-hidden
              />
              <input
                type="text"
                inputMode="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Rechercher dans ${categoryName.toLowerCase()}…`}
                aria-label="Rechercher dans la catégorie"
                className="h-11 w-full rounded-xl border border-border/90 bg-white ps-9 pe-9 text-xs sm:text-sm text-ink placeholder:text-ink-muted/70 shadow-2xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    applyFilter({ q: undefined });
                  }}
                  aria-label="Effacer la recherche"
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Right Controls: Sort + Filter Trigger */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Sort Select */}
              <div className="relative shrink-0">
                <select
                  aria-label="Trier les produits"
                  value={currentQuery.sort || ""}
                  onChange={(e) => applyFilter({ sort: e.target.value || undefined })}
                  className="h-11 w-11 sm:w-auto cursor-pointer appearance-none rounded-xl border border-border/90 bg-white px-0 sm:ps-3.5 sm:pe-9 text-transparent sm:text-xs sm:font-semibold sm:text-ink shadow-2xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" className="text-ink">
                    Trier : Popularité
                  </option>
                  <option value="price_asc" className="text-ink">
                    Prix : croissant
                  </option>
                  <option value="price_desc" className="text-ink">
                    Prix : décroissant
                  </option>
                  <option value="name" className="text-ink">
                    Nom : A → Z
                  </option>
                </select>
                <ArrowUpDown
                  size={16}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink sm:left-auto sm:right-3 sm:translate-x-0"
                  aria-hidden
                />
              </div>

              {/* Desktop Sidebar Toggle Button */}
              <button
                type="button"
                aria-pressed={desktopSidebarOpen}
                onClick={() => setDesktopSidebarOpen((v) => !v)}
                className="hidden lg:inline-flex h-11 items-center gap-2 rounded-xl border border-border/90 bg-white px-4 text-[13px] font-semibold text-ink shadow-2xs transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                <span>Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Mobile Filter Drawer Trigger Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex lg:hidden h-11 shrink-0 items-center gap-2 rounded-xl border border-border/90 bg-white px-3.5 text-[13px] font-semibold text-ink shadow-2xs transition-colors hover:border-primary/40 cursor-pointer"
              >
                <SlidersHorizontal size={15} className="text-primary" />
                <span>Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Chips Row */}
          {activeFilterCount > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {currentQuery.in_stock === "in_stock" && (
                <button
                  type="button"
                  onClick={() => applyFilter({ in_stock: undefined })}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  <span>En stock uniquement</span>
                  <X size={12} />
                </button>
              )}
              {currentQuery.brand && (
                <button
                  type="button"
                  onClick={() => applyFilter({ brand: undefined })}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  <span>Marque : {currentQuery.brand}</span>
                  <X size={12} />
                </button>
              )}
              {currentQuery.price && (
                <button
                  type="button"
                  onClick={() => applyFilter({ price: undefined })}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  <span>
                    {currentQuery.price === "under_60"
                      ? "Moins de 60 DT"
                      : currentQuery.price === "60_120"
                      ? "60 – 120 DT"
                      : "Plus de 120 DT"}
                  </span>
                  <X size={12} />
                </button>
              )}
              {currentQuery.q && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    applyFilter({ q: undefined });
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 cursor-pointer"
                >
                  <span>« {currentQuery.q} »</span>
                  <X size={12} />
                </button>
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="ms-auto inline-flex items-center gap-1 text-[11px] font-bold text-ink-muted hover:text-primary cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Tout réinitialiser</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Filter Sheet Drawer ──────────────────────────────── */}
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetContent side="left" className="w-[88vw] max-w-sm bg-white p-0 flex flex-col">
            <SheetHeader className="border-b border-border/80 px-4 py-3.5 flex flex-row items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <span>Filtres ({totalCount})</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Filtrer les produits par disponibilité, catégorie, marque et budget
                </SheetDescription>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    resetAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="text-xs font-bold text-primary underline me-6"
                >
                  Réinitialiser
                </button>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {renderFilterSections(true)}
            </div>

            <div className="border-t border-border/80 p-4 bg-[#FAF7F5]">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm hover:bg-primary-hover"
              >
                Voir les {totalCount} produit{totalCount > 1 ? "s" : ""}
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* ── 4. Two-Column Main Body: Left Sidebar + Right Catalog ───── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* LEFT SIDEBAR (Desktop) */}
          {desktopSidebarOpen && (
            <aside className="hidden w-[17rem] shrink-0 lg:block">
              <div className="sticky top-[12.25rem] max-h-[calc(100dvh-13.25rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border/80 bg-white p-4 shadow-2xs scrollbar-thin">
                <div className="mb-1 flex items-center justify-between gap-2 border-b border-border/70 pb-2.5">
                  <h2 className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-ink">
                    <SlidersHorizontal size={14} className="text-primary" />
                    <span>Filtres</span>
                  </h2>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      <RotateCcw size={11} />
                      <span>Effacer</span>
                    </button>
                  )}
                </div>

                {renderFilterSections(false)}
              </div>
            </aside>
          )}

          {/* RIGHT CATALOG SECTION */}
          <section aria-labelledby="catalog-products-title" className="min-w-0 flex-1">
            <h2 id="catalog-products-title" className="sr-only">
              Produits {categoryName}
            </h2>

            <div className="space-y-8 sm:space-y-12">
              {/* Product Cards List */}
              {products.length > 0 ? (
                <ul
                  role="list"
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 min-w-0 w-full ${
                    desktopSidebarOpen
                      ? "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                      : "lg:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {products.map((product, index) => (
                    <li key={product.id} className="h-full min-w-0">
                      <CategoryProductCard
                        product={product}
                        priority={index < 4}
                        highlight={page === 1 && pinnedProductId === product.id ? "À la une" : undefined}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-border/80 bg-white p-10 text-center shadow-2xs">
                  <p className="text-sm font-semibold text-ink-muted">
                    Aucun produit ne correspond à ces critères de filtrage.
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-primary-hover cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Réinitialiser les filtres</span>
                  </button>
                </div>
              )}

              {/* ── Pagination Bar (Protein.tn Style) ─────────────────── */}
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="flex items-center justify-center gap-2 pt-2"
                >
                  {page > 1 ? (
                    <Link
                      href={pageUrl(page - 1)}
                      aria-label="Page précédente"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-white text-ink shadow-2xs transition-colors hover:border-primary hover:text-primary"
                    >
                      <ChevronLeft size={18} />
                    </Link>
                  ) : (
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-white/50 text-ink-muted/40">
                      <ChevronLeft size={18} />
                    </span>
                  )}

                  {/* Desktop Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <Link
                        key={num}
                        href={pageUrl(num)}
                        aria-current={num === page ? "page" : undefined}
                        className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl px-3 text-xs font-bold tabular-nums transition-all shadow-2xs ${
                          num === page
                            ? "bg-primary text-white"
                            : "border border-border/80 bg-white text-ink hover:border-primary hover:text-primary"
                        }`}
                      >
                        {num}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Page Indicator Pill */}
                  <span
                    className="flex h-11 min-w-[7.5rem] items-center justify-center rounded-xl border border-border/80 bg-white px-3 text-[13px] font-bold tabular-nums text-ink sm:hidden"
                    aria-hidden="true"
                  >
                    Page {page} / {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link
                      href={pageUrl(page + 1)}
                      aria-label="Page suivante"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-white text-ink shadow-2xs transition-colors hover:border-primary hover:text-primary"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  ) : (
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/40 bg-white/50 text-ink-muted/40">
                      <ChevronRight size={18} />
                    </span>
                  )}
                </nav>
              )}

              {/* ── Below-the-Fold Editorial, Brands, FAQ & Discovery ──── */}
              <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-border/80 space-y-5 lg:space-y-7">
                {/* 1. Conseil d'achat & Guide Section */}
                <section
                  aria-labelledby="category-guide-title"
                  className="rounded-2xl border border-border/80 bg-white p-4 sm:p-6 lg:p-8 shadow-2xs"
                >
                  {/* Price Summary Banner */}
                  <div className="mb-6 border-b border-border/70 pb-5 text-xs sm:text-sm leading-relaxed text-ink-muted">
                    <p className="text-ink">
                      <strong>Prix de {categoryName.toLowerCase()} en Tunisie :</strong> de{" "}
                      <strong>{minDt}</strong> à <strong>{maxDt} DT</strong> pour les{" "}
                      <strong>{inStockCount || totalCount}</strong> références disponibles, livrées en{" "}
                      <strong>24–48h</strong> partout en Tunisie avec paiement à la livraison.
                    </p>
                    {seoContent && (
                      <div className="mt-4">
                        <ProductRichText
                          content={seoContent}
                          className="text-xs sm:text-sm leading-relaxed text-ink-muted"
                        />
                      </div>
                    )}
                  </div>

                  {/* Conseil d'achat Header */}
                  <div className="mb-5 flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Compass size={20} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                        Conseil d’achat
                      </p>
                      <h2
                        id="category-guide-title"
                        className="mt-0.5 font-serif text-xl font-extrabold uppercase leading-tight text-ink sm:text-2xl"
                      >
                        Par où commencer dans la gamme {categoryName} ?
                      </h2>
                    </div>
                  </div>

                  {/* Two-Column Split: Guide Bullets + L'essentiel Box */}
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
                    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-ink-muted">
                      <p>
                        Chaque produit de notre rayon <strong>{categoryName}</strong> répond à un besoin spécifique. Voici les repères essentiels pour choisir la formule adaptée à votre rythme :
                      </p>
                      <ul className="space-y-2.5 ps-4 list-disc marker:text-primary">
                        {guidePoints.map((pt) => (
                          <li key={pt.title}>
                            <strong className="text-ink">{pt.title} :</strong> {pt.text}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <aside
                      className="rounded-xl bg-[#FAF7F5] border border-border/60 p-4 sm:p-5 h-fit"
                      aria-label="Pourquoi commander chez ParaTunisie"
                    >
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">
                        L’essentiel
                      </p>
                      <ul className="mt-3 space-y-3">
                        <li className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-snug text-ink">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>Vérifiez votre objectif et la portion quotidienne conseillée.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-snug text-ink">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>Comparez le prix en DT, le format et la disponibilité immédiate.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-snug text-ink">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>Besoin d’aide ? Notre équipe vous conseille au +216 97 991 266.</span>
                        </li>
                      </ul>
                    </aside>
                  </div>
                </section>

                {/* 2. Marques de ce rayon */}
                {availableBrands.length > 0 && (
                  <section
                    aria-labelledby="marques-de-ce-rayon"
                    className="rounded-2xl border border-border/80 bg-white p-4 sm:p-6 shadow-2xs"
                  >
                    <h2
                      id="marques-de-ce-rayon"
                      className="flex items-center gap-2 font-serif text-base sm:text-lg font-extrabold uppercase tracking-tight text-ink mb-3.5"
                    >
                      <Tag size={16} className="text-primary" />
                      <span>Marques de ce rayon</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {availableBrands.map((b) => {
                        const active = currentQuery.brand?.toLowerCase() === b.name.toLowerCase();
                        return (
                          <button
                            key={b.name}
                            type="button"
                            onClick={() =>
                              applyFilter({ brand: active ? undefined : b.name })
                            }
                            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                              active
                                ? "border-primary bg-primary text-white shadow-2xs"
                                : "border-border/80 bg-[#FAF7F5] text-ink hover:border-primary/40 hover:text-primary"
                            }`}
                          >
                            <span>{b.name}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                                active ? "bg-white/20 text-white" : "bg-white text-ink-muted"
                              }`}
                            >
                              {b.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 3. Questions fréquentes (Numbered Accordion 01, 02, 03...) */}
                <section
                  aria-labelledby="category-faq-title"
                  className="rounded-2xl border border-border/80 bg-white overflow-hidden shadow-2xs"
                >
                  <div className="border-b border-border/70 px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <HelpCircle size={20} />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                        FAQ
                      </p>
                      <h2
                        id="category-faq-title"
                        className="font-serif text-lg sm:text-xl font-extrabold uppercase tracking-tight text-ink"
                      >
                        Questions fréquentes — {categoryName}
                      </h2>
                    </div>
                  </div>

                  <div className="divide-y divide-border/70">
                    {displayFaqs.map((faq, idx) => (
                      <details key={idx} className="group [&_summary::-webkit-details-marker]:hidden">
                        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 font-semibold text-ink transition-colors hover:bg-[#FAF7F5]/60 sm:px-6">
                          <span className="flex items-start gap-3 text-xs sm:text-[15px]">
                            <span className="mt-0.5 text-xs font-extrabold tabular-nums text-primary">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span>{faq.question}</span>
                          </span>
                          <ChevronDown
                            size={16}
                            className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180"
                          />
                        </summary>
                        <p className="border-t border-border/60 bg-[#FAF7F5] px-4 py-4 ps-11 text-xs sm:text-sm leading-relaxed text-ink-muted sm:px-6 sm:ps-[3.5rem]">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>

                {/* 4. Two-Column Bottom Discovery Cards: Rayons associés & Produits à découvrir */}
                <section className="grid gap-4 md:grid-cols-2">
                  {/* Rayons associés */}
                  <div className="rounded-2xl border border-border/80 bg-white p-4 sm:p-5 shadow-2xs">
                    <h2 className="flex items-center gap-2 font-serif text-sm font-extrabold uppercase tracking-wide text-ink">
                      <Sparkles size={15} className="text-primary" />
                      <span>Rayons associés</span>
                    </h2>
                    <ul className="mt-3 divide-y divide-border/60">
                      {RAYONS_LIST.filter((r) => r.slug !== categorySlug)
                        .slice(0, 6)
                        .map((rayon) => (
                          <li key={rayon.slug}>
                            <Link
                              href={`/${rayon.slug}`}
                              className="group flex min-h-11 items-center justify-between gap-3 text-xs sm:text-sm font-medium text-ink-muted transition-colors hover:text-primary"
                            >
                              <span className="line-clamp-1">{rayon.label}</span>
                              <ArrowRight
                                size={14}
                                className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                              />
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Produits à découvrir */}
                  <div className="rounded-2xl border border-border/80 bg-white p-4 sm:p-5 shadow-2xs">
                    <h2 className="flex items-center gap-2 font-serif text-sm font-extrabold uppercase tracking-wide text-ink">
                      <Package size={15} className="text-primary" />
                      <span>Produits à découvrir</span>
                    </h2>
                    <ul className="mt-3 divide-y divide-border/60">
                      {products.slice(0, 6).map((prod) => (
                        <li key={prod.id}>
                          <Link
                            href={`/produits/${prod.slug}`}
                            className="group flex min-h-11 items-center justify-between gap-3 text-xs sm:text-sm font-medium text-ink-muted transition-colors hover:text-primary"
                          >
                            <span className="line-clamp-1">{prod.name}</span>
                            <ArrowRight
                              size={14}
                              className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
