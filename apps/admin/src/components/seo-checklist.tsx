"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, LoaderCircle, RefreshCw, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";

type EntityType = "product" | "category";
type Check = { id: string; label: string; passed: boolean; points: number; reason: string };
/** Category result (full checklist, 51 rows) */
type CategoryResult = { id: string; name: string; score: number; grade: string; verifiedAt: string | null; verificationError?: string; checks: Check[] };
type CategoryReport = { items: CategoryResult[]; total: number; perfect: number; below100: number };
/** Product result (computed per page of ~25 rows) */
type ProductResult = {
  id: string; slug: string; name: string; score: number; grade: string; source: "derived" | "verified"; indexable: boolean; inSitemap: boolean;
  eligible: boolean; blockers: string[]; failed: { id: string; label: string; reason: string }[];
};
type Result = { id: string; name: string; score: number; grade: string; source?: "derived" | "verified"; indexable?: boolean; eligible?: boolean; blockers?: string[]; verifiedAt?: string | null; verificationError?: string; passed?: Check[]; failed: { id: string; label: string; reason: string }[] };
type Status = "loading" | "ready" | "error";

type Ctx = { type: EntityType; status: Status; error: string; retry: () => void; get: (id?: string) => Result | undefined; refresh: () => Promise<void>; total: number };
const Context = createContext<Ctx | null>(null);

const REQUEST_TIMEOUT_MS = 25_000;
const withTimeout = <T,>(promise: Promise<T>, ms = REQUEST_TIMEOUT_MS) =>
  Promise.race([promise, new Promise<T>((_resolve, reject) => window.setTimeout(() => reject(new Error("Délai dépassé")), ms))]);

/**
 * Product scores are requested for the rows on screen only (ids of the current page), never for the whole catalogue.
 * Every request has a timeout, a stale-response guard and an explicit error state with a retry action: the UI can never
 * stay on an infinite spinner.
 */
export function SeoChecklistProvider({ type, ids, children }: { type: EntityType; ids?: string[]; children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Map<string, ProductResult>>(new Map());
  const [categories, setCategories] = useState<CategoryReport | null>(null);
  const requestId = useRef(0);
  const idsKey = useMemo(() => (ids ?? []).join(","), [ids]);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    if (type === "product" && !idsKey) { setStatus("ready"); setError(""); return; }
    setStatus("loading"); setError("");
    try {
      if (type === "product") {
        const data = await withTimeout(apiClient.get<{ items: ProductResult[] }>(`/catalogue/seo/scores/product?ids=${encodeURIComponent(idsKey)}`));
        if (current !== requestId.current) return; // a newer page was requested meanwhile: ignore this stale answer
        setProducts(new Map(data.items.map((item) => [item.id, item])));
      } else {
        const data = await withTimeout(apiClient.get<CategoryReport>(`/catalogue/seo/checklist/category`), 40_000);
        if (current !== requestId.current) return;
        setCategories(data);
      }
      setStatus("ready");
    } catch (e) {
      if (current !== requestId.current) return;
      setError(e instanceof Error && e.message === "Délai dépassé" ? "Le calcul des scores a dépassé le délai. Réessayez." : "Impossible de charger les scores SEO.");
      setStatus("error");
    }
  }, [type, idsKey]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const saved = () => { void load(); }; window.addEventListener("catalogue-saved", saved); return () => window.removeEventListener("catalogue-saved", saved); }, [load]);

  const get = useCallback((id?: string): Result | undefined => {
    if (!id) return undefined;
    if (type === "product") { const p = products.get(id); return p ? { ...p } : undefined; }
    const c = categories?.items.find((item) => item.id === id);
    return c ? { ...c, failed: c.checks.filter((x) => !x.passed), passed: c.checks.filter((x) => x.passed) } : undefined;
  }, [type, products, categories]);

  const value = useMemo<Ctx>(() => ({ type, status, error, retry: () => { void load(); }, get, refresh: load, total: type === "product" ? products.size : categories?.total ?? 0 }), [type, status, error, load, get, products.size, categories?.total]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function SeoScore({ id, editing = false }: { id?: string; editing?: boolean }) {
  const headingId = useId();
  const context = useContext(Context);
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const result = context?.get(id);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  if (!id || !context) return null;
  async function optimize() {
    setBusy(true); setError("");
    try { await withTimeout(apiClient.post(`/catalogue/seo/checklist/${context!.type}/${id}`, { repair: !editing }), 60_000); await context!.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Optimisation interrompue. Réessayez."); }
    finally { setBusy(false); }
  }
  const color = !result ? "bg-slate-100 text-slate-600" : result.score >= 90 ? "bg-emerald-50 text-emerald-800" : result.score >= 70 ? "bg-amber-50 text-amber-900" : "bg-red-50 text-red-800";

  if (!result && context.status === "error") {
    return <button type="button" onClick={context.retry} className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-50 px-3 text-xs font-bold text-red-800 focus-visible:outline-2 focus-visible:outline-primary" title={context.error}><RefreshCw size={14} aria-hidden /> Réessayer</button>;
  }
  if (!result && context.status === "loading") {
    return <span role="status" aria-label="Calcul du score SEO" className="inline-flex min-h-11 w-24 animate-pulse items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400">SEO…</span>;
  }
  if (!result) return <span className="inline-flex min-h-11 items-center rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-500">—</span>;

  return <>
    <button type="button" onClick={() => setOpen(true)} className={`min-h-11 whitespace-nowrap rounded-lg px-3 text-xs font-bold focus-visible:outline-2 focus-visible:outline-primary ${color}`} aria-label={`Détail SEO de ${result.name} : ${result.score} sur 100`}>
      {result.score}/100 · {result.grade}
    </button>
    <dialog ref={dialog} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} className="fixed inset-0 m-auto max-h-[85dvh] w-[min(95vw,620px)] overflow-y-auto rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-slate-900/50" aria-labelledby={headingId}>
      <div className="flex items-start justify-between gap-3"><h2 id={headingId} className="text-lg font-bold">SEO · {result.name}</h2><button type="button" onClick={() => setOpen(false)} aria-label="Fermer le détail SEO" className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-slate-100"><X size={20} /></button></div>
      <p className="text-2xl font-black">{result.score}/100 <span className="text-sm font-medium">{result.grade}</span></p>
      <p className="my-3 text-xs text-slate-600">Score interne ParaTunisie, aucun classement Google garanti. {result.source === "verified" ? "Contrôle de la page publique à jour." : result.source === "derived" ? "Calculé à partir des données enregistrées ; utilisez « Vérifier la page publique » pour un contrôle en ligne." : ""}</p>
      {context.type === "product" && (
        <p className="mb-3 text-xs"><span className={`rounded-full px-2 py-0.5 font-bold ${result.indexable ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{result.indexable ? "Indexable" : "Noindex"}</span>{" "}
          <span className={`rounded-full px-2 py-0.5 font-bold ${result.eligible ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{result.eligible ? "Éligible à l'indexation" : "Non éligible"}</span>
          {result.blockers && result.blockers.length > 0 && <span className="ms-2 text-slate-600">Bloquants : {result.blockers.join(", ")}</span>}</p>
      )}
      {result.failed.length === 0 ? <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={16} aria-hidden /> Tous les contrôles sont validés.</p> : (
        <ul className="space-y-2" aria-label="Points manquants">
          {result.failed.map((check) => <li key={check.id} className="flex gap-2 text-sm"><AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" aria-hidden /><span><strong>{check.label}</strong> : {check.reason}</span></li>)}
        </ul>
      )}
      {(error || result.verificationError) && <p role="alert" className="my-3 text-sm text-red-700">{error || result.verificationError}</p>}
      <button type="button" onClick={optimize} disabled={busy} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-hover px-4 text-sm font-bold text-white disabled:opacity-60">{busy && <LoaderCircle size={18} className="animate-spin" />}{editing ? "Vérifier le SEO enregistré" : "Optimiser et vérifier la page publique"}</button>
      <p className="mt-2 text-xs text-slate-600">Complète uniquement les champs vides, génériques ou hors limites. Le texte existant, les prix, le stock et l&apos;indexation ne sont jamais modifiés.</p>
    </dialog>
  </>;
}

/* ───────────────────────── Background jobs (products) ───────────────────────── */

type JobView = { id: string; kind: string; mode: string; status: string; scope: string | null; total: number; processed: number; succeeded: number; failed: number; skipped: number; percent: number; backupTable: string | null; cancelRequested: boolean; createdAt: string; finishedAt: string | null };
type JobDetail = JobView & { errors: { id: string; error: string }[]; results: { slug: string; action: string; reason: string; fields?: string[]; issues?: string[] }[] };
type Summary = { total: number; excellent: number; good: number; weak: number; indexable: number; noindex: number; average: number };
const SCOPES: { value: string; label: string }[] = [
  { value: "purchasable", label: "Produits achetables vérifiés (en stock)" },
  { value: "indexable", label: "Produits indexables" },
  { value: "missing", label: "Champs SEO manquants" },
];
const ACTIVE = new Set(["QUEUED", "RUNNING"]);
const STATUS_LABEL: Record<string, string> = { QUEUED: "En attente", RUNNING: "En cours", DONE: "Terminée", FAILED: "Échec", CANCELLED: "Annulée", ROLLED_BACK: "Annulée (restaurée)" };

function ProductJobPanel() {
  const context = useContext(Context);
  const [scope, setScope] = useState("purchasable");
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => { try { setSummary(await withTimeout(apiClient.get<Summary>("/catalogue/seo/scores/summary"), 15_000)); } catch { /* optional figures */ } }, []);
  const loadJobs = useCallback(async () => {
    try {
      const list = await withTimeout(apiClient.get<JobView[]>("/catalogue/seo/jobs"), 15_000);
      setJobs(list);
      setActiveId((current) => current ?? list.find((j) => ACTIVE.has(j.status))?.id ?? list[0]?.id ?? null);
    } catch { setError("Historique des tâches indisponible."); }
  }, []);
  useEffect(() => { void loadSummary(); void loadJobs(); }, [loadSummary, loadJobs]);

  useEffect(() => {
    if (!activeId) { setDetail(null); return; }
    let stop = false;
    async function poll() {
      try {
        const d = await withTimeout(apiClient.get<JobDetail>(`/catalogue/seo/jobs/${activeId}`), 15_000);
        if (stop) return;
        setDetail(d);
        if (ACTIVE.has(d.status)) timer = window.setTimeout(poll, 2000);
        else { void loadJobs(); void loadSummary(); void context?.refresh(); }
      } catch { if (!stop) timer = window.setTimeout(poll, 5000); }
    }
    let timer = 0;
    void poll();
    return () => { stop = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const lastDry = jobs.find((j) => j.kind === "product-optimize" && j.mode === "dry-run" && j.status === "DONE" && j.scope === scope);
  const running = detail && ACTIVE.has(detail.status);

  async function start(body: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true); setError("");
    try { const created = await withTimeout(apiClient.post<JobView>("/catalogue/seo/jobs", body), 60_000); setActiveId(created.id); await loadJobs(); }
    catch (e) { setError(e instanceof Error ? e.message : "Impossible de lancer la tâche."); }
    finally { setBusy(false); }
  }
  async function act(path: string, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true); setError("");
    try { const out = await withTimeout(apiClient.post<JobView>(path), 60_000); if (out?.id && path.endsWith("/retry")) setActiveId(out.id); await loadJobs(); if (detail) setActiveId(detail.id); void loadSummary(); void context?.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Action impossible."); }
    finally { setBusy(false); }
  }
  async function exportCsv() {
    if (!detail) return;
    try {
      const { csv } = await withTimeout(apiClient.get<{ csv: string }>(`/catalogue/seo/jobs/${detail.id}/export`), 30_000);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a"); a.href = url; a.download = `seo-job-${detail.id}.csv`; a.click(); URL.revokeObjectURL(url);
    } catch { setError("Export impossible."); }
  }

  const btn = "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-bold disabled:opacity-50";
  return (
    <section className="my-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4" aria-label="Optimisation SEO des produits">
      {summary ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-6">
          <div><dt className="text-slate-500">Score moyen</dt><dd className="font-black tabular-nums">{summary.average}/100</dd></div>
          <div><dt className="text-slate-500">≥ 90 (complet)</dt><dd className="font-black tabular-nums text-emerald-700">{summary.excellent}</dd></div>
          <div><dt className="text-slate-500">70 – 89</dt><dd className="font-black tabular-nums text-amber-700">{summary.good}</dd></div>
          <div><dt className="text-slate-500">&lt; 70</dt><dd className="font-black tabular-nums text-red-700">{summary.weak}</dd></div>
          <div><dt className="text-slate-500">Indexables</dt><dd className="font-black tabular-nums">{summary.indexable}</dd></div>
          <div><dt className="text-slate-500">Noindex</dt><dd className="font-black tabular-nums">{summary.noindex}</dd></div>
        </dl>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="seo-scope">Périmètre</label>
        <select id="seo-scope" value={scope} onChange={(e) => setScope(e.target.value)} disabled={Boolean(running)} className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold">
          {SCOPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button type="button" disabled={busy || Boolean(running)} onClick={() => start({ kind: "product-optimize", mode: "dry-run", scope })} className={`${btn} border border-slate-300 bg-white text-slate-800`}>Analyser (simulation)</button>
        <button type="button" disabled={busy || Boolean(running) || !lastDry} title={lastDry ? "" : "Lancez d'abord une simulation sur ce périmètre"} onClick={() => start({ kind: "product-optimize", mode: "apply", scope, confirmJobId: lastDry!.id, limit: 500 }, "Appliquer l'optimisation (500 fiches maximum, sauvegarde automatique) ? Seuls les champs SEO vides, génériques ou hors limites sont complétés.")} className={`${btn} bg-slate-900 text-white`}>Appliquer (max 500)</button>
        <button type="button" disabled={busy || Boolean(running)} onClick={() => start({ kind: "score-refresh" })} className={`${btn} border border-slate-300 bg-white text-slate-800`}>Recalculer tous les scores</button>
        {running ? <button type="button" onClick={() => act(`/catalogue/seo/jobs/${detail!.id}/cancel`)} disabled={busy} className={`${btn} bg-red-50 text-red-800`}>Annuler</button> : null}
      </div>
      {error ? <p role="alert" className="text-xs font-semibold text-red-700">{error}</p> : null}

      {detail ? (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs" role="status" aria-live="polite">
          <p className="font-bold text-slate-900">{detail.kind === "score-refresh" ? "Recalcul des scores" : detail.mode === "apply" ? "Optimisation appliquée" : "Simulation d'optimisation"} · {STATUS_LABEL[detail.status] ?? detail.status}</p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={detail.percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-primary transition-all" style={{ width: `${detail.percent}%` }} /></div>
          <p className="tabular-nums text-slate-700">{detail.processed}/{detail.total} ({detail.percent} %) · réussies {detail.succeeded} · ignorées {detail.skipped} · échecs {detail.failed}</p>
          {detail.backupTable ? <p className="text-slate-600">Sauvegarde : <code className="rounded bg-white px-1">{detail.backupTable}</code></p> : null}
          <div className="flex flex-wrap gap-2">
            {detail.failed > 0 && !running ? <button type="button" disabled={busy} onClick={() => act(`/catalogue/seo/jobs/${detail.id}/retry`)} className={`${btn} border border-slate-300 bg-white`}>Rejouer les échecs</button> : null}
            {detail.kind === "product-optimize" ? <button type="button" onClick={exportCsv} className={`${btn} border border-slate-300 bg-white`}>Exporter (CSV)</button> : null}
            {detail.mode === "apply" && detail.status === "DONE" && detail.backupTable ? <button type="button" disabled={busy} onClick={() => act(`/catalogue/seo/jobs/${detail.id}/rollback`, "Restaurer les champs SEO de cette tâche depuis la sauvegarde ?")} className={`${btn} bg-amber-50 text-amber-900`}>Annuler les changements</button> : null}
          </div>
          {detail.errors?.length ? <ul className="max-h-24 overflow-auto text-red-700">{detail.errors.slice(0, 8).map((e, i) => <li key={i}>✗ {e.id} : {e.error}</li>)}</ul> : null}
          {detail.kind === "product-optimize" && detail.results?.length ? (
            <ul className="max-h-48 divide-y divide-slate-200 overflow-auto rounded border border-slate-200 bg-white">
              {detail.results.filter((r) => r.action !== "skip").slice(0, 40).map((r, i) => (
                <li key={i} className="flex flex-wrap gap-x-3 px-3 py-1.5"><span className="font-bold">{r.slug}</span><span className="text-slate-600">{r.action === "blocked" ? "Bloqué" : r.action === "applied" ? "Appliqué" : "À optimiser"}</span><span className="text-slate-600">{r.fields?.join(", ") || r.reason}</span>{r.issues?.map((x, k) => <span key={k} className="text-red-700">{x}</span>)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/* Categories (51 rows): the full report is small, so the old sequential optimiser stays, now with cancel and progress. */
function CategoryBulkOptimizer() {
  const context = useContext(Context);
  const [busy, setBusy] = useState(false), [progress, setProgress] = useState("");
  const stop = useRef(false);
  useEffect(() => () => { stop.current = true; }, []);
  if (!context) return null;
  async function run() {
    stop.current = false; setBusy(true);
    let done = 0, failed = 0;
    const report = await apiClient.get<CategoryReport>("/catalogue/seo/checklist/category");
    for (const item of report.items) {
      if (stop.current) break;
      try { await withTimeout(apiClient.post(`/catalogue/seo/checklist/category/${item.id}`, {}), 60_000); } catch { failed++; }
      done++; setProgress(`${done}/${report.total} catégories traitées · ${failed} échec(s)`);
    }
    await context!.refresh(); setBusy(false);
  }
  return <section className="my-4 rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center gap-3">
    <button type="button" onClick={run} disabled={busy || context.status !== "ready"} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white disabled:opacity-50">{busy && <LoaderCircle size={18} className="animate-spin" />}Optimiser toutes les catégories</button>
    {busy ? <button type="button" onClick={() => { stop.current = true; }} className="min-h-11 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-800">Arrêter</button> : null}
    <span role="status" className="text-sm text-slate-600">{progress || (context.status === "loading" ? "Chargement des scores…" : context.status === "error" ? context.error : "Complète uniquement les champs vides ; le texte existant et l'indexation sont conservés.")}</span>
    {context.status === "error" ? <button type="button" onClick={context.retry} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-800"><RefreshCw size={14} aria-hidden /> Réessayer</button> : null}
  </div></section>;
}

export function SeoBulkOptimizer() {
  const context = useContext(Context);
  if (!context) return null;
  return context.type === "product" ? <ProductJobPanel /> : <CategoryBulkOptimizer />;
}
