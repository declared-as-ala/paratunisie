import { useState, useCallback, useMemo } from "react";
import { X, Sparkles, Building2, Check, LoaderCircle, AlertCircle } from "lucide-react";
import { MediaUploader } from "./media-uploader";
import { SeoFormSection } from "./seo-form-section";
import { UnsavedChangesModal } from "./unsaved-changes-modal";

export interface BrandModel {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  logo?: string;
  logoAlt?: string;
  heroImage?: string;
  mobileHeroImage?: string;
  featured?: boolean;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  origin?: string;
  universe?: string;
  specialties?: string[];
  productCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  seoH1?: string;
  seoIntro?: string;
  seoContent?: string;
  seoKeywords?: string | string[];
  ogImage?: string;
  imageAlt?: string;
  followLinks?: boolean;
}

interface MarqueDrawerProps {
  open: boolean;
  brand?: BrandModel | null;
  onClose: () => void;
  onSave: (brand: BrandModel) => Promise<void>;
}

const SPECIALTIES_OPTIONS = [
  "Dermatologique",
  "Peaux sensibles",
  "Solaire",
  "Bébé & Maman",
  "Capillaire",
  "Anti-âge",
  "Imperfections & Acné",
  "Hydratation intense",
  "Bio & Naturel",
];

export function MarqueDrawer({ open, brand, onClose, onSave }: MarqueDrawerProps) {
  const isEditing = Boolean(brand && brand.id);

  const initialFormState: BrandModel = useMemo(() => {
    if (brand) return brand;
    return {
      id: "NEW-BRAND",
      name: "",
      slug: "",
      tagline: "",
      shortDescription: "",
      description: "",
      logo: "",
      logoAlt: "",
      heroImage: "",
      mobileHeroImage: "",
      featured: false,
      status: "ACTIVE",
      origin: "France",
      universe: "Dermocosmétique",
      specialties: ["Dermatologique", "Peaux sensibles"],
      productCount: 0,
      seoTitle: "",
      seoDescription: "",
      indexable: true,
    };
  }, [brand]);

  const [form, setForm] = useState<BrandModel>(initialFormState);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateForm = useCallback((fields: Partial<BrandModel>) => {
    setForm((prev) => ({ ...prev, ...fields }));
    setIsDirty(true);
  }, []);

  const handleNameChange = useCallback(
    (name: string) => {
      const generatedSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      updateForm({
        name,
        slug: form.slug === "" || !isEditing ? generatedSlug : form.slug,
      });
    },
    [form.slug, isEditing, updateForm]
  );

  const handleCloseAttempt = useCallback(() => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(form);
      setIsDirty(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Impossible d’enregistrer la marque.");
    } finally {
      setSaving(false);
    }
  }, [form, onSave]);

  const toggleSpecialty = useCallback(
    (spec: string) => {
      const current = form.specialties || [];
      const updated = current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec];
      updateForm({ specialties: updated });
    },
    [form.specialties, updateForm]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
        <div className="w-full max-w-3xl bg-[#F8FAFC] h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Sticky Top Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-[#E11D48] flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {isEditing ? `MODIFIER MARQUE: ${form.name}` : "AJOUTER UNE NOUVELLE MARQUE"}
                </h2>
                <p className="text-[0.6875rem] font-medium text-slate-500">
                  {form.slug ? `https://paratunisie.com/marques/${form.slug}` : "Nouvelle fiche marque"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || !form.name.trim() || !form.slug.trim()}
                className="inline-flex min-h-11 items-center gap-2 px-5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C] transition-all shadow-xs active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
                {saving ? "Enregistrement…" : "Enregistrer la marque"}
              </button>
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6">
            {saveError && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{saveError}</span>
              </div>
            )}
            {/* SECTION 1: INFORMATIONS GÉNÉRALES */}
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  INFORMATIONS GÉNÉRALES
                </h3>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={(e) => updateForm({ featured: e.target.checked })}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  <Sparkles size={14} className="text-amber-500" /> Marque Iconique (Vitrine)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    NOM DE LA MARQUE *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="ex: Bioderma"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    SLUG URL
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateForm({ slug: e.target.value })}
                    placeholder="ex: bioderma"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  TAGLINE / SLOGAN
                </label>
                <input
                  type="text"
                  value={form.tagline || ""}
                  onChange={(e) => updateForm({ tagline: e.target.value })}
                  placeholder="ex: La biologie au service de la dermatologie"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  STATUT DE LA MARQUE
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm({ status: e.target.value as BrandModel["status"] })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#E11D48]"
                >
                  <option value="ACTIVE">Actif (Visible sur la boutique)</option>
                  <option value="DRAFT">Brouillon (Masqué)</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  DESCRIPTION & HISTOIRE DE LA MARQUE
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Présentation complète et engagements dermatologiques de la marque..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>

            {/* SECTION 2: IMAGES ET MÉDIAS */}
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                LOGOS & BANNIÈRES VITRINE
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MediaUploader
                  label="LOGO OFFICIEL MARQUE"
                  value={form.logo}
                  onChange={(url) => updateForm({ logo: url })}
                  altText={form.logoAlt}
                  onAltTextChange={(alt) => updateForm({ logoAlt: alt })}
                  aspectRatio="square"
                  hint="PNG ou SVG fond transparent"
                />

                <MediaUploader
                  label="BANNIÈRE HERO DESKTOP"
                  value={form.heroImage}
                  onChange={(url) => updateForm({ heroImage: url })}
                  aspectRatio="wide"
                  hint="Image HD 1920x600px"
                />
              </div>
            </div>

            {/* SECTION 3: POSITIONNEMENT ET SPÉCIALITÉS */}
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                POSITIONNEMENT & UNIVERS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    PAYS D&apos;ORIGINE
                  </label>
                  <input
                    type="text"
                    value={form.origin || ""}
                    onChange={(e) => updateForm({ origin: e.target.value })}
                    placeholder="ex: France, Tunisie, Italie"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    UNIVERS DE MARQUE
                  </label>
                  <input
                    type="text"
                    value={form.universe || ""}
                    onChange={(e) => updateForm({ universe: e.target.value })}
                    placeholder="ex: Dermocosmétique, Solaire, Phytothérapie"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  SPÉCIALITÉS & DOMAINES D&apos;EXPERTISE
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SPECIALTIES_OPTIONS.map((spec) => {
                    const selected = (form.specialties || []).includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selected
                            ? "bg-[#E11D48] text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-[#E11D48]"
                        }`}
                      >
                        {selected && <Check size={14} strokeWidth={3} />}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 4: SEO INTEGRATED */}
            <SeoFormSection
              data={{
                seoTitle: form.seoTitle,
                seoDescription: form.seoDescription,
                canonicalUrl: form.canonicalUrl,
                indexable: form.indexable,
                ogTitle: form.ogTitle,
                ogDescription: form.ogDescription,
                seoH1: form.seoH1,
                seoIntro: form.seoIntro,
                seoContent: form.seoContent,
                seoKeywords: form.seoKeywords,
                ogImage: form.ogImage,
                imageAlt: form.imageAlt,
                followLinks: form.followLinks,
              }}
              slug={form.slug}
              entityType="brand"
              entityId={form.id}
              pathPrefix="/marques"
              entityName={form.name || "Marque"}
              onChange={(seo) => updateForm(seo)}
            />
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning Modal */}
      <UnsavedChangesModal
        open={showUnsavedModal}
        onContinueEditing={() => setShowUnsavedModal(false)}
        onDiscardAndLeave={() => {
          setShowUnsavedModal(false);
          onClose();
        }}
      />
    </>
  );
}
