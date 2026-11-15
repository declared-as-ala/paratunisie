"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, ShieldAlert, Sparkles } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";

export type BrandAuditRow = {
  id: string;
  slug: string;
  name: string;
  tier: "A" | "B" | "C";
  tierReasons: string[];
  score: number;
  total: number;
  failed: { id: string; label: string; reason: string }[];
  indexable: boolean;
  seoIsCustom: boolean;
  products: { published: number; indexable: number; inStock: number };
};
export type BrandAudit = {
  total: number;
  tiers: { A: number; B: number; C: number };
  averageScore: number;
  indexableNow: number;
  indexableButIneligible: number;
  note: string;
  rows: BrandAuditRow[];
};

type Plan = {
  slug: string; name: string; tier: "A" | "B" | "C"; action: string; reason: string; indexable: boolean; duplicateOf: string | null;
  issues: { code: string; severity: string; message: string }[]; scoreAfter: number;
};
type RunResult = {
  mode: string; selected: number; byAction: Record<string, number>; byTier: Record<string, number>; willBeIndexable: number; written: number;
  failures: { slug: string; error: string }[]; backupTable: string | null; rollback: string | null; scoreAfter: { average: number; full: number }; plans: Plan[];
};

const ACTION_LABEL: Record<string, string> = {
  generate: "À générer", preserve: "Conservé", noindex: "Passe en noindex", blocked: "Bloqué (validation)", unchanged: "Inchangé (noindex)",
};

/** Loads the evidence-based audit (score, tier, reasons) for every brand. Returns a lookup by slug. */
export function useBrandAudit() {
  const [audit, setAudit] = useState<BrandAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setAudit(await apiClient.get<BrandAudit>("/catalogue/seo/brands/audit"));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Audit SEO indisponible.");
    }
  }, []);
  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);
  return { audit, error, reload: load };
}

/** Score badge: x/10 evidence-based checks + tier. The tooltip lists exactly what is missing. */
export function BrandSeoBadge({ row }: { row: BrandAuditRow | undefined }) {
  if (!row) return <span className="text-[0.6rem] text-slate-400">…</span>;
  const ratio = row.score / row.total;
  const color = ratio >= 0.8 ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : ratio >= 0.5 ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-primary/10 text-primary-hover border-primary/20";
  const tierColor = row.tier === "A" ? "text-emerald-700" : row.tier === "B" ? "text-amber-700" : "text-slate-500";
  const tip = [
    `Qualité interne : ${row.score}/${row.total} (indicateur éditorial, aucune garantie de classement Google).`,
    `Tier ${row.tier} : ${row.tierReasons.join(" ")}`,
    ...row.failed.map((f) => `✗ ${f.label} : ${f.reason}`),
  ].join("\n");
  return (
    <span className="inline-flex flex-col items-center gap-0.5" title={tip}>
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold tabular-nums ${color}`}>SEO {row.score}/{row.total}</span>
      <span className={`text-[0.55rem] font-extrabold uppercase tracking-wide ${tierColor}`}>Tier {row.tier}{row.indexable ? " · indexable" : " · noindex"}</span>
    </span>
  );
}

export function BrandSeoPanel({ audit, onApplied }: { audit: BrandAudit | null; onApplied: () => void }) {
  const [regenerate, setRegenerate] = useState(false);
  const [running, setRunning] = useState<"dry" | "apply" | null>(null);
  const [preview, setPreview] = useState<RunResult | null>(null);
  const [applied, setApplied] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("generate");

  async function run(mode: "dry-run" | "apply") {
    if (mode === "apply" && !window.confirm("Appliquer ce plan ? Une copie de la table Brand est créée avant l'écriture. Les contenus personnalisés ne sont jamais écrasés.")) return;
    setRunning(mode === "apply" ? "apply" : "dry"); setError(null);
    try {
      const result = await apiClient.post<RunResult>("/catalogue/seo/brands/run", { mode, regenerate, overwriteCustom: false });
      if (mode === "apply") { setApplied(result); setPreview(null); onApplied(); } else { setPreview(result); setApplied(null); }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Échec de l'opération.");
    } finally { setRunning(null); }
  }

  const result = applied ?? preview;
  const shown = result ? result.plans.filter((p) => filter === "all" || p.action === filter).slice(0, 80) : [];

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs" aria-label="Générateur SEO des marques">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Sparkles className="size-4 text-primary" aria-hidden /> SEO des marques</h2>
          <p className="mt-0.5 max-w-3xl text-xs text-slate-600">
            Génération à partir des seules données du catalogue (catégories, produits, stock). Aucune histoire, origine ou certification n&apos;est inventée.
            Seules les marques de tier A/B peuvent être indexées ; les marques minces, génériques, d&apos;équipements ou à examen légal restent en noindex.
          </p>
        </div>
        {audit ? (
          <dl className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs sm:grid-cols-4">
            <div><dt className="text-slate-500">Tier A</dt><dd className="font-black tabular-nums text-emerald-700">{audit.tiers.A}</dd></div>
            <div><dt className="text-slate-500">Tier B</dt><dd className="font-black tabular-nums text-amber-700">{audit.tiers.B}</dd></div>
            <div><dt className="text-slate-500">Tier C (noindex)</dt><dd className="font-black tabular-nums text-slate-700">{audit.tiers.C}</dd></div>
            <div><dt className="text-slate-500">Score moyen</dt><dd className="font-black tabular-nums text-slate-900">{audit.averageScore}/10</dd></div>
            <div className="col-span-2 sm:col-span-4">
              {audit.indexableButIneligible > 0 ? (
                <p className="flex items-center gap-1 font-semibold text-amber-700"><ShieldAlert className="size-3.5" aria-hidden />{audit.indexableButIneligible} marque(s) indexable(s) mais non éligibles (tier C)</p>
              ) : <p className="flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 className="size-3.5" aria-hidden />Aucune marque non éligible n&apos;est indexable</p>}
            </div>
          </dl>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={running !== null} onClick={() => run("dry-run")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60">
          {running === "dry" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Analyser (simulation)
        </button>
        <button type="button" disabled={running !== null || !preview} onClick={() => run("apply")} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50" title={preview ? "" : "Lancez d'abord une simulation"}>
          {running === "apply" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Appliquer le plan
        </button>
        <label className="flex min-h-11 items-center gap-2 px-2 text-xs font-semibold text-slate-600">
          <input type="checkbox" checked={regenerate} disabled={running !== null} onChange={(e) => { setRegenerate(e.target.checked); setPreview(null); }} className="size-4 rounded border-slate-300 text-primary" />
          Régénérer aussi les contenus originaux existants
        </label>
      </div>
      {error ? <p role="alert" className="text-xs font-semibold text-red-700">{error}</p> : null}

      {result ? (
        <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs" role="status">
          <p className="font-bold text-slate-900">
            {applied ? "Plan appliqué" : "Simulation (rien n'est écrit)"} · {result.selected} marques · {result.willBeIndexable} indexables après exécution · score moyen après : {result.scoreAfter.average}/10 · {result.scoreAfter.full} à 9/10 ou plus
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.byAction).map(([action, n]) => (
              <button key={action} type="button" onClick={() => setFilter(action)} className={`rounded-full border px-2.5 py-1 font-bold ${filter === action ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}>
                {ACTION_LABEL[action] ?? action} ({n})
              </button>
            ))}
            <button type="button" onClick={() => setFilter("all")} className={`rounded-full border px-2.5 py-1 font-bold ${filter === "all" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}>Tout</button>
          </div>
          {applied ? (
            <div className="space-y-1">
              <p className="font-semibold text-emerald-700">{applied.written} marque(s) modifiée(s){applied.failures.length ? ` · ${applied.failures.length} échec(s)` : ""}.</p>
              {applied.backupTable ? <p className="text-slate-600">Sauvegarde : <code className="rounded bg-white px-1">{applied.backupTable}</code> (restauration : exécuter le SQL de retour fourni par l&apos;API).</p> : null}
              {applied.failures.map((f) => <p key={f.slug} className="text-red-700">✗ {f.slug} : {f.error}</p>)}
            </div>
          ) : null}
          <ul className="max-h-72 divide-y divide-slate-200 overflow-auto rounded-lg border border-slate-200 bg-white">
            {shown.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-3 py-2">
                <span className="font-bold text-slate-900">{p.name}</span>
                <span className="rounded bg-slate-100 px-1.5 font-bold text-slate-600">Tier {p.tier}</span>
                <span className="text-slate-600">{p.reason}</span>
                {p.issues.map((i, k) => <span key={k} className={i.severity === "BLOCKER" ? "text-red-700" : "text-amber-700"}>{i.message}</span>)}
              </li>
            ))}
            {shown.length === 0 ? <li className="px-3 py-2 text-slate-500">Aucune marque dans cette catégorie.</li> : null}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
