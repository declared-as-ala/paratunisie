"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useId } from "react";
import { CheckCircle2, AlertCircle, LoaderCircle, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";

type EntityType = "product" | "category";
type Result = { id: string; name: string; score: number; grade: string; verifiedAt: string | null; verificationError?: string; checks: { id: string; label: string; passed: boolean; points: number; reason: string }[] };
type Report = { items: Result[]; total: number; perfect: number; below100: number };
const Context = createContext<{ report: Report | null; refresh: () => Promise<void>; error: string; type: EntityType } | null>(null);

export function SeoChecklistProvider({ type, children }: { type: EntityType; children: React.ReactNode }) {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try { setReport(await apiClient.get<Report>(`/catalogue/seo/checklist/${type}`)); setError(""); }
    catch { setError("Impossible de charger les scores SEO."); }
  }, [type]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { const saved = () => { void refresh(); }; window.addEventListener("catalogue-saved", saved); return () => window.removeEventListener("catalogue-saved", saved); }, [refresh]);
  return <Context.Provider value={{ type, report, refresh, error }}>{children}</Context.Provider>;
}

export function SeoScore({ id, editing = false }: { id?: string; editing?: boolean }) {
  const headingId = useId();
  const context = useContext(Context);
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const result = context?.report?.items.find(item => item.id === id);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  if (!id || !context) return null;
  async function optimize() {
    setBusy(true); setError("");
    try { await apiClient.post(`/catalogue/seo/checklist/${context!.type}/${id}`, { repair: !editing }); await context!.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Optimisation interrompue. Réessayez."); }
    finally { setBusy(false); }
  }
  const color = !result ? "bg-slate-100 text-slate-600" : result.score >= 90 ? "bg-emerald-50 text-emerald-800" : result.score >= 70 ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-800";
  return <>
    <button type="button" onClick={() => setOpen(true)} className={`min-h-11 whitespace-nowrap rounded-lg px-3 text-xs font-bold focus-visible:outline-2 focus-visible:outline-rose-600 ${color}`} aria-label={`Détail SEO${result ? ` de ${result.name} : ${result.score} sur 100` : ""}`}>
      {result ? `${result.score}/100 · ${result.grade}` : context.error ? "SEO indisponible" : "SEO…"}
    </button>
    <dialog ref={dialog} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(95vw,620px)] overflow-y-auto rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-900/50" aria-labelledby={headingId}>
      <div className="flex items-start justify-between gap-3"><h2 id={headingId} className="text-lg font-bold">SEO · {result?.name || "Fiche"}</h2><button type="button" onClick={() => setOpen(false)} aria-label="Fermer le détail SEO" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100"><X size={20} /></button></div>
      {result ? <><p className="text-2xl font-black">{result.score}/100 <span className="text-sm font-medium">{result.grade}</span></p><p className="my-3 text-xs text-slate-600">Checklist interne ParaTunisie. Aucun classement Google garanti. Les contrôles publics doivent être actualisés après une modification et expirent après 24 h.</p><p className="mb-4 text-xs text-slate-500">{result.verifiedAt ? `Page vérifiée le ${new Date(result.verifiedAt).toLocaleString("fr-TN")}` : "Page publique à vérifier : les contrôles non vérifiés ne rapportent aucun point."}</p><ul className="divide-y divide-slate-100">{result.checks.map(check => <li key={check.id} className="flex items-start gap-3 py-3">{check.passed ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden /> : <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-700" aria-hidden />}<div className="flex-1"><p className="text-sm font-semibold">{check.label}</p><p className="text-xs text-slate-600">{check.reason}</p></div><span className="text-xs font-bold">{check.passed ? `+${check.points}` : `−${check.points}`}</span></li>)}</ul></> : <p role="status">{context.error || "Chargement…"}</p>}
      {(error || result?.verificationError) && <p role="alert" className="my-3 text-sm text-red-700">{error || result?.verificationError}</p>}
      <button type="button" onClick={optimize} disabled={busy} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-rose-700 px-4 text-sm font-bold text-white disabled:opacity-60">{busy && <LoaderCircle size={18} className="animate-spin" />}{editing ? "Vérifier le SEO enregistré" : "Optimiser le SEO"}</button><p className="mt-2 text-xs text-slate-600">Complète les champs manquants et vérifie la page publiée. Les faits inconnus et contenus existants restent à réviser manuellement.</p>
    </dialog>
  </>;
}

export function SeoBulkOptimizer() {
  const context = useContext(Context);
  const [busy, setBusy] = useState(false), [progress, setProgress] = useState("");
  const stop = useRef(false);
  useEffect(() => () => { stop.current = true; }, []);
  if (!context) return null;
  async function run() {
    if (!context?.report) return;
    stop.current = false; setBusy(true);
    let done = 0, failed = 0;
    for (const item of context.report.items) {
      if (stop.current) break;
      try { await apiClient.post(`/catalogue/seo/checklist/${context.type}/${item.id}`, {}); } catch { failed++; }
      done++; setProgress(`${done}/${context.report.total} fiches traitées · ${failed} échec(s)`);
    }
    await context.refresh(); setBusy(false);
  }
  return <section className="my-4 rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={run} disabled={busy || !context.report} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white disabled:opacity-50">{busy && <LoaderCircle size={18} className="animate-spin" />}{context.type === "product" ? "Optimiser tous les produits" : "Optimiser toutes les catégories"}</button>{busy && <button type="button" onClick={() => { stop.current = true; }} className="min-h-11 rounded-lg border px-3 text-sm">Arrêter après cette fiche</button>}<span className="text-sm text-slate-600">{context.report ? `${context.report.perfect}/${context.report.total} à 100 · ${context.report.below100} à améliorer` : context.error || "Chargement des scores…"}</span></div><p role="status" className="mt-2 text-xs text-slate-600">{progress || "Complète uniquement les champs manquants. Vérifie les pages publiques sans inventer de données ni modifier les stocks."}</p></section>;
}
