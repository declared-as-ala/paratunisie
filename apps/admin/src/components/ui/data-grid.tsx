"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, X } from "lucide-react";
import { cn } from "@paratunisie/ui";

export interface GridColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Present => the column is sortable. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  /** Can the user hide this column? (default true, first column is never hideable) */
  hideable?: boolean;
  defaultHidden?: boolean;
  className?: string;
}

export interface GridBulkAction<T> {
  label: string;
  icon?: React.ElementType;
  run: (rows: T[]) => void;
}

interface DataGridProps<T> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  columns: GridColumn<T>[];
  rows: T[];
  rowId: (row: T) => string;
  pageSize?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: React.ReactNode;
  bulkActions?: GridBulkAction<T>[];
  /** Accessible name of the table. */
  caption: string;
}

/**
 * Compact data table used by the dashboard lists: sortable headers (aria-sort), pagination,
 * column visibility, row selection that survives paging, and a bulk action bar.
 */
export function DataGrid<T>({
  title,
  description,
  actions,
  columns,
  rows,
  rowId,
  pageSize = 6,
  loading,
  error,
  onRetry,
  empty,
  bulkActions = [],
  caption,
}: DataGridProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key)));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);
  const selectable = bulkActions.length > 0;

  useEffect(() => {
    if (!colsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) setColsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setColsOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [colsOpen]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "fr", { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const visible = columns.filter((c) => !hidden.has(c.key));
  const pageIds = pageRows.map(rowId);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const selectedRows = rows.filter((r) => selected.has(rowId(r)));

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s);
      if (allOnPage) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="studio-card relative h-full overflow-hidden" aria-label={caption}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            {title}
            {description}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <div className="relative" ref={colsRef}>
              <button
                type="button"
                onClick={() => setColsOpen((o) => !o)}
                className="press inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[0.75rem] font-medium text-ink-muted"
                aria-haspopup="menu"
                aria-expanded={colsOpen}
              >
                <Columns3 size={13} aria-hidden /> Colonnes
              </button>
              {colsOpen && (
                <div role="menu" aria-label="Colonnes visibles" className="absolute right-0 top-full z-20 mt-1.5 w-52 rounded-xl border border-border bg-surface-alt p-1.5 shadow-[0_16px_40px_-16px_rgba(23,23,23,0.28)]">
                  {columns.map((c, i) => {
                    const locked = i === 0 || c.hideable === false;
                    return (
                      <label key={c.key} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem]", locked ? "opacity-50" : "cursor-pointer hover:bg-soft-nude")}>
                        <input
                          type="checkbox"
                          disabled={locked}
                          checked={!hidden.has(c.key)}
                          onChange={() =>
                            setHidden((h) => {
                              const next = new Set(h);
                              if (next.has(c.key)) next.delete(c.key);
                              else next.add(c.key);
                              return next;
                            })
                          }
                          className="size-3.5 accent-[var(--color-ink)]"
                        />
                        {c.header}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div role="alert" className="mx-5 mb-5 flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-4 py-10 text-center">
          <AlertTriangle size={20} className="text-danger" aria-hidden />
          <p className="max-w-sm text-sm text-ink-muted">{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="h-9 rounded-lg bg-primary px-4 text-[0.8125rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.98]">
              Réessayer
            </button>
          )}
        </div>
      ) : loading ? (
        <div role="status" aria-label="Chargement du tableau" className="space-y-2 px-5 pb-5">
          {Array.from({ length: Math.min(pageSize, 5) }, (_, i) => (
            <div key={i} className="pt-skeleton h-11 w-full" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 pb-6">{empty}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-[0.8125rem]">
              <caption className="sr-only">{caption}</caption>
              <thead>
                <tr className="border-y border-border bg-background text-[0.6875rem] font-medium uppercase tracking-wider text-ink-muted">
                  {selectable && (
                    <th scope="col" className="w-10 py-2.5 pl-5">
                      <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Sélectionner toutes les lignes de la page" className="size-3.5 accent-[var(--color-ink)]" />
                    </th>
                  )}
                  {visible.map((c) => {
                    const active = sort?.key === c.key;
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : c.sortValue ? "none" : undefined}
                        className={cn("whitespace-nowrap px-4 py-2.5 first:pl-5 last:pr-5", c.align === "right" && "text-right")}
                      >
                        {c.sortValue ? (
                          <button type="button" onClick={() => toggleSort(c.key)} className={cn("inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-ink", active && "text-ink")}>
                            {c.header}
                            {active ? sort!.dir === "asc" ? <ArrowUp size={11} aria-hidden /> : <ArrowDown size={11} aria-hidden /> : <ArrowUpDown size={11} className="opacity-50" aria-hidden />}
                          </button>
                        ) : (
                          c.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRows.map((row) => {
                  const id = rowId(row);
                  const isSel = selected.has(id);
                  return (
                    <tr key={id} className={cn("transition-colors", isSel ? "bg-primary-soft/40" : "hover:bg-background")} aria-selected={selectable ? isSel : undefined}>
                      {selectable && (
                        <td className="py-3 pl-5">
                          <input type="checkbox" checked={isSel} onChange={() => toggleOne(id)} aria-label={`Sélectionner la ligne ${id}`} className="size-3.5 accent-[var(--color-ink)]" />
                        </td>
                      )}
                      {visible.map((c) => (
                        <td key={c.key} className={cn("px-4 py-3 first:pl-5 last:pr-5", c.align === "right" && "text-right", c.className)}>
                          {c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-[0.75rem] text-ink-muted">
            <span className="tabular-nums">
              {safePage * pageSize + 1}–{Math.min(sorted.length, safePage * pageSize + pageSize)} sur {sorted.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" disabled={safePage <= 0} onClick={() => setPage(safePage - 1)} aria-label="Page précédente" className="press flex size-8 items-center justify-center rounded-lg border border-border disabled:opacity-35">
                <ChevronLeft size={14} aria-hidden />
              </button>
              <span className="min-w-14 text-center tabular-nums">
                {safePage + 1} / {pageCount}
              </span>
              <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label="Page suivante" className="press flex size-8 items-center justify-center rounded-lg border border-border disabled:opacity-35">
                <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bulk action bar — in the flow (never over the pagination), shown while rows are selected */}
      {selectable && selectedRows.length > 0 && (
        <div role="region" aria-label="Actions groupées" className="flex flex-wrap items-center gap-2 bg-ink px-4 py-2.5 text-[0.8125rem] text-white">
          <span className="font-medium tabular-nums">{selectedRows.length} sélectionné{selectedRows.length > 1 ? "s" : ""}</span>
          <span className="mx-1 hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
          {bulkActions.map((a) => (
            <button key={a.label} type="button" onClick={() => a.run(selectedRows)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-[0.75rem] font-medium transition-colors hover:bg-white/20 active:scale-[0.98]">
              {a.icon && <a.icon size={13} aria-hidden />}
              {a.label}
            </button>
          ))}
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto inline-flex size-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15" aria-label="Désélectionner tout">
            <X size={14} aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
