import { formatCurrency } from "@/lib/mock-data";

interface Stat {
  label: string;
  value: string;
  sub?: string;
  accent?: "indigo" | "amber" | "red" | "emerald";
}

const accentLeft: Record<NonNullable<Stat["accent"]>, string> = {
  indigo: "border-l-indigo-500",
  amber:  "border-l-amber-500",
  red:    "border-l-red-500",
  emerald:"border-l-emerald-500",
};

const accentText: Record<NonNullable<Stat["accent"]>, string> = {
  indigo: "text-indigo-300",
  amber:  "text-amber-300",
  red:    "text-red-300",
  emerald:"text-emerald-300",
};

function StatCard({ label, value, sub, accent = "indigo" }: Stat) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 border-l-2 ${accentLeft[accent]}`}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
        {label}
      </p>
      <p className={`text-3xl font-semibold font-mono tracking-tight ${accentText[accent]}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-slate-600 mt-1">{sub}</p>
      )}
    </div>
  );
}

interface StatsBarProps {
  totalValue: number;
  activeContracts: number;
  highRiskClauseCount: number;
  upcomingDeadlineCount: number;
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
        sub="Active contracts only"
        accent="indigo"
      />
      <StatCard
        label="Active Contracts"
        value={String(activeContracts)}
        sub="Ready for review"
        accent="emerald"
      />
      <StatCard
        label="High-Risk Clauses"
        value={String(highRiskClauseCount)}
        sub="Require attention"
        accent="red"
      />
      <StatCard
        label="Upcoming Deadlines"
        value={String(upcomingDeadlineCount)}
        sub="Next 30 days"
        accent="amber"
      />
    </div>
  );
}
