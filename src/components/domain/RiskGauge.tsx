"use client";

import { type Clause } from "@/lib/mock-data";

export function computeRiskScore(clauses: Clause[]): number {
  if (!clauses.length) return 0;
  const h = clauses.filter((c) => c.riskLevel === "high").length;
  const m = clauses.filter((c) => c.riskLevel === "medium").length;
  const l = clauses.filter((c) => c.riskLevel === "low").length;
  return Math.min(100, Math.round((h * 100 + m * 45 + l * 10) / clauses.length));
}

interface RiskGaugeProps {
  score: number; // 0–100
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const s     = Math.max(0, Math.min(100, score));
  const color = s >= 67 ? "#ef4444" : s >= 34 ? "#f59e0b" : "#10b981";
  const label = s >= 67 ? "HIGH RISK" : s >= 34 ? "MEDIUM" : "LOW RISK";

  // SVG semicircle gauge: arc from (16,64) through (64,16) to (112,64)
  // sweep=1 (clockwise) draws through the top.  pathLength="100" normalises.
  return (
    <svg width="128" height="74" viewBox="0 0 128 74" aria-label={`Risk score ${s}`}>
      {/* Zone colour stops on track */}
      <defs>
        <linearGradient id="gauge-track-green" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#10b981" stopOpacity=".25" />
          <stop offset="33%"  stopColor="#10b981" stopOpacity=".25" />
          <stop offset="50%"  stopColor="#f59e0b" stopOpacity=".25" />
          <stop offset="66%"  stopColor="#f59e0b" stopOpacity=".25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity=".25" />
        </linearGradient>
      </defs>

      {/* Background track */}
      <path
        d="M 16 64 A 48 48 0 0 1 112 64"
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        pathLength="100"
        stroke="var(--surface-subtle)"
      />

      {/* Progress arc */}
      <path
        d="M 16 64 A 48 48 0 0 1 112 64"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray={`${s} 100`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
      />

      {/* Score number */}
      <text
        x="64" y="51"
        textAnchor="middle"
        fontSize="28"
        fontWeight="700"
        fontFamily="'JetBrains Mono',monospace"
        fill={color}
      >
        {s}
      </text>

      {/* Label */}
      <text
        x="64" y="66"
        textAnchor="middle"
        fontSize="7.5"
        letterSpacing="1.5"
        fontFamily="monospace"
        fill="var(--fg-muted)"
      >
        {label}
      </text>
    </svg>
  );
}
