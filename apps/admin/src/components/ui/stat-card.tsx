import type { ElementType, ReactNode } from "react";
import { cn } from "@paratunisie/ui";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-soft-nude text-ink-muted",
  primary: "bg-primary-soft/70 text-primary",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
};

/** KPI tile. Pass `onClick` to make it a toggleable filter (aria-pressed). */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  active,
  onClick,
  loading,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ElementType;
  tone?: Tone;
  active?: boolean;
  onClick?: () => void;
  loading?: boolean;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
        {Icon && (
          <span className={cn("flex size-7 items-center justify-center rounded-lg", TONES[tone])}>
            <Icon size={14} />
          </span>
        )}
      </div>
      {loading ? (
        <div className="pt-skeleton mt-2 h-7 w-20" />
      ) : (
        <p className="mt-1.5 text-2xl font-bold tabular-nums leading-none text-ink">{value}</p>
      )}
      {hint && <p className="mt-1.5 text-[0.6875rem] text-ink-faint">{hint}</p>}
    </>
  );
  const cls = cn("kpi-card text-left", active && "border-primary ring-2 ring-primary/20", onClick && "cursor-pointer");
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={active} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
