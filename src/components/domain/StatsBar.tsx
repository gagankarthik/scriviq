import { TrendingUp, FileCheck2, ShieldAlert, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Accent = "brand" | "amber" | "red" | "emerald";

interface Stat {
  label:   string;
  value:   string;
  sub?:    string;
  accent?: Accent;
  Icon:    React.ElementType;
}

const accentStyles: Record<Accent, { border: string; text: string; iconBg: string; iconColor: string }> = {
  brand:   { border: "border-l-[#0072E5]",    text: "text-[#0072E5] dark:text-[#75D8FC]",          iconBg: "rgba(0,114,229,0.1)",    iconColor: "#0072E5" },
  amber:   { border: "border-l-amber-500",     text: "text-amber-600 dark:text-amber-400",           iconBg: "rgba(245,158,11,0.1)",   iconColor: "#d97706" },
  red:     { border: "border-l-red-500",       text: "text-red-600 dark:text-red-400",               iconBg: "rgba(239,68,68,0.1)",    iconColor: "#dc2626" },
  emerald: { border: "border-l-emerald-500",   text: "text-emerald-600 dark:text-emerald-400",       iconBg: "rgba(16,185,129,0.1)",   iconColor: "#059669" },
};

function StatCard({ label, value, sub, accent = "brand", Icon }: Stat) {
  const s = accentStyles[accent];
  return (
    <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 border-l-2 ${s.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[var(--fg-muted)] uppercase tracking-wider font-semibold">
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: s.iconBg, color: s.iconColor }}
        >
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      <p className={`text-2xl font-bold font-mono tracking-tight ${s.text}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[var(--fg-muted)] mt-1">{sub}</p>
      )}
    </div>
  );
}

interface StatsBarProps {
  totalValue:           number;
  activeContracts:      number;
  highRiskClauseCount:  number;
  upcomingDeadlineCount:number;
}

export function StatsBar({
  totalValue,
  activeContracts,
  highRiskClauseCount,
  upcomingDeadlineCount,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Portfolio Value"
        value={formatCurrency(totalValue)}
        sub="Active contracts"
        accent="brand"
        Icon={TrendingUp}
      />
      <StatCard
        label="Active Contracts"
        value={String(activeContracts)}
        sub="Ready for review"
        accent="emerald"
        Icon={FileCheck2}
      />
      <StatCard
        label="High-Risk Clauses"
        value={String(highRiskClauseCount)}
        sub="Require attention"
        accent="red"
        Icon={ShieldAlert}
      />
      <StatCard
        label="Upcoming Deadlines"
        value={String(upcomingDeadlineCount)}
        sub="Next 30 days"
        accent="amber"
        Icon={Clock}
      />
    </div>
  );
}
