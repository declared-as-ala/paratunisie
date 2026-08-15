"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, Sparkles, AlertTriangle, ShieldCheck, Tag, RefreshCw } from "lucide-react";
import { Drawer } from "@paratunisie/ui";

interface ImportPreviewDrawerProps {
  item: any | null;
  onClose: () => void;
  onPublish: (id: string, state: "PUBLISHED" | "DRAFT") => Promise<void>;
  busy?: boolean;
}

export function ImportPreviewDrawer({ item, onClose, onPublish, busy }: ImportPreviewDrawerProps) {
  if (!item) return null;

  const sourceData = item.sourceData ? JSON.parse(item.sourceData) : {};
  const product = item.product;

  const competitorPriceDT = item.sourcePrice ? (item.sourcePrice / 1000).toFixed(3) : null;
  const sellingPriceDT = product?.variants?.[0]?.priceMillimes && product.variants[0].priceMillimes > 0
    ? (product.variants[0].priceMillimes / 1000).toFixed(3)
    : null;

  const diffDT = competitorPriceDT && sellingPriceDT
    ? (parseFloat(sellingPriceDT) - parseFloat(competitorPriceDT)).toFixed(3)
    : null;

  const faqs = product?.seoFaq ? JSON.parse(product.seoFaq || "[]") : [];
  const keywords = product?.seoKeywords ? JSON.parse(product.seoKeywords || "[]") : [];

  return (
    <Drawer
      open={Boolean(item)}
      onClose={onClose}
      title="Prévisualisation SEO & Données Comparatives"
      description={`Produit: ${item.sourceTitle}`}
      footer={
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            {item.similarityFlag && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <AlertTriangle size={13} /> Contenu similaire détecté
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Fermer
            </button>
            {product && product.publishState !== "PUBLISHED" && (
              <button
                type="button"
                disabled={busy || !sellingPriceDT}
                onClick={() => onPublish(item.id, "PUBLISHED")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> Approuver & Publier sur la boutique
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Internal Pricing Comparison (BI Notice) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.625rem] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Tag size={12} className="text-[#E11D48]" /> Prix Concurrentiel vs Prix Vente (Interne Admin)
            </span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#E11D48] hover:underline"
            >
              Lien source <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block text-[0.6875rem]">TunisiePara (Concurrent):</span>
              <p className="font-extrabold text-slate-800 text-sm">{competitorPriceDT ? `${competitorPriceDT} DT` : "N/A"}</p>
              <span className="text-[0.625rem] text-slate-400">Strictement masqué du public</span>
            </div>
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-medium block text-[0.6875rem]">ParaTunisie (Public):</span>
              <p className="font-extrabold text-emerald-800 text-sm">
                {sellingPriceDT ? `${sellingPriceDT} DT` : "Non défini (Publication bloquée)"}
              </p>
              {diffDT && (
                <span className="text-[0.625rem] font-bold text-emerald-600 block">
                  Écart: {parseFloat(diffDT) >= 0 ? `+${diffDT}` : diffDT} DT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SEO Score Card */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">Score de Complétude SEO</span>
              <p className="text-[0.6875rem] text-slate-500">Moteur: {item.seoPromptVersion || "Local Engine v1"}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-[#E11D48]">{item.seoScore} / 100</span>
          </div>
        </div>

        {/* Side-by-Side: VERIFIED FACTS vs GENERATED SEO */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Données Factuelles Verified vs SEO Généré</h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 text-[0.6875rem]">FACT: Nom Source</span>
              <p className="text-slate-800 font-medium">{item.sourceTitle}</p>
            </div>
            <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 space-y-1">
              <span className="font-bold text-[#E11D48] text-[0.6875rem]">SEO: Titre Normalisé</span>
              <p className="text-slate-900 font-bold">{product?.name}</p>
            </div>
          </div>

          {product && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[0.625rem]">Meta Title (45-60 car.)</span>
                <p className="font-semibold text-slate-800">{product.seoTitle}</p>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[0.625rem] block pt-2">Meta Description (140-160 car.)</span>
                <p className="text-slate-600 leading-relaxed">{product.seoDescription}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[0.625rem] block">Contenu Structuré Français</span>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto pr-2 border-l-2 border-[#E11D48] pl-3">
                  {product.description}
                </div>
              </div>

              {faqs.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[0.625rem] block">FAQ Factuelle</span>
                  <div className="space-y-2">
                    {faqs.map((f: any, i: number) => (
                      <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800">Q: {f.question}</p>
                        <p className="text-slate-600 mt-1">R: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
