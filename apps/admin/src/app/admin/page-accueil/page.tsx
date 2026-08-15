"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LayoutTemplate,
  Save,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/toast";
import { Drawer } from "@/components/drawer";
import { ConfirmModal } from "@/components/confirm-modal";

const API_URL = "http://localhost:3001/api/v1";

interface AdminSectionConfig {
  id?: string;
  sectionKey: string;
  enabled: boolean;
  position: number;
  mode: "MANUAL" | "AUTOMATIC" | "HYBRID";
  title?: string;
  description?: string;
  settings: {
    limit?: number;
    pinnedProductIds?: string[];
    categorySlug?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
}

interface AdminCampaign {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  desktopMedia?: string;
  mobileMedia?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  startDate?: string;
  endDate?: string;
  productIds: string[];
}

interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  brandName: string;
  sellingPrice: number;
  estimatedCost: number;
  grossMargin: number;
  stock: number;
  salesCount: number;
}

const SECTION_LABELS: Record<string, { label: string; description: string }> = {
  hero: { label: "Hero principal", description: "Bannière haut de page avec proposition de valeur et réassurance" },
  best_sellers: { label: "Les favoris ParaTunisie (Best Sellers)", description: "Produits les plus vendus / mis en avant en priorité" },
  promotions: { label: "Offres du moment (Promotions)", description: "Produits en promotion avec badges de réduction" },
  routine_bundle: { label: "Routine sur-mesure (Basket Booster)", description: "Bundle de 4 soins complémentaires avec bouton 'Ajouter la routine'" },
  new_arrivals: { label: "Nouveautés", description: "Rail de découverte des derniers soins ajoutés au catalogue" },
  featured_brands: { label: "Marques de confiance", description: "Mur de logos/marques dermatologiques partenaires" },
  seasonal_campaign: { label: "Campagne de Saison + Produits", description: "Bannière éditoriale saisonnière associée à 3-4 produits" },
  everyday_essentials: { label: "Les essentiels du quotidien", description: "Produits fréquemment réapprovisionnés" },
  shop_by_budget: { label: "Pour chaque budget", description: "Puces de filtrage rapide par tranche de prix" },
  expert_advice: { label: "Conseils de nos pharmaciens", description: "Guide éditorial mis en avant avec ses soins recommandés" },
  trust_reassurance: { label: "Réassurance & Confiance", description: "Garanties d'authenticité, livraison et conseil pharmacie" },
};

export default function AdminHomepagePage() {
  const { toast } = useToast();

  const [sections, setSections] = useState<AdminSectionConfig[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [pickerSectionKey, setPickerSectionKey] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("best_sellers");

  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  /* Fetch config from Nest API */
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/homepage/admin-config`, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setSections(data.sections || []);
      setCampaigns(data.campaigns || []);
      setProducts(data.products || []);
    } catch {
      toast("error", "Impossible de charger la configuration depuis l'API.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  /* Save Section Config */
  async function handleSaveSection(section: AdminSectionConfig) {
    setSavingKey(section.sectionKey);
    try {
      const res = await fetch(`${API_URL}/homepage/sections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: section.sectionKey,
          enabled: section.enabled,
          position: section.position,
          mode: section.mode,
          title: section.title,
          description: section.description,
          settings: section.settings,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast("success", `Section « ${SECTION_LABELS[section.sectionKey]?.label || section.sectionKey} » enregistrée.`);
    } catch {
      toast("error", "Erreur lors de la sauvegarde.");
    } finally {
      setSavingKey(null);
    }
  }

  /* Toggle Section Enable */
  function handleToggleSection(key: string) {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === key ? { ...s, enabled: !s.enabled } : s))
    );
  }

  /* Update Section Mode */
  function handleModeChange(key: string, mode: "MANUAL" | "AUTOMATIC" | "HYBRID") {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === key ? { ...s, mode } : s))
    );
  }

  /* Update Pinned Products in Section */
  function handleTogglePinProduct(sectionKey: string, productId: string) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.sectionKey !== sectionKey) return s;
        const currentPinned = s.settings.pinnedProductIds || [];
        const exists = currentPinned.includes(productId);
        const nextPinned = exists
          ? currentPinned.filter((id) => id !== productId)
          : [...currentPinned, productId];
        return {
          ...s,
          settings: { ...s.settings, pinnedProductIds: nextPinned },
        };
      })
    );
  }

  const activePickerSection = useMemo(
    () => sections.find((s) => s.sectionKey === pickerSectionKey),
    [sections, pickerSectionKey]
  );

  const filteredProducts = useMemo(() => {
    if (!pickerSearch) return products;
    const q = pickerSearch.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q)
    );
  }, [products, pickerSearch]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LayoutTemplate size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink">Merchandising Page d&apos;accueil</h1>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Pilotez les sections e-commerce, le mode de sélection (*Manuel*, *Automatique*, *Hybride*) et les campagnes saisonnières.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-ink hover:bg-soft-nude transition-colors"
          >
            <Eye size={14} /> Voir le site
          </a>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-l-2 border-l-primary">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider">Sections Actives</span>
            <Layers size={16} className="text-primary" />
          </div>
          <p className="text-xl font-extrabold text-ink font-tabular">
            {sections.filter((s) => s.enabled).length} / {sections.length}
          </p>
          <p className="text-[0.625rem] text-ink-faint mt-0.5">Toutes modifiables sans code</p>
        </div>

        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider">Produits Référencés</span>
            <Package size={16} className="text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 font-tabular">{products.length}</p>
          <p className="text-[0.625rem] text-ink-faint mt-0.5">Avec marges & stocks visibles aux admins</p>
        </div>

        <div className="glass-card p-4 border-l-2 border-l-amber-500">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[0.6875rem] font-bold uppercase tracking-wider">Campagnes Saisonnières</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 font-tabular">{campaigns.length}</p>
          <p className="text-[0.625rem] text-ink-faint mt-0.5">Programmables avec dates d&apos;effet</p>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted border-b border-border pb-2">
          Configuration des Sections de la Page d&apos;accueil
        </h2>

        {loading ? (
          <p className="text-xs text-ink-muted py-8 text-center">Chargement des sections…</p>
        ) : (
          sections
            .filter((section) => section.sectionKey !== "shop_by_need")
            .map((section) => {
            const meta = SECTION_LABELS[section.sectionKey] || {
              label: section.sectionKey,
              description: "",
            };
            const isExpanded = expandedSection === section.sectionKey;
            const pinnedCount = section.settings.pinnedProductIds?.length ?? 0;

            return (
              <div
                key={section.sectionKey}
                className={`rounded-2xl border transition-all ${
                  section.enabled
                    ? "border-border bg-surface-alt"
                    : "border-border/50 bg-soft-nude/20 opacity-75"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedSection(isExpanded ? null : section.sectionKey)}>
                  <div className="flex items-center gap-3">
                    <label
                      className="relative inline-flex items-center cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => handleToggleSection(section.sectionKey)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                    </label>
                    <div>
                      <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                        {meta.label}
                        <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-full bg-soft-nude border border-border text-ink-muted">
                          Key: {section.sectionKey}
                        </span>
                      </h3>
                      <p className="text-[0.6875rem] text-ink-muted mt-0.5">{meta.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[0.625rem] font-bold border ${
                        section.mode === "MANUAL"
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : section.mode === "AUTOMATIC"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {section.mode}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSaveSection(section)}
                      disabled={savingKey === section.sectionKey}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      <Save size={13} />
                      {savingKey === section.sectionKey ? "Enregistrement…" : "Enregistrer"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedSection(isExpanded ? null : section.sectionKey)}
                      className="p-1.5 rounded-lg hover:bg-soft-nude text-ink-muted"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-background/50 rounded-b-2xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[0.75rem] font-medium text-ink mb-1">
                          Titre de la section (Storefront)
                        </label>
                        <input
                          type="text"
                          value={section.title ?? ""}
                          onChange={(e) =>
                            setSections((prev) =>
                              prev.map((s) =>
                                s.sectionKey === section.sectionKey ? { ...s, title: e.target.value } : s
                              )
                            )
                          }
                          className="field-input"
                        />
                      </div>

                      <div>
                        <label className="block text-[0.75rem] font-medium text-ink mb-1">
                          Mode de sélection
                        </label>
                        <select
                          value={section.mode}
                          onChange={(e) =>
                            handleModeChange(
                              section.sectionKey,
                              e.target.value as "MANUAL" | "AUTOMATIC" | "HYBRID"
                            )
                          }
                          className="field-input"
                        >
                          <option value="HYBRID">Hybride (Produits épinglés + auto-remplissage)</option>
                          <option value="AUTOMATIC">Automatique (Règles ventes/nouveautés)</option>
                          <option value="MANUAL">Manuel (Uniquement produits épinglés)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[0.75rem] font-medium text-ink mb-1">
                          Nombre max de produits affichés
                        </label>
                        <input
                          type="number"
                          value={section.settings.limit ?? 8}
                          onChange={(e) =>
                            setSections((prev) =>
                              prev.map((s) =>
                                s.sectionKey === section.sectionKey
                                  ? {
                                      ...s,
                                      settings: { ...s.settings, limit: parseInt(e.target.value) || 8 },
                                    }
                                  : s
                              )
                            )
                          }
                          className="field-input"
                        />
                      </div>
                    </div>

                    {/* Merchandising Product Selector Trigger */}
                    {(section.mode === "MANUAL" || section.mode === "HYBRID") && (
                      <div className="flex items-center justify-between pt-2 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink">
                            Produits épinglés : {pinnedCount} produit{pinnedCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPickerSectionKey(section.sectionKey);
                            setPickerSearch("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold transition-colors"
                        >
                          <Package size={14} /> Épingler / Sélectionner les produits
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Product Selection Drawer */}
      <Drawer
        open={!!pickerSectionKey}
        title={`Sélection des produits — ${SECTION_LABELS[pickerSectionKey || ""]?.label || ""}`}
        description="Cochez les produits à épingler en priorité. Marges et stocks visibles pour la décision marchandise."
        onClose={() => setPickerSectionKey(null)}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Rechercher par nom de produit ou marque…"
              className="field-input pl-9"
            />
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-background max-h-[480px] overflow-y-auto">
            {filteredProducts.map((p) => {
              const isPinned = (activePickerSection?.settings.pinnedProductIds || []).includes(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => pickerSectionKey && handleTogglePinProduct(pickerSectionKey, p.id)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isPinned ? "bg-primary/5" : "hover:bg-soft-nude/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={() => pickerSectionKey && handleTogglePinProduct(pickerSectionKey, p.id)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {p.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-10 w-10 rounded-md object-contain border border-border bg-white"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold text-ink">{p.name}</p>
                      <p className="text-[0.625rem] text-ink-muted">{p.brandName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-extrabold text-ink font-tabular">{p.sellingPrice.toFixed(3)} DT</p>
                      <p className="text-[0.625rem] text-emerald-600 font-semibold font-tabular">
                        Marge: +{p.grossMargin.toFixed(3)} DT
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.6875rem] font-bold text-ink font-tabular">Stock: {p.stock}</p>
                      <p className="text-[0.625rem] text-ink-faint font-tabular">{p.salesCount} ventes</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
