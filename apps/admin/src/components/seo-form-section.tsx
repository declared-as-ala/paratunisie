"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Globe, LoaderCircle, Search, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export interface SeoData {
  seoTitle?: string; seoDescription?: string; seoH1?: string; seoIntro?: string; seoContent?: string;
  seoKeywords?: string | string[]; canonicalUrl?: string; indexable?: boolean; followLinks?: boolean;
  ogTitle?: string; ogDescription?: string; ogImage?: string; imageAlt?: string;
}

interface Props {
  data: SeoData; slug: string; entityName: string; entityType?: "product" | "category" | "brand";
  entityId?: string; pathPrefix?: string; onChange: (updated: SeoData) => void;
}

const control = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15";
const present = (value: unknown) => typeof value === "boolean" ? value : Boolean(String(value ?? "").trim());

export function SeoFormSection({ data, slug, entityName, entityType, entityId, pathPrefix = "", onChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const canonical = data.canonicalUrl || `https://paratunisie.com${pathPrefix}/${slug}`.replace(/([^:]\/)\/+/, "$1");
  const title = data.seoTitle || `${entityName} en Tunisie | ParaTunisie`;
  const description = data.seoDescription || `Découvrez ${entityName} sur ParaTunisie, votre parapharmacie en ligne en Tunisie.`;
  const checks = useMemo(() => [
    ["Titre SEO", data.seoTitle], ["Méta description", data.seoDescription], ["H1", data.seoH1], ["Slug", slug],
    ["Canonical", data.canonicalUrl], ["Texte alternatif", data.imageAlt], ["Open Graph", data.ogTitle && data.ogDescription && data.ogImage], ["Contenu SEO", data.seoContent],
  ].map(([label, value]) => ({ label: String(label), passed: present(value) })), [data, slug]);
  const percentage = Math.round((checks.filter((item) => item.passed).length / checks.length) * 100);
  const keywords = Array.isArray(data.seoKeywords) ? data.seoKeywords.join(", ") : data.seoKeywords || "";
  const update = (key: keyof SeoData, value: SeoData[keyof SeoData]) => onChange({ ...data, [key]: value });

  async function generate() {
    if (!entityType || !entityId || entityId.startsWith("NEW")) return;
    setGenerating(true);
    try {
      const generated = await apiClient.post<SeoData>(`/catalogue/seo/generate/${entityType}/${entityId}`, { save: false });
      onChange({ ...data, ...generated });
    } finally { setGenerating(false); }
  }

  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="seo-editor-title">
    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex items-center gap-2"><Globe className="size-5 text-rose-600" /><h3 id="seo-editor-title" className="text-sm font-black uppercase tracking-wide text-slate-900">Référencement naturel</h3></div><p className="mt-1 text-xs text-slate-500">Les valeurs personnalisées ont toujours priorité sur les suggestions.</p></div>
      {entityType && entityId && !entityId.startsWith("NEW") && <button type="button" onClick={generate} disabled={generating} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">{generating ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{generating ? "Génération…" : "Générer SEO"}</button>}
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-slate-500">Aperçu Google</p><div className="flex min-w-0 items-center gap-1 text-xs text-emerald-700"><Search className="size-3.5 shrink-0" /><span className="truncate">{canonical}</span></div><p className="mt-1 break-words text-lg font-medium leading-snug text-blue-800">{title}</p><p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p></div>
      <div className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Score SEO</span><span className="text-lg font-black tabular-nums text-slate-900">{percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${percentage}%` }} /></div><ul className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[0.6875rem]">{checks.map((item) => <li key={item.label} className={`flex items-center gap-1 ${item.passed ? "text-emerald-700" : "text-slate-500"}`}>{item.passed ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />}<span>{item.label}</span></li>)}</ul></div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2"><Field label="Titre SEO" counter={`${(data.seoTitle || "").length} caractères · conseillé 50–60`}><input className={control} value={data.seoTitle || ""} onChange={(e) => update("seoTitle", e.target.value)} placeholder={`${entityName} en Tunisie | ParaTunisie`} /></Field><Field label="H1"><input className={control} value={data.seoH1 || ""} onChange={(e) => update("seoH1", e.target.value)} placeholder={`${entityName} en Tunisie`} /></Field></div>
    <Field label="Méta description" counter={`${(data.seoDescription || "").length} caractères · conseillé 140–160`}><textarea rows={3} className={`${control} resize-y`} value={data.seoDescription || ""} onChange={(e) => update("seoDescription", e.target.value)} /></Field>
    <Field label="URL canonique"><input type="url" className={`${control} font-mono text-xs`} value={data.canonicalUrl || ""} onChange={(e) => update("canonicalUrl", e.target.value)} placeholder={canonical} /></Field>
    <Field label="Introduction SEO"><textarea rows={3} className={`${control} resize-y`} value={data.seoIntro || ""} onChange={(e) => update("seoIntro", e.target.value)} /></Field>
    <Field label="Contenu SEO long" hint="Affiché sous les produits afin de préserver une expérience d’achat claire."><textarea rows={6} className={`${control} resize-y`} value={data.seoContent || ""} onChange={(e) => update("seoContent", e.target.value)} /></Field>
    <Field label="Mots-clés de recherche" hint="Séparez les expressions par des virgules."><input className={control} value={keywords} onChange={(e) => update("seoKeywords", e.target.value)} /></Field>
    <fieldset className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"><legend className="px-2 text-xs font-black uppercase tracking-wider text-slate-700">Open Graph</legend><Field label="Titre Open Graph"><input className={control} value={data.ogTitle || ""} onChange={(e) => update("ogTitle", e.target.value)} /></Field><Field label="Image Open Graph"><input className={control} value={data.ogImage || ""} onChange={(e) => update("ogImage", e.target.value)} placeholder="/uploads/… ou https://…" /></Field><div className="sm:col-span-2"><Field label="Description Open Graph"><textarea rows={3} className={`${control} resize-y`} value={data.ogDescription || ""} onChange={(e) => update("ogDescription", e.target.value)} /></Field></div></fieldset>
    <Field label="Texte alternatif de l’image"><input className={control} value={data.imageAlt || ""} onChange={(e) => update("imageAlt", e.target.value)} /></Field>
    <div className="grid gap-3 sm:grid-cols-2"><Toggle label="Autoriser l’indexation" checked={data.indexable !== false} onChange={(checked) => update("indexable", checked)} /><Toggle label="Autoriser le suivi des liens" checked={data.followLinks !== false} onChange={(checked) => update("followLinks", checked)} /></div>
  </section>;
}

function Field({ label, counter, hint, children }: { label: string; counter?: string; hint?: string; children: React.ReactNode }) { return <label className="block min-w-0 space-y-1.5"><span className="flex flex-wrap items-baseline justify-between gap-1 text-xs font-bold text-slate-700"><span>{label}</span>{counter && <span className="font-medium text-slate-500">{counter}</span>}</span>{children}{hint && <span className="block text-xs leading-relaxed text-slate-500">{hint}</span>}</label>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500" /><span>{label}</span></label>; }
