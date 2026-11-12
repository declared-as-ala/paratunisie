"use client";

import { useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@paratunisie/ui";
import { AnimatedText } from "@/components/dashboard/animated";
import { formatCurrency } from "@/lib/utils";

/* Monochrome ink + one coral accent. The ordered greys keep adjacent-pair separation (ΔE ≥ 17 for normal
   and colour-blind vision); their contrast against white is below 3:1, so every mark also has a visible
   label/legend value and a table alternative. */
const INK = "#171717";
const GRID = "#E7E7E2";
const AXIS = "#5F5F5A";
const CORAL = "#E4572E";
const GREYS = ["#171717", "#555550", "#888881", "#C4C4BC"] as const;

export interface DashboardChartDataPoint {
  label: string;
  ca: number; // Chiffre d'affaires (DT)
  orders: number; // Commandes
  marge: number; // Marge brute (DT)
}

type Metric = "ca" | "orders" | "marge";

const METRICS: { key: Metric; label: string; format: (v: number) => string }[] = [
  { key: "ca", label: "Chiffre d'affaires", format: (v) => formatCurrency(v) },
  { key: "orders", label: "Commandes", format: (v) => `${v} commande${v > 1 ? "s" : ""}` },
  { key: "marge", label: "Marge estimée", format: (v) => formatCurrency(v) },
];

const compact = (v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1).replace(".", ",")} k` : String(Math.round(v)));

/* ─── Sales evolution (area) ─────────────────────────────────────────────── */

export function SalesChart({ data, periodLabel }: { data: DashboardChartDataPoint[]; periodLabel: string }) {
  const reduce = useReducedMotion();
  const [metric, setMetric] = useState<Metric>("ca");
  const cfg = METRICS.find((m) => m.key === metric)!;
  const series = useMemo(() => data.map((d) => ({ label: d.label, value: d[metric] })), [data, metric]);
  const total = series.reduce((s, d) => s + d.value, 0);
  const hasData = series.some((d) => d.value > 0);
  const last = series[series.length - 1];

  return (
    <section className="studio-card h-full p-5" aria-label="Évolution des ventes">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AnimatedText as="h2" text="Évolution des ventes" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            {periodLabel} · <span className="num font-medium text-ink">{cfg.format(metric === "orders" ? total : Math.round(total * 1000) / 1000)}</span>
          </p>
        </div>
        <div role="tablist" aria-label="Indicateur du graphique" className="inline-flex rounded-lg border border-border bg-background p-0.5">
          {METRICS.map((m) => (
            <button
              key={m.key}
              role="tab"
              type="button"
              aria-selected={metric === m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[0.75rem] font-medium transition-colors",
                metric === m.key ? "bg-ink text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-72 w-full" role="img" aria-label={`${cfg.label} sur ${periodLabel}. Total ${cfg.format(total)}.`}>
        {!hasData ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border-strong text-[0.8125rem] text-ink-muted">
            Aucune vente sur cette période.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: GRID }} tick={{ fontSize: 11, fill: AXIS }} interval="preserveStartEnd" minTickGap={28} />
              <YAxis tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11, fill: AXIS }} tickFormatter={compact} allowDecimals={false} />
              <Tooltip
                cursor={{ stroke: INK, strokeWidth: 1, strokeDasharray: "3 3" }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-[0.75rem] shadow-[0_8px_24px_-12px_rgba(23,23,23,0.35)]">
                      <p className="text-ink-muted">{label}</p>
                      <p className="num mt-0.5 text-[0.8125rem] font-semibold text-ink">{cfg.format(Number(payload[0].value))}</p>
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={INK}
                strokeWidth={2}
                fill={INK}
                fillOpacity={0.06}
                isAnimationActive={!reduce}
                animationDuration={700}
                activeDot={{ r: 5, fill: CORAL, stroke: "#fff", strokeWidth: 2 }}
              />
              {last && <ReferenceDot x={last.label} y={last.value} r={4} fill={CORAL} stroke="#fff" strokeWidth={2} ifOverflow="visible" />}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <table className="sr-only">
        <caption>{cfg.label} par jour</caption>
        <thead><tr><th>Date</th><th>{cfg.label}</th></tr></thead>
        <tbody>{series.slice(-60).map((d) => <tr key={d.label}><td>{d.label}</td><td>{cfg.format(d.value)}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

/* ─── Order status split (donut) ─────────────────────────────────────────── */

const BUCKETS: { key: string; label: string; statuses: string[]; color: string }[] = [
  { key: "delivered", label: "Livrées", statuses: ["LIVREE"], color: GREYS[0] },
  { key: "inflight", label: "En cours", statuses: ["CONFIRMEE", "PREPARATION", "PRETE_EXPEDITION", "EXPEDIEE"], color: GREYS[1] },
  { key: "pending", label: "En attente", statuses: ["EN_ATTENTE", "TENTATIVE_CONTACT"], color: GREYS[2] },
  { key: "cancelled", label: "Annulées", statuses: ["ANNULEE", "REFUSEE"], color: GREYS[3] },
  { key: "problem", label: "Retours / échecs", statuses: ["RETOURNEE", "ECHEC_LIVRAISON"], color: CORAL },
];

export function StatusDonut({ statusCounts, footnote }: { statusCounts: Record<string, number>; footnote?: string }) {
  const reduce = useReducedMotion();
  const slices = BUCKETS.map((b) => ({ ...b, value: b.statuses.reduce((s, k) => s + (statusCounts[k] ?? 0), 0) })).filter((b) => b.value > 0);
  const total = slices.reduce((s, b) => s + b.value, 0);

  return (
    <section className="studio-card flex h-full flex-col p-5" aria-label="Répartition des commandes par statut">
      <AnimatedText as="h2" text="Commandes par statut" className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
      <p className="mt-1 text-[0.8125rem] text-ink-muted">Sur la période sélectionnée</p>

      {total === 0 ? (
        <div className="mt-5 flex flex-1 items-center justify-center rounded-lg border border-dashed border-border-strong py-10 text-[0.8125rem] text-ink-muted">
          Aucune commande sur cette période.
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 h-44 w-44" role="img" aria-label={`${total} commandes : ${slices.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(", ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="value" nameKey="label" innerRadius="66%" outerRadius="100%" paddingAngle={2} stroke="#fff" strokeWidth={2} isAnimationActive={!reduce} animationDuration={700} startAngle={90} endAngle={-270}>
                  {slices.map((s) => <Cell key={s.key} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="num text-2xl font-semibold text-ink">{total}</span>
              <span className="text-[0.6875rem] text-ink-muted">commandes</span>
            </div>
          </div>
          <ul className="mt-5 space-y-2">
            {slices.map((s) => (
              <li key={s.key} className="flex items-center gap-2.5 text-[0.8125rem]">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} aria-hidden />
                <span className="flex-1 text-ink">{s.label}</span>
                <span className="num font-medium text-ink">{s.value}</span>
                <span className="num w-12 text-right text-ink-muted">{Math.round((s.value / total) * 100)} %</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {footnote && <p className="mt-auto pt-4 text-[0.75rem] text-ink-muted">{footnote}</p>}
    </section>
  );
}

/* ─── Ranked bars (best sellers, brands) ─────────────────────────────────── */

export interface BarRow {
  key: string;
  label: string;
  value: number;
  /** Direct label printed at the end of the bar. */
  valueLabel: string;
  sub?: string;
}

export function BarList({ title, description, rows, empty, caption }: { title: string; description?: string; rows: BarRow[]; empty: string; caption: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="studio-card h-full p-5" aria-label={caption}>
      <AnimatedText as="h2" text={title} className="text-[0.9375rem] font-semibold tracking-tight text-ink" />
      {description && <p className="mt-1 text-[0.8125rem] text-ink-muted">{description}</p>}
      {rows.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border-strong py-10 text-center text-[0.8125rem] text-ink-muted">{empty}</div>
      ) : (
        <ol className="mt-5 space-y-3.5">
          {rows.map((r, i) => (
            <li key={r.key}>
              <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                <span className="min-w-0 truncate font-medium text-ink" title={r.label}>{r.label}</span>
                <span className="num shrink-0 font-medium text-ink">{r.valueLabel}</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-soft-nude" role="presentation">
                {/* Rounded data end, anchored on the baseline; the leader is the one coral highlight. */}
                <div className="h-full rounded-full" style={{ width: `${Math.max(3, (r.value / max) * 100)}%`, background: i === 0 ? CORAL : INK }} />
              </div>
              {r.sub && <p className="mt-1 text-[0.6875rem] text-ink-muted">{r.sub}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
