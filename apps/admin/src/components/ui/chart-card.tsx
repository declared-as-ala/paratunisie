import type { ReactNode } from "react";

export function ChartCard({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="admin-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && <p className="text-[0.6875rem] text-ink-faint">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
