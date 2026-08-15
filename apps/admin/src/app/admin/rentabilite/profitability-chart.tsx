"use client";

import { useState } from "react";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

export interface ProfitabilitySeriesPoint {
  label: string;
  caDT: number;
  coutDT: number;
  gainDT: number;
  /** true when this bucket has zero cost-eligible revenue — coutDT/gainDT are
   * real zeros here in the sense "nothing known," not "nothing owed." Rendered
   * as a hollow point + footnote rather than a misleading flat line. */
  incomplete?: boolean;
}

interface ProfitabilityChartProps {
  data: ProfitabilitySeriesPoint[];
  periodLabel?: string;
}

// Modeled directly on components/dashboard-chart.tsx (same hand-rolled SVG
// smooth-curve + tab-switcher pattern) — CA vs Coût d'achat vs Gain instead of
// CA vs Commandes vs Marge, so this covers both the "main chart" (§10) and
// "gain evolution" (§11) asks without a redundant second chart.
export function ProfitabilityChart({ data, periodLabel = "Période sélectionnée" }: ProfitabilityChartProps) {
  const [metric, setMetric] = useState<"ca" | "cout" | "gain">("gain");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartData = data.length > 0 ? data : [{ label: "—", caDT: 0, coutDT: 0, gainDT: 0 }];

  const getMetricConfig = () => {
    switch (metric) {
      case "ca":
        return {
          title: "Chiffre d'Affaires",
          color: "#7B2F52",
          getValue: (d: ProfitabilitySeriesPoint) => d.caDT,
          format: (val: number) => `${val.toLocaleString("fr-FR")} DT`,
        };
      case "cout":
        return {
          title: "Coût d'Achat",
          color: "#716268",
          getValue: (d: ProfitabilitySeriesPoint) => d.coutDT,
          format: (val: number) => `${val.toLocaleString("fr-FR")} DT`,
        };
      case "gain":
        return {
          title: "Gain Estimé",
          color: "#2F6F52",
          getValue: (d: ProfitabilitySeriesPoint) => d.gainDT,
          format: (val: number) => `${val.toLocaleString("fr-FR")} DT`,
        };
    }
  };

  const config = getMetricConfig();
  const incompleteCount = chartData.filter((d) => d.incomplete).length;
  const values = chartData.map(config.getValue);
  const maxVal = Math.max(...values, 1) * 1.15;
  const minVal = Math.min(0, ...values);

  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = chartData.map((d, i) => {
    const val = config.getValue(d);
    const x = paddingX + (i / Math.max(1, chartData.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * chartHeight;
    return { x, y, val, dataPoint: d };
  });

  const curvePath = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaPath = `${curvePath} L ${paddingX + chartWidth},${svgHeight - paddingY} L ${paddingX},${svgHeight - paddingY} Z`;
  const totalVal = values.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface-alt/80 p-5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">CA vs Coût d&apos;achat vs Gain</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {periodLabel}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Total période : <span className="font-semibold text-ink">{config.format(totalVal)}</span>
          </p>
        </div>

        <div className="inline-flex items-center rounded-xl bg-soft-nude/70 p-1 border border-border/40">
          <button
            onClick={() => setMetric("ca")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              metric === "ca" ? "bg-surface-alt text-primary shadow-xs" : "text-ink-muted hover:text-ink"
            }`}
          >
            <DollarSign size={13} />
            CA
          </button>
          <button
            onClick={() => setMetric("cout")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              metric === "cout" ? "bg-surface-alt text-ink shadow-xs" : "text-ink-muted hover:text-ink"
            }`}
          >
            <TrendingDown size={13} />
            Coût d&apos;achat
          </button>
          <button
            onClick={() => setMetric("gain")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              metric === "gain" ? "bg-surface-alt text-success shadow-xs" : "text-ink-muted hover:text-ink"
            }`}
          >
            <TrendingUp size={13} />
            Gain
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="profitabilityChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.30" />
              <stop offset="95%" stopColor={config.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * chartHeight;
            return (
              <line key={i} x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="var(--color-border)" strokeDasharray="4 4" strokeOpacity="0.6" />
            );
          })}

          <path d={areaPath} fill="url(#profitabilityChartFill)" />
          <path d={curvePath} fill="none" stroke={config.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            const isIncomplete = metric !== "ca" && p.dataPoint.incomplete;
            return (
              <g key={idx} className="cursor-pointer transition-all" onMouseEnter={() => setHoverIndex(idx)} onMouseLeave={() => setHoverIndex(null)}>
                {isHovered && (
                  <line x1={p.x} y1={paddingY} x2={p.x} y2={svgHeight - paddingY} stroke={config.color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isIncomplete ? "var(--color-warning-bg)" : "var(--color-surface-alt)"}
                  stroke={isIncomplete ? "var(--color-warning)" : config.color}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeDasharray={isIncomplete ? "2 2" : undefined}
                  className="transition-all duration-150"
                />
                <text x={p.x} y={svgHeight - 6} textAnchor="middle" className={`text-[10px] font-medium transition-colors ${isHovered ? "fill-ink font-bold" : "fill-ink-faint"}`}>
                  {p.dataPoint.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoverIndex !== null && (
          <div
            className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-ink text-white p-2.5 shadow-xl border border-white/10 text-xs transition-all duration-150"
            style={{ left: `${(points[hoverIndex].x / svgWidth) * 100}%`, top: `${(points[hoverIndex].y / svgHeight) * 100 - 12}%` }}
          >
            <div className="font-semibold text-[0.6875rem] text-white/70 mb-1 border-b border-white/10 pb-0.5">{chartData[hoverIndex].label}</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
              <span className="font-bold text-white">{config.format(config.getValue(chartData[hoverIndex]))}</span>
            </div>
          </div>
        )}
      </div>

      {metric !== "ca" && incompleteCount > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[0.6875rem] text-warning">
          <span className="inline-block size-1.5 rounded-full border border-warning border-dashed" />
          {incompleteCount} point{incompleteCount > 1 ? "s" : ""} avec données de coût incomplètes (contour pointillé) — {config.title.toLowerCase()} non disponible sur cette période.
        </p>
      )}
    </div>
  );
}
