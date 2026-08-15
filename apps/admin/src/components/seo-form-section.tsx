"use client";

import { Globe, Search } from "lucide-react";

export interface SeoData {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  seoContent?: string;
}

interface SeoFormSectionProps {
  data: SeoData;
  slug: string;
  entityName: string;
  baseUrl?: string;
  onChange: (updated: SeoData) => void;
}

export function SeoFormSection({
  data,
  slug,
  entityName,
  baseUrl = "https://paratunisie.com",
  onChange,
}: SeoFormSectionProps) {
  const seoTitle = data.seoTitle || `${entityName} Tunisie | Produits & Prix | ParaTunisie`;
  const seoDesc =
    data.seoDescription ||
    `Découvrez ${entityName} en Tunisie : soins dermatologiques, prix officiels et conseils parapharmaceutiques sur ParaTunisie.`;
  const indexable = data.indexable ?? true;
  const canonical = data.canonicalUrl || `${baseUrl}/${slug}`;

  const titleLength = (data.seoTitle || "").length;
  const descLength = (data.seoDescription || "").length;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[#E11D48]" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            RÉFÉRENCEMENT NATUREL (SEO) & OPEN GRAPH
          </h3>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={indexable}
            onChange={(e) => onChange({ ...data, indexable: e.target.checked })}
            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
          />
          {indexable ? "Indexable (Google)" : "NoIndex (Masqué)"}
        </label>
      </div>

      {/* Live Google Search Snippet Preview */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
        <div className="flex items-center gap-1 text-[0.6875rem] text-slate-500 font-mono">
          <Search size={12} className="text-slate-400" />
          <span>{canonical}</span>
        </div>
        <h4 className="text-sm font-bold text-blue-700 hover:underline cursor-pointer truncate">
          {seoTitle}
        </h4>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{seoDesc}</p>
      </div>

      {/* SEO Title Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
            TITRE SEO (TITLE TAG)
          </label>
          <span
            className={`text-[0.625rem] font-bold ${
              titleLength >= 50 && titleLength <= 60
                ? "text-emerald-600"
                : titleLength > 60
                ? "text-rose-600"
                : "text-amber-600"
            }`}
          >
            {titleLength} / 60 caractères (Recommandé: 50-60)
          </span>
        </div>
        <input
          type="text"
          value={data.seoTitle || ""}
          onChange={(e) => onChange({ ...data, seoTitle: e.target.value })}
          placeholder={`${entityName} Tunisie | Produits & Prix | ParaTunisie`}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E11D48]"
        />
      </div>

      {/* Meta Description Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
            MÉTA DESCRIPTION
          </label>
          <span
            className={`text-[0.625rem] font-bold ${
              descLength >= 140 && descLength <= 160
                ? "text-emerald-600"
                : descLength > 160
                ? "text-rose-600"
                : "text-amber-600"
            }`}
          >
            {descLength} / 160 caractères (Recommandé: 140-160)
          </span>
        </div>
        <textarea
          value={data.seoDescription || ""}
          onChange={(e) => onChange({ ...data, seoDescription: e.target.value })}
          placeholder={`Découvrez ${entityName} en Tunisie : soins visage, solaires et conseils experts.`}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
        />
      </div>

      {/* Canonical URL */}
      <div className="space-y-1.5">
        <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
          URL CANONIQUE (CANONICAL)
        </label>
        <input
          type="text"
          value={data.canonicalUrl || ""}
          onChange={(e) => onChange({ ...data, canonicalUrl: e.target.value })}
          placeholder={canonical}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#E11D48]"
        />
      </div>

      {/* Editorial SEO Bottom Content */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-[0.6875rem] font-bold text-slate-700 uppercase tracking-wider">
          CONTENU ÉDITORIAL SEO (BAS DE PAGE)
        </label>
        <textarea
          value={data.seoContent || ""}
          onChange={(e) => onChange({ ...data, seoContent: e.target.value })}
          placeholder="Texte explicatif pour renforcer le positionnement SEO de cette page..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48]"
        />
      </div>
    </div>
  );
}
