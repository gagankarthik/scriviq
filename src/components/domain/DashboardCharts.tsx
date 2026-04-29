"use client";

import { useMemo, useCallback } from "react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
  Tooltip,
} from "recharts";
import type { Contract } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

// ── Palette ───────────────────────────────────────────────────────────────────

const C = {
  brand:  "#0072E5",
  light:  "#75D8FC",
  green:  "#10b981",
  amber:  "#f59e0b",
  red:    "#ef4444",
  muted:  "#64748b",
  grid:   "rgba(148,163,184,0.07)",
  cursor: "rgba(148,163,184,0.04)",
} as const;

// ── Shared custom tooltip ─────────────────────────────────────────────────────

interface TooltipEntry { color: string; name: string; value: number }

function ChartTooltip({
  active, payload, label, fmt,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  fmt?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   "var(--surface-elevated)",
      border:       "1px solid var(--border-color)",
      borderRadius: 10,
      padding:      "10px 14px",
      boxShadow:    "0 8px 32px rgba(0,0,0,0.3)",
      minWidth:     110,
    }}>
      {label && (
        <p style={{ color: "var(--fg-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "var(--fg-primary)", fontSize: 13, fontFamily: "monospace", fontWeight: 700 }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Monthly data helper ───────────────────────────────────────────────────────

function buildMonths(contracts: Contract[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const y = d.getFullYear(), m = d.getMonth();
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const added = contracts.filter(c => {
      const u = new Date(c.uploadedAt);
      return u.getFullYear() === y && u.getMonth() === m;
    });
    return { label, count: added.length, value: added.reduce((s, c) => s + (c.contractValue ?? 0), 0) };
  });
}

// ── Portfolio area chart ───────────────────────────────────────────────────────

export function PortfolioChart({ contracts }: { contracts: Contract[] }) {
  const data = useMemo(() => {
    const months = buildMonths(contracts);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    let running = contracts
      .filter(c => c.status === "ready" && new Date(c.uploadedAt) < cutoff)
      .reduce((s, c) => s + (c.contractValue ?? 0), 0);
    return months.map(m => { running += m.value; return { month: m.label, value: running }; });
  }, [contracts]);

  const currentValue = data[data.length - 1]?.value ?? 0;
  const prevValue    = data[data.length - 2]?.value ?? 0;
  const delta        = currentValue - prevValue;
  const tip = useCallback((p: any) => <ChartTooltip {...p} fmt={formatCurrency} />, []);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Portfolio Value</p>
          <p className="text-3xl font-bold font-mono mt-1 tracking-tight" style={{ color: C.brand }}>
            {formatCurrency(currentValue)}
          </p>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">Cumulative — last 6 months</p>
        </div>
        {delta !== 0 && (
          <span
            className="text-xs font-semibold font-mono px-2 py-1 rounded-lg border mt-1"
            style={
              delta > 0
                ? { color: C.green, background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.2)" }
                : { color: C.red,   background: "rgba(239,68,68,0.08)",  borderColor: "rgba(239,68,68,0.2)"  }
            }
          >
            {delta > 0 ? "+" : ""}{formatCurrency(delta)}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="pgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={C.brand} stopOpacity={0.22} />
              <stop offset="100%" stopColor={C.brand} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
          />
          <Tooltip content={tip} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={C.brand}
            strokeWidth={2.5}
            fill="url(#pgFill)"
            dot={false}
            activeDot={{ r: 5, fill: C.brand, stroke: "var(--surface-elevated)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Risk distribution donut ───────────────────────────────────────────────────

const RISK_PALETTE = { High: C.red, Medium: C.amber, Low: C.green };

export function RiskDonutChart({ contracts }: { contracts: Contract[] }) {
  const { slices, total } = useMemo(() => {
    const ready = contracts.filter(c => c.status === "ready");
    const counts = { High: 0, Medium: 0, Low: 0 };
    for (const c of ready) {
      if      (c.riskScore === "high")   counts.High++;
      else if (c.riskScore === "medium") counts.Medium++;
      else if (c.riskScore === "low")    counts.Low++;
    }
    const slices = (Object.entries(counts) as [keyof typeof counts, number][])
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: RISK_PALETTE[name] }));
    return { slices, total: slices.reduce((s, x) => s + x.value, 0) };
  }, [contracts]);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-4">Risk Distribution</p>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[160px]">
          <p className="text-sm text-[var(--fg-muted)]">No scored contracts yet</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center">
            <div className="relative">
              <PieChart width={140} height={140}>
                <Pie
                  data={slices}
                  cx={66}
                  cy={66}
                  innerRadius={38}
                  outerRadius={62}
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-[var(--fg-primary)]">{total}</span>
                <span className="text-[9px] text-[var(--fg-muted)] uppercase tracking-widest mt-0.5">scored</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {slices.map(({ name, value, color }) => {
              const pct = Math.round((value / total) * 100);
              return (
                <div key={name} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-xs text-[var(--fg-secondary)] flex-1">{name} risk</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--fg-primary)] w-4 text-right">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Monthly uploads bar chart ─────────────────────────────────────────────────

export function MonthlyUploadsChart({ contracts }: { contracts: Contract[] }) {
  const data = useMemo(
    () => buildMonths(contracts).map(m => ({ month: m.label, contracts: m.count })),
    [contracts]
  );
  const tip = useCallback((p: any) => <ChartTooltip {...p} />, []);
  const max = Math.max(...data.map(d => d.contracts), 1);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Monthly Uploads</p>
      <p className="text-xs text-[var(--fg-muted)] mt-0.5 mb-4">Contracts added each month</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={26}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
            domain={[0, max + 1]}
          />
          <Tooltip content={tip} cursor={{ fill: C.cursor }} />
          <Bar dataKey="contracts" radius={[5, 5, 0, 0]} name="contracts">
            {data.map((d, i) => (
              <Cell key={i} fill={d.contracts > 0 ? C.brand : "var(--surface-subtle)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Client breakdown horizontal bar ──────────────────────────────────────────

export function ClientBreakdownChart({ contracts }: { contracts: Contract[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contracts.filter(c => c.status === "ready")) {
      map.set(c.clientName, (map.get(c.clientName) ?? 0) + (c.contractValue ?? 0));
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value], i) => ({
        name: name.length > 18 ? name.slice(0, 16) + "…" : name,
        value,
        color: i === 0 ? C.brand : C.green,
      }));
  }, [contracts]);

  const tip = useCallback((p: any) => <ChartTooltip {...p} fmt={formatCurrency} />, []);

  if (!data.length) return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-4">Top Clients</p>
      <div className="flex-1 flex items-center justify-center min-h-[140px]">
        <p className="text-sm text-[var(--fg-muted)]">No client data yet</p>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Top Clients</p>
      <p className="text-xs text-[var(--fg-muted)] mt-0.5 mb-4">Portfolio value by client</p>
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
          />
          <YAxis
            type="category" dataKey="name"
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
            width={84}
          />
          <Tooltip content={tip} cursor={{ fill: C.cursor }} />
          <Bar dataKey="value" radius={[0, 5, 5, 0]} name="value">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Deadline urgency bar chart ────────────────────────────────────────────────

export function DeadlineUrgencyChart({ contracts }: { contracts: Contract[] }) {
  const data = useMemo(() => {
    const ready = contracts.filter(c => c.status === "ready" && c.expiryDate);
    const buckets = [
      { label: "Overdue",  min: -Infinity, max: 0,   color: C.red   },
      { label: "0–7d",     min: 0,         max: 8,   color: C.amber },
      { label: "8–30d",    min: 8,         max: 31,  color: "#f97316" },
      { label: "31–90d",   min: 31,        max: 91,  color: C.brand },
      { label: "90d+",     min: 91,        max: Infinity, color: C.green },
    ];
    return buckets.map(b => {
      const now = Date.now();
      const count = ready.filter(c => {
        const diff = (new Date(c.expiryDate!).getTime() - now) / 86_400_000;
        return diff >= b.min && diff < b.max;
      }).length;
      return { label: b.label, count, color: b.color };
    });
  }, [contracts]);

  const tip = useCallback((p: any) => <ChartTooltip {...p} />, []);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Expiry Urgency</p>
      <p className="text-xs text-[var(--fg-muted)] mt-0.5 mb-4">Contracts by time to expiry</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: C.muted, fontSize: 10 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={tip} cursor={{ fill: C.cursor }} />
          <Bar dataKey="count" radius={[5, 5, 0, 0]} name="contracts">
            {data.map((d, i) => (
              <Cell key={i} fill={d.count > 0 ? d.color : "var(--surface-subtle)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
