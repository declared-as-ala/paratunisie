"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  color?: "primary" | "success" | "warning" | "danger" | "neutral";
  height?: number;
  width?: number;
  showGradient?: boolean;
}

export function Sparkline({
  data,
  color = "primary",
  height = 32,
  width = 100,
  showGradient = true,
}: SparklineProps) {
  const rawId = useId();
  const gradientId = `sparkline-gradient-${color}-${rawId.replace(/:/g, "")}`;

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y };
  });

  // Construct smooth bezier curve path string
  const d = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
  }, "");

  // Area path for gradient fill under the line
  const fillD = `${d} L ${width},${height} L 0,${height} Z`;

  const colorMap = {
    primary: { stroke: "#7B2F52", fill: "#7B2F52" },
    success: { stroke: "#10B981", fill: "#10B981" },
    warning: { stroke: "#F59E0B", fill: "#F59E0B" },
    danger: { stroke: "#EF4444", fill: "#EF4444" },
    neutral: { stroke: "#716268", fill: "#716268" },
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <div className="relative inline-flex items-center" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={selectedColor.fill} stopOpacity="0.25" />
            <stop offset="100%" stopColor={selectedColor.fill} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {showGradient && <path d={fillD} fill={`url(#${gradientId})`} />}

        <path
          d={d}
          fill="none"
          stroke={selectedColor.stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse dot on last data point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill={selectedColor.stroke}
        />
      </svg>
    </div>
  );
}
