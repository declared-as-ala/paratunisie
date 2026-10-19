"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Save, Smartphone, Star } from "lucide-react";
import { apiClient, ApiError, resolveMediaUrl } from "@/lib/api-client";
import { useToast } from "@/components/toast";

export const FEATURED_SECTION_KEY = "featured_product";
const DEFAULT_SLUG = "anabolic-whey-80-2-25kg-proactive";

export interface FeaturedSection {
  enabled: boolean;
  title?: string;
  description?: string;
  settings: {
    productSlug?: string;
    bullets?: string[];
    ctaLabel?: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
    startsAt?: string;
    endsAt?: string;
  };
}

export interface PickerProduct {
  id: string;
  name: string;
  slug: string;
  image?: string;
  brandName: string;
  sellingPrice: number; // TND
  stock: number;
}

const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Admin control for the homepage featured product. Price and stock are read from the product, never stored here. */
export function FeaturedProductPanel({ section, products }: { section: FeaturedSection | null; products: PickerProduct[] }) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(section?.enabled ?? true);
  const [slug, setSlug] = useState(section?.settings.productSlug || DEFAULT_SLUG);
  const [headline, setHeadline] = useState(section?.title ?? "");
  const [description, setDescription] = useState(section?.description ?? "");
  const [bullets, setBullets] = useState((section?.settings.bullets ?? []).join("\n"));
  const [ctaLabel, setCtaLabel] = useState(section?.settings.ctaLabel ?? "");
  const [secLabel, setSecLabel] = useState(section?.settings.secondaryCtaLabel ?? (section ? "" : "Voir toutes les whey"));
  const [secUrl, setSecUrl] = useState(section?.settings.secondaryCtaUrl ?? (section ? "" : "/whey-proteine"));
  const [startsAt, setStartsAt] = useState(toLocalInput(section?.settings.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(section?.settings.endsAt));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    if (!section) return;
    setEnabled(section.enabled);
    setSlug(section.settings.productSlug || DEFAULT_SLUG);
    setHeadline(section.title ?? "");
    setDescription(section.description ?? "");
    setBullets((section.settings.bullets ?? []).join("\n"));
    setCtaLabel(section.settings.ctaLabel ?? "");
    setSecLabel(section.settings.secondaryCtaLabel ?? "");
    setSecUrl(section.settings.secondaryCtaUrl ?? "");
    setStartsAt(toLocalInput(section.settings.startsAt));
    setEndsAt(toLocalInput(section.settings.endsAt));
  }, [section]);

  const selected = products.find((p) => p.slug === slug);
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => `${p.name} ${p.brandName}`.toLowerCase().includes(q)).slice(0, 8);
  }, [products, search]);

  const invalidUrl = secUrl.trim() !== "" && !secUrl.trim().startsWith("/");
  const invalidRange = Boolean(startsAt && endsAt && new Date(startsAt) >= new Date(endsAt));

  async function save() {
    if (!selected && products.length > 0) {
      toast("error", "Choisissez un produit existant.");
      return;
    }
    if (invalidUrl || invalidRange) {
      toast("error", invalidUrl ? "Le lien secondaire doit commencer par « / »." : "La date de fin doit suivre la date de début.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch("/homepage/sections", {
        sectionKey: FEATURED_SECTION_KEY,
        enabled,
        position: 0,
        mode: "MANUAL",
        title: headline.trim() || undefined,
        description: description.trim() || undefined,
        settings: {
          productSlug: slug,
          bullets: bullets.split("\n").map((b) => b.trim()).filter(Boolean).slice(0, 4),
          ctaLabel: ctaLabel.trim() || undefined,
          secondaryCtaLabel: secLabel.trim() || undefined,
          secondaryCtaUrl: secUrl.trim() || undefined,
          startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        },
      });
      toast("success", "Produit vedette enregistré. Visible sur l'accueil immédiatement.");
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : "Impossible d'enregistrer le produit vedette.");
    } finally {
      setSaving(false);
    }
  }

  const name = headline.trim() || selected?.name || "Produit vedette";
  const inStock = (selected?.stock ?? 0) > 0;

  return (
    <section className="admin-card p-5" aria-labelledby="featured-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft/70 text-primary"><Star size={18} /></span>
          <div>
            <h2 id="featured-title" className="text-sm font-bold text-ink">Produit vedette de l&apos;accueil</h2>
            <p className="text-xs text-ink-muted">Affiché en haut de la page d&apos;accueil. Prix et stock viennent toujours de la fiche produit.</p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="size-4 rounded border-border accent-[var(--color-primary)]" />
          Promotion active
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-muted">Produit</label>
            {selected ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-soft-nude/40 p-2.5">
                {selected.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={resolveMediaUrl(selected.image)} alt="" className="size-12 rounded-lg bg-white object-contain" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{selected.name}</p>
                  <p className="text-xs text-ink-muted">{selected.brandName} · {selected.sellingPrice.toFixed(3)} DT · {selected.stock > 0 ? "en stock" : "rupture"}</p>
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-2.5 text-xs text-ink-muted">Produit actuel : {slug}</p>
            )}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un autre produit à mettre en avant…"
              className="field-input mt-2"
            />
            {matches.length > 0 && (
              <ul className="mt-1 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                {matches.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => { setSlug(p.slug); setSearch(""); }} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-soft-nude">
                      <span className="truncate font-medium text-ink">{p.name}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{p.sellingPrice.toFixed(3)} DT</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Titre (laisser vide = nom du produit)</label>
              <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={120} className="field-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Description (laisser vide = bénéfice de la fiche produit)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={280} rows={2} className="field-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Points forts vérifiés (un par ligne, 4 maximum)</label>
              <textarea value={bullets} onChange={(e) => setBullets(e.target.value)} rows={3} className="field-input" placeholder="N'indiquez que des informations exactes et vérifiables." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Texte du bouton principal</label>
              <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} maxLength={40} placeholder="Acheter maintenant" className="field-input" />
            </div>
            <div />
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Lien secondaire — texte</label>
              <input value={secLabel} onChange={(e) => setSecLabel(e.target.value)} maxLength={40} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Lien secondaire — URL du site</label>
              <input value={secUrl} onChange={(e) => setSecUrl(e.target.value)} placeholder="/whey-proteine" className="field-input" aria-invalid={invalidUrl} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Début (optionnel)</label>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">Fin (optionnel)</label>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="field-input" aria-invalid={invalidRange} />
            </div>
          </div>

          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60">
            <Save size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>

        {/* Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Aperçu</span>
            <div className="inline-flex rounded-lg border border-border bg-soft-nude p-0.5">
              {(["mobile", "desktop"] as const).map((d) => (
                <button key={d} type="button" onClick={() => setDevice(d)} aria-pressed={device === d} className={`rounded-md px-2 py-1 ${device === d ? "bg-white text-primary shadow-sm" : "text-ink-muted"}`} aria-label={d === "mobile" ? "Aperçu mobile" : "Aperçu ordinateur"}>
                  {d === "mobile" ? <Smartphone size={14} /> : <Monitor size={14} />}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#FCF8F6] to-[#F5ECE8] p-3">
            <div className={`mx-auto ${device === "mobile" ? "max-w-[15rem]" : "max-w-full"} ${device === "desktop" ? "grid grid-cols-2 items-center gap-3" : ""}`}>
              <div className={`flex aspect-[5/4] items-center justify-center rounded-xl bg-white ${device === "desktop" ? "order-2" : ""}`}>
                {selected?.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={resolveMediaUrl(selected.image)} alt="" className="h-full w-full object-contain p-2" /> : <span className="text-xs text-ink-faint">Image du produit</span>}
              </div>
              <div className={device === "mobile" ? "mt-3" : ""}>
                <p className="line-clamp-2 font-serif text-sm font-bold leading-tight text-ink">{name}</p>
                <p className="mt-1 text-lg font-extrabold text-ink">{selected ? `${selected.sellingPrice.toFixed(3)} DT` : "—"}</p>
                <p className={`text-[0.6875rem] font-semibold ${inStock ? "text-emerald-700" : "text-amber-700"}`}>{inStock ? "En stock" : "Indisponible"}</p>
                <div className="mt-2 rounded-lg bg-primary px-3 py-2 text-center text-xs font-bold text-primary-foreground">{ctaLabel.trim() || "Acheter maintenant"}</div>
              </div>
            </div>
          </div>
          {!enabled && <p className="mt-2 text-xs font-medium text-amber-700">Désactivé : l&apos;accueil affichera l&apos;ancienne bannière.</p>}
        </div>
      </div>
    </section>
  );
}
