import { useState, useCallback, useMemo } from "react";
import { X, Tags } from "lucide-react";
import { MediaUploader } from "./media-uploader";
import { SeoFormSection } from "./seo-form-section";
import { UnsavedChangesModal } from "./unsaved-changes-modal";

export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentName?: string | null;
  shortDescription?: string;
  description?: string;
  image?: string;
  heroImage?: string;
  position?: number;
  featured?: boolean;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  productCount?: number;
  subcategoriesCount?: number;
  subcategories?: { name: string; slug: string; productCount: number }[];
  h1Title?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  seoContent?: string;
  seoH1?: string;
  seoIntro?: string;
  seoKeywords?: string | string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  imageAlt?: string;
  followLinks?: boolean;
}

interface CategoryDrawerProps {
  open: boolean;
  category?: CategoryModel | null;
  parentCategories: { id: string; name: string }[];
  onClose: () => void;
  onSave: (cat: CategoryModel) => void;
}

export function CategoryDrawer({
  open,
  category,
  parentCategories,
  onClose,
  onSave,
}: CategoryDrawerProps) {
  const isEditing = Boolean(category && category.id);

  const initialFormState: CategoryModel = useMemo(() => {
    if (category) return category;
    return {
      id: "NEW-CATEGORY",
      name: "",
      slug: "",
      parentId: null,
      shortDescription: "",
      description: "",
      image: "",
      heroImage: "",
      position: 1,
      featured: false,
      status: "ACTIVE",
      productCount: 0,
      subcategoriesCount: 0,
      subcategories: [],
      seoTitle: "",
      seoDescription: "",
      indexable: true,
    };
  }, [category]);

  const [form, setForm] = useState<CategoryModel>(initialFormState);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const updateForm = useCallback((fields: Partial<CategoryModel>) => {
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

  const handleSave = useCallback(() => {
    if (!form.name.trim()) return;
    onSave(form);
    setIsDirty(false);
  }, [form, onSave]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
        <div className="w-full max-w-3xl bg-[#F8FAFC] h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Sticky Top Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-[#E11D48] flex items-center justify-center font-bold">
                <Tags size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {isEditing ? `MODIFIER CATÉGORIE: ${form.name}` : "AJOUTER UNE CATÉGORIE"}
                </h2>
                <p className="text-[0.6875rem] font-medium text-slate-500">
                  {form.slug ? `https://paratunisie.com/${form.slug}` : "Nouvelle catégorie catalogue"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C] transition-all shadow-xs active:scale-95"
              >
                Enregistrer la catégorie
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
            {/* SECTION 1: INFORMATIONS DE LA CATÉGORIE */}
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  INFORMATIONS DE LA CATÉGORIE
                </h3>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.featured)}
                    onChange={(e) => updateForm({ featured: e.target.checked })}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                  />
                  Catégorie mise en avant
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    NOM DE LA CATÉGORIE *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="ex: Soins du visage"
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
                    placeholder="ex: soins-visage"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    CATÉGORIE PARENTE (HIÉRARCHIE)
                  </label>
                  <select
                    value={form.parentId || ""}
                    onChange={(e) =>
                      updateForm({
                        parentId: e.target.value || null,
                        parentName: parentCategories.find((p) => p.id === e.target.value)?.name || null,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="">— Racine (Aucune catégorie parente) —</option>
                    {parentCategories
                      .filter((p) => p.id !== form.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                    ORDRE D&apos;AFFICHAGE (POSITION)
                  </label>
                  <input
                    type="number"
                    value={form.position || 1}
                    onChange={(e) => updateForm({ position: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  STATUT DE LA CATÉGORIE
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm({ status: e.target.value as CategoryModel["status"] })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#E11D48]"
                >
                  <option value="ACTIVE">Actif (Visible dans la navigation)</option>
                  <option value="DRAFT">Brouillon (Masqué)</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
                  DESCRIPTION & ACCROCHE ÉDITORIALE
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Présentation synthétique de la gamme de soins de cette catégorie..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>

            {/* SECTION 2: MÉDIAS ET VISUELS */}
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                IMAGES ET VISUELS CATÉGORIE
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MediaUploader
                  label="ICÔNE / IMAGE VIGNETTE"
                  value={form.image}
                  onChange={(url) => updateForm({ image: url })}
                  aspectRatio="square"
                  hint="PNG ou WebP 500x500px"
                />

                <MediaUploader
                  label="BANNIÈRE HERO HAUT DE PAGE"
                  value={form.heroImage}
                  onChange={(url) => updateForm({ heroImage: url })}
                  aspectRatio="wide"
                  hint="Image panoramique HD 1920x400px"
                />
              </div>
            </div>

            {/* SECTION 3: SEO INTEGRATED */}
            <SeoFormSection
              data={{
                seoTitle: form.seoTitle,
                seoDescription: form.seoDescription,
                canonicalUrl: form.canonicalUrl,
                indexable: form.indexable,
                seoContent: form.seoContent,
                seoH1: form.seoH1 || form.h1Title,
                seoIntro: form.seoIntro,
                seoKeywords: form.seoKeywords,
                ogTitle: form.ogTitle,
                ogDescription: form.ogDescription,
                ogImage: form.ogImage,
                imageAlt: form.imageAlt,
                followLinks: form.followLinks,
              }}
              slug={form.slug}
              entityType="category"
              entityId={form.id}
              entityName={form.name || "Catégorie"}
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
