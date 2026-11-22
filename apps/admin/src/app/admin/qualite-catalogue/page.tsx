"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";

type Check = { check: string; label: string; count: number };
type Summary = { totalPublished: number; checks: Check[] };
type Row = {
  id: string; slug: string; name: string; indexable: boolean; inStock: boolean;
  image: string; brand: string | null; category: string | null; descLength: number;
};
type Listing = {
  check: string; label?: string; items: Row[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
};
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: Listing };

const inputClass = "h-11 rounded-xl border border-border bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export default function QualiteCataloguePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [check, setCheck] = useState("duplicate-names");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    apiClient.get<Summary>("/catalogue/admin/quality-report/summary").then(setSummary).catch(() => setSummary(null));
  }, []);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const params = new URLSearchParams({ check, page: String(page), pageSize: "25", q: query });
      const data = await apiClient.get<Listing>(`/catalogue/admin/quality-report?${params}`);
      setState({ status: "ready", data });
    } catch (error) {
      setState({ status: "error", message: error instanceof ApiError ? error.message : "Impossible de charger le rapport." });
    }
  }, [check, page, query]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink">Qualité du catalogue</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Rapport en lecture seule sur les produits publiés{summary ? ` (${summary.totalPublished.toLocaleString("fr-FR")})` : ""}.
          Aucune fusion ni suppression n&apos;est effectuée ici : ouvrez chaque produit pour le corriger.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Contrôles qualité">
        {(summary?.checks ?? []).map((item) => (
          <button
            key={item.check}
            type="button"
            role="tab"
            aria-selected={check === item.check}
            onClick={() => { setCheck(item.check); setPage(1); }}
            className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition ${check === item.check ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border bg-white text-ink hover:border-primary"}`}
          >
            {item.label} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-ink-muted">{item.count.toLocaleString("fr-FR")}</span>
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(q.trim()); }}
        role="search"
      >
        <label className="relative flex-1">
          <span className="sr-only">Rechercher un produit</span>
          <Search className="pointer-events-none absolute start-3 top-3.5 size-4 text-ink-muted" aria-hidden />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Nom ou slug du produit" className={`${inputClass} w-full ps-9`} />
        </label>
        <button type="submit" className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Filtrer</button>
      </form>

      {state.status === "loading" && <p className="text-sm text-ink-muted" role="status">Chargement…</p>}
      {state.status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{state.message}</p>
      )}
      {state.status === "ready" && state.data.items.length === 0 && (
        <p className="rounded-xl border border-border bg-white p-6 text-sm text-ink-muted">Aucun produit pour ce contrôle.</p>
      )}
      {state.status === "ready" && state.data.items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3 text-start">Produit</th>
                  <th className="px-4 py-3 text-start">Marque</th>
                  <th className="px-4 py-3 text-start">Catégorie</th>
                  <th className="px-4 py-3 text-start">Description</th>
                  <th className="px-4 py-3 text-start">Stock</th>
                  <th className="px-4 py-3 text-start">Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.data.items.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/produits?product=${row.id}`} className="font-medium text-primary hover:underline">{row.name}</Link>
                      <div className="text-xs text-ink-muted">{row.slug}</div>
                    </td>
                    <td className="px-4 py-3">{row.brand ?? "—"}</td>
                    <td className="px-4 py-3">{row.category ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{row.descLength} car.</td>
                    <td className="px-4 py-3">{row.inStock ? "En stock" : "Sur commande"}</td>
                    <td className="px-4 py-3">{row.indexable ? "Indexable" : "Noindex"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="flex items-center justify-between text-sm" aria-label="Pagination">
            <span className="text-ink-muted">{state.data.pagination.total.toLocaleString("fr-FR")} produits · page {state.data.pagination.page} / {Math.max(1, state.data.pagination.pageCount)}</span>
            <span className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="flex size-11 items-center justify-center rounded-xl border border-border bg-white disabled:opacity-40" aria-label="Page précédente"><ChevronLeft className="size-4" /></button>
              <button type="button" disabled={page >= state.data.pagination.pageCount} onClick={() => setPage(page + 1)} className="flex size-11 items-center justify-center rounded-xl border border-border bg-white disabled:opacity-40" aria-label="Page suivante"><ChevronRight className="size-4" /></button>
            </span>
          </nav>
        </>
      )}
    </div>
  );
}
