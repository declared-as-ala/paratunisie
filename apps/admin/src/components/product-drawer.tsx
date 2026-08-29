"use client";

import { useState, useCallback } from "react";
import { Drawer } from "@/components/drawer";
import { useToast } from "@/components/toast";
import { ConfirmModal } from "@paratunisie/ui";
import { calculateMargin, marginWarningClass, formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import type { Product, Supplier, PurchasePriceHistory } from "@/lib/types";
import { SeoFormSection } from "./seo-form-section";
import { MediaUploader } from "./media-uploader";

interface ProductDrawerProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  suppliers?: Supplier[];
  purchaseHistory?: PurchasePriceHistory[];
}

export function ProductDrawer({ open, product, onClose, onSave, suppliers = [], purchaseHistory = [] }: ProductDrawerProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Product>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);

  /* Reset the form when the drawer opens for a new target — render-time
     adjustment (React docs: "storing information from previous renders"),
     not a setState-in-effect cascade. */
  const formKey = open ? (product?.id ?? "new") : "closed";
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    if (open) {
      setForm(
        product
          ? { ...product }
          : {
              name: "",
              brand: "",
              category: "",
              sku: "",
              price: 0,
              costPrice: 0,
              stock: 0,
              status: "DRAFT",
              indexable: true,
              image: "",
            }
      );
      setIsDirty(false);
    }
  }

  const update = useCallback(
    (field: string, value: string | number | boolean | undefined) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    },
    []
  );

  const margin =
    form.costPrice && form.price
      ? calculateMargin(form.costPrice, form.price, form.compareAtPrice)
      : null;

  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowUnsaved(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const confirmClose = useCallback(() => {
    setShowUnsaved(false);
    setIsDirty(false);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (!form.name || !form.brand) {
      toast("error", "Veuillez remplir les champs obligatoires.");
      return;
    }
    onSave(form as Product);
    setIsDirty(false);
    toast("success", product ? "Produit mis à jour." : "Produit créé.");
    onClose();
  }, [form, onSave, onClose, product, toast]);

  return (
    <>
      <Drawer
        open={open}
        title={product ? "Modifier le produit" : "Nouveau produit"}
        description={product ? product.name : "Ajouter un produit au catalogue"}
        onClose={handleClose}
        footer={
          <>
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-ink-muted hover:bg-soft-nude transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-sm font-semibold rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              {product ? "Enregistrer" : "Créer le produit"}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* ── Photo du produit ── */}
          <Section title="Photo du produit">
            <MediaUploader
              label="Photo principale du produit"
              value={form.image ?? ""}
              onChange={(url) => update("image", url)}
              altText={form.imageAlt ?? form.name ?? ""}
              onAltTextChange={(alt) => update("imageAlt", alt)}
              aspectRatio="square"
              hint="PNG, JPG, WebP jusqu'à 8MB — téléversement direct ou lien URL"
            />
          </Section>

          {/* ── A. Informations principales ── */}
          <Section title="Informations principales">
            <Field label="Nom du produit" required>
              <input
                type="text"
                value={form.name ?? ""}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Sensibio H2O 500ml"
                className="field-input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marque" required>
                <select
                  value={form.brand ?? ""}
                  onChange={(e) => update("brand", e.target.value)}
                  className="field-input"
                >
                  <option value="">Sélectionner…</option>
                  <option>Bioderma</option>
                  <option>Avène</option>
                  <option>La Roche-Posay</option>
                  <option>Vichy</option>
                  <option>CeraVe</option>
                  <option>SVR</option>
                  <option>Mustela</option>
                  <option>Nuxe</option>
                  <option>Uriage</option>
                  <option>Laboratoires Théa</option>
                </select>
              </Field>
              <Field label="Catégorie">
                <select
                  value={form.category ?? ""}
                  onChange={(e) => update("category", e.target.value)}
                  className="field-input"
                >
                  <option value="">Sélectionner…</option>
                  <option>Soins du visage</option>
                  <option>Hydratation</option>
                  <option>Nettoyage</option>
                  <option>Sérum</option>
                  <option>Anti-âge</option>
                  <option>Solaire</option>
                  <option>Réparation</option>
                  <option>Peaux grasses</option>
                  <option>Eau thermale</option>
                  <option>Bébé</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU">
                <input
                  type="text"
                  value={form.sku ?? ""}
                  onChange={(e) => update("sku", e.target.value)}
                  placeholder="BIO-SH2O-500"
                  className="field-input font-mono"
                />
              </Field>
              <Field label="Code-barres">
                <input
                  type="text"
                  value={form.barcode ?? ""}
                  onChange={(e) => update("barcode", e.target.value)}
                  placeholder="Optionnel"
                  className="field-input font-mono"
                />
              </Field>
            </div>
            <Field label="Statut">
              <select
                value={form.status ?? "DRAFT"}
                onChange={(e) => update("status", e.target.value)}
                className="field-input"
              >
                <option value="ACTIVE">Actif</option>
                <option value="DRAFT">Brouillon</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </Field>
          </Section>

          {/* ── B. Pricing ── */}
          <Section title="Tarification">
            <Field label="Fournisseur">
              <select
                value={form.supplierId ?? ""}
                onChange={(e) => update("supplierId", e.target.value || undefined)}
                className="field-input"
              >
                <option value="">Aucun fournisseur</option>
                {suppliers.filter((s) => s.status === "ACTIVE").map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Coût d'acquisition (fournisseur)" hint="Prix d'achat unitaire HT">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.costPrice ?? ""}
                  onChange={(e) => update("costPrice", parseFloat(e.target.value) || 0)}
                  placeholder="0.000"
                  className="field-input tabular-nums"
                />
              </Field>
              <Field label="Prix de vente" required>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.price ?? ""}
                  onChange={(e) => update("price", parseFloat(e.target.value) || 0)}
                  placeholder="0.000"
                  className="field-input tabular-nums"
                />
              </Field>
            </div>
            <Field label="Prix promotionnel" hint="Optionnel — doit être inférieur au prix de vente">
              <input
                type="number"
                step="0.001"
                min="0"
                value={form.compareAtPrice ?? ""}
                onChange={(e) => update("compareAtPrice", parseFloat(e.target.value) || undefined)}
                placeholder="Optionnel"
                className="field-input tabular-nums"
              />
            </Field>

            {/* Margin display */}
            {margin && form.costPrice! > 0 && (
              <div className="rounded-lg border border-border bg-background p-3 mt-1">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted mb-2">
                  Rentabilité
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[0.625rem] text-ink-faint uppercase">Marge brute</p>
                    <p className={`text-sm font-semibold tabular-nums mt-0.5 ${marginWarningClass(margin)}`}>
                      {formatCurrency(margin.margeBrute)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.625rem] text-ink-faint uppercase">Taux de marge</p>
                    <p className={`text-sm font-semibold tabular-nums mt-0.5 ${marginWarningClass(margin)}`}>
                      {formatPercent(margin.tauxMarge)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.625rem] text-ink-faint uppercase">Taux de marque</p>
                    <p className={`text-sm font-semibold tabular-nums mt-0.5 ${marginWarningClass(margin)}`}>
                      {formatPercent(margin.tauxMarque)}
                    </p>
                  </div>
                </div>
                {margin.margeBrute <= 0 && (
                  <p className="text-[0.6875rem] text-danger mt-2 flex items-center gap-1">
                    <span>⚠</span> Marge négative — le prix de vente est inférieur au coût
                  </p>
                )}
                {margin.margeBrute > 0 && margin.tauxMarque < 15 && (
                  <p className="text-[0.6875rem] text-warning mt-2 flex items-center gap-1">
                    <span>⚠</span> Marge faible — taux de marque inférieur à 15 %
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* ── C. Inventaire ── */}
          <Section title="Inventaire">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock disponible">
                <input
                  type="number"
                  min="0"
                  value={form.stock ?? ""}
                  onChange={(e) => update("stock", parseInt(e.target.value) || 0)}
                  className="field-input tabular-nums"
                />
              </Field>
              <Field label="Seuil de réapprovisionnement" hint="Alerte quand le stock atteint ce seuil">
                <input
                  type="number"
                  min="0"
                  value={form.reorderThreshold ?? ""}
                  onChange={(e) => update("reorderThreshold", parseInt(e.target.value) || undefined)}
                  placeholder="5"
                  className="field-input tabular-nums"
                />
              </Field>
            </div>
          </Section>

          {/* ── C2. Purchase price history ── */}
          {product && purchaseHistory.length > 0 && (
            <Section title="Historique des prix d'achat">
              <div className="rounded-lg border border-border bg-background p-3 space-y-2">
                {purchaseHistory
                  .filter((h) => h.productId === product.id)
                  .sort((a, b) => new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime())
                  .map((entry) => {
                    const isActive = entry.purchasePrice === form.costPrice;
                    return (
                      <div key={entry.id} className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${isActive ? "bg-primary/8 border border-primary/20" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-ink-muted">{formatDate(entry.effectiveDate)}</span>
                          <span className="text-ink-faint">—</span>
                          <span className="text-ink-muted">{entry.supplierName}</span>
                          {entry.notes && <span className="text-ink-faint italic">({entry.notes})</span>}
                        </div>
                        <span className={`font-semibold tabular-nums ${isActive ? "text-primary" : "text-ink"}`}>
                          {formatCurrency(entry.purchasePrice)}
                        </span>
                      </div>
                    );
                  })}
                {purchaseHistory.filter((h) => h.productId === product.id).length === 0 && (
                  <p className="text-xs text-ink-faint text-center py-1">Aucun historique pour ce produit</p>
                )}
              </div>
            </Section>
          )}

          {/* ── D. Description ── */}
          <Section title="Description & détails">
            <Field label="Description courte" hint="Apparaît sur les cartes produits">
              <input
                type="text"
                value={form.shortDescription ?? ""}
                onChange={(e) => update("shortDescription", e.target.value)}
                placeholder="1-2 lignes max"
                className="field-input"
              />
            </Field>
            <Field label="Description longue">
              <textarea
                value={form.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Description détaillée du produit…"
                rows={3}
                className="field-input resize-none"
              />
            </Field>
            <Field label="Mode d'emploi">
              <textarea
                value={form.usage ?? ""}
                onChange={(e) => update("usage", e.target.value)}
                placeholder="Comment utiliser ce produit…"
                rows={2}
                className="field-input resize-none"
              />
            </Field>
          </Section>

          {/* ── E. SEO ── */}
          <Section title="SEO">
            <Field label="Slug" hint="Généré automatiquement si laissé vide">
              <input
                type="text"
                value={form.slug ?? ""}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="sensibio-h2o-500ml"
                className="field-input font-mono"
              />
            </Field>
          </Section>
          <SeoFormSection
            data={{ seoTitle: form.seoTitle, seoDescription: form.seoDescription ?? form.metaDescription, seoH1: form.seoH1, seoIntro: form.seoIntro, seoContent: form.seoContent, seoKeywords: form.seoKeywords, canonicalUrl: form.canonicalUrl, ogTitle: form.ogTitle, ogDescription: form.ogDescription, ogImage: form.ogImage, imageAlt: form.imageAlt, indexable: form.indexable, followLinks: form.followLinks }}
            slug={form.slug || ""}
            entityName={form.name || "Produit"}
            entityType="product"
            entityId={form.id}
            pathPrefix="/produits"
            onChange={(seo) => { setForm((prev) => ({ ...prev, ...seo, metaDescription: seo.seoDescription })); setIsDirty(true); }}
          />
        </div>
      </Drawer>

      {/* Unsaved changes modal */}
      <ConfirmModal
        open={showUnsaved}
        title="Modifications non enregistrées"
        description="Vous avez des modifications non enregistrées. Voulez-vous quitter sans sauvegarder ?"
        confirmLabel="Quitter sans enregistrer"
        cancelLabel="Continuer l'édition"
        variant="danger"
        onConfirm={confirmClose}
        onCancel={() => setShowUnsaved(false)}
      />
    </>
  );
}

/* ── Section & Field helpers ────────────────────────────────────────────── */

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
