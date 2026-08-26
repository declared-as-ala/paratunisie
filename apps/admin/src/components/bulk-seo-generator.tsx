"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";

type Result = { processed: number; succeeded: number; failures: { id: string; error: string }[]; nextCursor: string | null; done: boolean };

export function BulkSeoGenerator({ type, label }: { type: "product" | "category" | "brand"; label: string }) {
  const [running, setRunning] = useState(false);
  const [force, setForce] = useState(false);
  const [progress, setProgress] = useState<{ processed: number; succeeded: number; failed: number } | null>(null);
  async function run() {
    if (force && !window.confirm("Régénérer aussi les contenus SEO existants non personnalisés ?")) return;
    setRunning(true); setProgress({ processed: 0, succeeded: 0, failed: 0 });
    let cursor: string | undefined;
    try {
      do {
        const result = await apiClient.post<Result>("/catalogue/seo/generate-bulk", { type, mode: force ? "all" : "missing", cursor, limit: 25 });
        setProgress((current) => ({ processed: (current?.processed || 0) + result.processed, succeeded: (current?.succeeded || 0) + result.succeeded, failed: (current?.failed || 0) + result.failures.length }));
        cursor = result.nextCursor || undefined;
        if (result.done) break;
        await new Promise((resolve) => window.setTimeout(resolve, 50));
      } while (cursor);
    } finally { setRunning(false); }
  }
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2"><button type="button" onClick={run} disabled={running} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">{running ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Générer SEO · {label}</button><label className="flex min-h-11 items-center gap-2 px-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={force} disabled={running} onChange={(e) => setForce(e.target.checked)} className="size-4 rounded border-slate-300 text-rose-600" />Régénérer l’existant</label>{progress && <span className="px-2 text-xs tabular-nums text-slate-600" role="status">{running ? "En cours" : "Terminé"} · {progress.succeeded}/{progress.processed} réussis{progress.failed ? ` · ${progress.failed} échec(s)` : ""}</span>}</div>;
}
