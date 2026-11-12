import { X } from "lucide-react";

export type Chip = { key: string; label: string; onRemove: () => void };

/** Shows the active filters as removable chips with a one-click reset. */
export function FilterChips({ chips, onReset, resultCount }: { chips: Chip[]; onReset: () => void; resultCount?: number }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
      {chips.map((c) => (
        <span key={c.key} className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary-soft/50 py-0.5 pl-2.5 pr-1 text-[0.6875rem] font-semibold text-primary">
          {c.label}
          <button type="button" onClick={c.onRemove} className="rounded-full p-0.5 transition-colors hover:bg-primary/15" aria-label={`Retirer le filtre ${c.label}`}>
            <X size={11} />
          </button>
        </span>
      ))}
      <button type="button" onClick={onReset} className="text-[0.6875rem] font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline">
        Réinitialiser
      </button>
      {resultCount !== undefined && <span className="text-[0.6875rem] text-ink-faint">· {resultCount} résultat{resultCount > 1 ? "s" : ""}</span>}
    </div>
  );
}
