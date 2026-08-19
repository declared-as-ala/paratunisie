"use client";

export function KpiCardSkeleton() {
  return (
    <div className="glass-card p-4 relative overflow-hidden flex flex-col justify-between animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 w-2/3">
          <div className="h-3 w-24 rounded-md bg-border/60" />
          <div className="h-7 w-32 rounded-lg bg-border/80" />
        </div>
        <div className="h-9 w-9 rounded-xl bg-border/60" />
      </div>
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
        <div className="h-3 w-28 rounded-md bg-border/50" />
        <div className="h-5 w-16 rounded-md bg-border/40" />
      </div>
    </div>
  );
}

export function SecondaryKpiSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-alt/60 p-3 animate-pulse">
      <div className="h-2.5 w-16 rounded-md bg-border/60 mb-2" />
      <div className="h-5 w-20 rounded-md bg-border/80" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt/80 p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded-md bg-border/70" />
          <div className="h-3 w-24 rounded-md bg-border/50" />
        </div>
        <div className="h-7 w-48 rounded-xl bg-border/60" />
      </div>
      <div className="h-48 w-full rounded-xl bg-border/30 flex items-end justify-between p-4 gap-2">
        {[40, 65, 30, 85, 50, 90, 75].map((h, i) => (
          <div key={i} className="w-full bg-border/50 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
