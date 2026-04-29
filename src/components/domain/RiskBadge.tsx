import { type RiskLevel } from "@/lib/mock-data";

interface RiskBadgeProps {
  level: RiskLevel;
  showDot?: boolean;
}

const config: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  high:   { label: "HIGH",   cls: "bg-red-950/60 text-red-400 border-red-800/50",     dot: "bg-red-500" },
  medium: { label: "MED",    cls: "bg-amber-950/60 text-amber-400 border-amber-800/50", dot: "bg-amber-500" },
  low:    { label: "LOW",    cls: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50", dot: "bg-emerald-500" },
};

export function RiskBadge({ level, showDot = true }: RiskBadgeProps) {
  const { label, cls, dot } = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${cls}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  );
}

export function RiskBadgeLarge({ level }: { level: RiskLevel }) {
  const config: Record<RiskLevel, { label: string; cls: string }> = {
    high:   { label: "High Risk",   cls: "bg-red-950/40 text-red-400 border-red-800/40" },
    medium: { label: "Medium Risk", cls: "bg-amber-950/40 text-amber-400 border-amber-800/40" },
    low:    { label: "Low Risk",    cls: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" },
  };
  const { label, cls } = config[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${cls}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
