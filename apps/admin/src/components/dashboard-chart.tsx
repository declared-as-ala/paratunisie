"use client";

import { useState } from "react";
import { TrendingUp, ShoppingBag, DollarSign } from "lucide-react";

export interface DashboardChartDataPoint {
  label: string;
  ca: number; // Chiffre d'affaires (DT)
  orders: number; // Commandes
  marge: number; // Marge brute (DT)
}

interface DashboardChartProps {
  data: DashboardChartDataPoint[];
  periodLabel?: string;
}

export function DashboardChart({ data, periodLabel = "Période sélectionnée" }: DashboardChartProps) {
  const [metric, setMetric] = useState<"ca" | "orders" | "marge">("ca");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartData = data.length > 0 ? data : [{ label: "—", ca: 0, orders: 0, marge: 0 }];

  const getMetricConfig = () => {
    switch (metric) {
      case "ca":
        return {
          title: "Chiffre d'Affaires",
          unit: " DT",
          color: "#7B2F52", // Primary Plum
          secondaryColor: "#E090B0",
          getValue: (d: DashboardChartDataPoint) => d.ca,
          format: (val: number) => `${val.toLocaleString("fr-FR")} DT`,
        };
      case "orders":
        return {
          title: "Commandes",
          unit: "",
          color: "#2563EB", // Blue
          secondaryColor: "#93C5FD",
          getValue: (d: DashboardChartDataPoint) => d.orders,
          format: (val: number) => `${val} cmd`,
        };
      case "marge":
        return {
          title: "Marge Brute Estimée",
          unit: " DT",
          color: "#10B981", // Emerald Green
          secondaryColor: "#6EE7B7",
          getValue: (d: DashboardChartDataPoint) => d.marge,
          format: (val: number) => `${val.toLocaleString("fr-FR")} DT`,
        };
    }
  };

  const config = getMetricConfig();
  const values = chartData.map(config.getValue);
  const maxVal = Math.max(...values) * 1.15;
  const minVal = 0;

  // Dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = chartData.map((d, i) => {
    const val = config.getValue(d);
    const x = paddingX + (i / (chartData.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val, dataPoint: d };
  });

  // Curve path generator
  const curvePath = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaPath = `${curvePath} L ${paddingX + chartWidth},${svgHeight - paddingY} L ${paddingX},${svgHeight - paddingY} Z`;

  // Total metric calculation for header summary
  const totalVal = values.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface-alt/80 p-5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
      {/* Chart Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">Évolution des Ventes</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {periodLabel}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Total période :{" "}
            <span className="font-semibold text-ink">
              {config.format(totalVal)}
            </span>
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="inline-flex items-center rounded-xl bg-soft-nude/70 p-1 border border-border/40">
          <button
            onClick={() => setMetric("ca")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              metric === "ca"
                ? "bg-surface-alt text-primary shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <DollarSign size={13} />
            CA
          </button>
          <button
            onClick={() => setMetric("orders")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              metric === "orders"
                ? "bg-surface-alt text-blue-600 shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <ShoppingBag size={13} />
            Commandes
          </button>
          <button
            onClick={() => setMetric("marge")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              metric === "marge"
                ? "bg-surface-alt text-emerald-600 shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <TrendingUp size={13} />
            Marge Brute
          </button>
        </div>
      </div>

      {/* Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="dashboardChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.30" />
              <stop offset="95%" stopColor={config.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * chartHeight;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#dashboardChartFill)" />

          {/* Smooth Curve */}
          <path
            d={curvePath}
            fill="none"
            stroke={config.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points & Vertical Guide Lines */}
          {points.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Hover line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={svgHeight - paddingY}
                    stroke={config.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                )}

                {/* Point Outer Ring */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="var(--color-surface-alt)"
                  stroke={config.color}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* X Axis Label */}
                <text
                  x={p.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? "fill-ink font-bold" : "fill-ink-faint"
                  }`}
                >
                  {p.dataPoint.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoverIndex !== null && (
          <div
            className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-ink text-white p-2.5 shadow-xl border border-white/10 text-xs transition-all duration-150"
            style={{
              left: `${(points[hoverIndex].x / svgWidth) * 100}%`,
              top: `${(points[hoverIndex].y / svgHeight) * 100 - 12}%`,
            }}
          >
            <div className="font-semibold text-[0.6875rem] text-white/70 mb-1 border-b border-white/10 pb-0.5">
              {chartData[hoverIndex].label} (Journée)
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-bold text-white">
                {config.format(config.getValue(chartData[hoverIndex]))}
              </span>
            </div>
            <div className="mt-1 text-[0.625rem] text-white/60">
              {chartData[hoverIndex].orders} commandes enregistrées
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
