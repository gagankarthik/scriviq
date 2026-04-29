import { TrendingUp, FileCheck2, ShieldAlert, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";

interface Stat {
  label:   string;
  value:   string;
  sub?:    string;
  accent?: "indigo" | "amber" | "red" | "emerald";
  Icon:    React.ElementType;
}

const accentBorder: Record<NonNullable<Stat["accent"]>, string> = {
  indigo:  "border-l-indigo-500",
  amber:   "border-l-amber-500",
  red:     "border-l-red-500",
  emerald: "border-l-emerald-500",
};

const accentText: Record<NonNullable<Stat["accent"]>, string> = {
  indigo:  "text-indigo-600 dark:text-indigo-400",
  amber:   "text-amber-600 dark:text-amber-400",
  red:     "text-red-600 dark:text-red-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
};

const accentBg: Record<NonNullable<Stat["accent"]>, string> = {
  indigo:  "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
  amber:   "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  red:     "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400",
  emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
};

function StatCard({ label, value, sub, accent = "indigo", Icon }: Stat) {
  return (
    <div className={`rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 border-l-2 ${accentBorder[accent]} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[var(--fg-muted)] uppercase tracking-wider font-semibold">
          {label}
        </p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accentBg[accent]}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      <p className={`text-2xl font-bold font-mono tracking-tight ${accentText[accent]}`}>
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
        accent="indigo"
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
