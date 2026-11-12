"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@paratunisie/ui";
import { AnimatedNumber, AnimatedText } from "@/components/dashboard/animated";

export type KpiTrend = number | null;

interface KpiCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  /** Percentage change vs the first half of the period, null when it cannot be computed. */
  trend?: KpiTrend;
  hint?: string;
  icon: React.ElementType;
  className?: string;
}

/** Trend badge: green up / red down, never blue. Direction is also carried by the arrow and the sign. */
export function TrendBadge({ trend }: { trend: KpiTrend | undefined }) {
  if (trend === undefined) return null;
  if (trend === null || !Number.isFinite(trend)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-soft-nude px-2 py-0.5 text-[0.6875rem] font-medium text-ink-muted" title="Pas assez de données pour comparer">
        <Minus size={11} aria-hidden /> n/d
      </span>
    );
  }
  const up = trend >= 0;
  const text = `${up ? "+" : "−"}${Math.abs(trend).toFixed(1).replace(".", ",")} %`;
  return (
    <span
      className={cn("num inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold", up ? "bg-success-bg text-success" : "bg-danger-bg text-danger")}
      title="Deuxième moitié de la période comparée à la première"
    >
      {up ? <ArrowUpRight size={12} aria-hidden /> : <ArrowDownRight size={12} aria-hidden />}
      {text}
      <span className="sr-only">{up ? " en hausse" : " en baisse"} par rapport à la première moitié de la période</span>
    </span>
  );
}

export function KpiCard({ label, value, decimals = 0, suffix = "", trend, hint, icon: Icon, className }: KpiCardProps) {
  return (
    <div className={cn("studio-card flex min-w-0 flex-col justify-between p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <AnimatedText as="p" text={label} className="studio-eyebrow" />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-soft-nude text-ink-muted" aria-hidden>
          <Icon size={15} strokeWidth={1.7} />
        </span>
      </div>
      <div className="mt-3 min-w-0">
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} className="num block whitespace-nowrap text-xl font-semibold leading-none text-ink sm:text-2xl xl:text-[1.75rem] 2xl:text-2xl" />
      </div>
      <div className="mt-3 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1">
        <TrendBadge trend={trend} />
        {hint && <span className="text-[0.75rem] text-ink-muted">{hint}</span>}
      </div>
    </div>
  );
}

export function KpiCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("studio-card p-4 sm:p-5", className)} aria-hidden>
      <div className="flex items-start justify-between">
        <div className="pt-skeleton h-3 w-24" />
        <div className="pt-skeleton size-8" />
      </div>
      <div className="pt-skeleton mt-4 h-7 w-32" />
      <div className="pt-skeleton mt-4 h-4 w-20" />
    </div>
  );
}
