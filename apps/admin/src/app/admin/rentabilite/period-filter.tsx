"use client";

export type PeriodPreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "3mo"
  | "this_year"
  | "custom";

export type StatusScope = "CONFIRMEE" | "LIVREE" | "BOTH";

export interface PeriodRange {
  from: Date;
  to: Date;
}

const PRESET_LABELS: Record<PeriodPreset, string> = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  "7d": "7 jours",
  "30d": "30 jours",
  this_month: "Ce mois",
  last_month: "Mois précédent",
  "3mo": "3 mois",
  this_year: "Cette année",
  custom: "Personnalisée",
};

const STATUS_SCOPE_LABELS: Record<StatusScope, string> = {
  CONFIRMEE: "Confirmées",
  LIVREE: "Livrées",
  BOTH: "Confirmées + Livrées",
};

export function resolvePeriodRange(preset: PeriodPreset, customFrom?: string, customTo?: string): PeriodRange {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return { from: startOfToday, to: now };
    case "yesterday": {
      const from = new Date(startOfToday);
      from.setDate(from.getDate() - 1);
      const to = new Date(startOfToday.getTime() - 1);
      return { from, to };
    }
    case "7d":
      return { from: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7), to: now };
    case "30d":
      return { from: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30), to: now };
    case "this_month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { from, to };
    }
    case "3mo":
      return { from: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90), to: now };
    case "this_year":
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case "custom": {
      const from = customFrom ? new Date(customFrom) : startOfToday;
      const to = customTo ? new Date(`${customTo}T23:59:59`) : now;
      return { from, to };
    }
  }
}

export function statusScopeToStatuses(scope: StatusScope): string[] {
  return scope === "BOTH" ? ["CONFIRMEE", "LIVREE"] : [scope];
}

interface PeriodFilterProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  statusScope: StatusScope;
  onStatusScopeChange: (scope: StatusScope) => void;
}

const PRESETS: PeriodPreset[] = ["today", "yesterday", "7d", "30d", "this_month", "last_month", "3mo", "this_year", "custom"];
const STATUS_SCOPES: StatusScope[] = ["CONFIRMEE", "LIVREE", "BOTH"];

export function PeriodFilter({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  statusScope,
  onStatusScopeChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPresetChange(p)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              preset === p ? "bg-primary text-white shadow-xs" : "bg-surface-alt text-ink-muted hover:text-ink border border-border"
            }`}
          >
            {PRESET_LABELS[p]}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="rounded-lg border border-border bg-surface-alt px-2.5 py-1.5 text-xs text-ink"
          />
          <span className="text-xs text-ink-faint">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="rounded-lg border border-border bg-surface-alt px-2.5 py-1.5 text-xs text-ink"
          />
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-faint mr-1">Commandes prises en compte</span>
        {STATUS_SCOPES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusScopeChange(s)}
            className={`rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold transition-all ${
              statusScope === s ? "bg-ink text-white" : "bg-soft-nude text-ink-muted hover:text-ink"
            }`}
          >
            {STATUS_SCOPE_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
