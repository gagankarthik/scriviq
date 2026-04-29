import { type Clause, clauseTypeLabel, daysUntil, formatCurrency } from "@/lib/mock-data";
import { RiskBadge } from "./RiskBadge";

interface ClauseRowProps {
  clause: Clause;
}

export function ClauseRow({ clause }: ClauseRowProps) {
  const days = clause.dueDate ? daysUntil(clause.dueDate) : null;
  const isUrgent = days !== null && days <= 7;
  const isOverdue = days !== null && days < 0;

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-900/20 hover:bg-slate-900/50 hover:border-slate-700/50 transition-all duration-150 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Left: type + content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                {clauseTypeLabel(clause.type)}
              </span>
              <RiskBadge level={clause.riskLevel} />
              {clause.status !== "active" && (
                <span
                  className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    clause.status === "actioned"
                      ? "bg-emerald-950/60 text-emerald-500 border border-emerald-800/40"
                      : "bg-slate-800/60 text-slate-500 border border-slate-700/40"
                  }`}
                >
                  {clause.status}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-100 mb-1">
              {clause.title}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {clause.summary}
            </p>

            {clause.riskReason && clause.riskLevel !== "low" && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600/90">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{clause.riskReason}</span>
              </div>
            )}

            {/* Tags */}
            {clause.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {clause.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono text-slate-600 bg-slate-800/40 px-1.5 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: meta */}
          <div className="shrink-0 text-right space-y-2 min-w-[72px]">
            {clause.dueDate && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Due</p>
                <p
                  className={`text-xs font-mono font-semibold mt-0.5 ${
                    isOverdue
                      ? "text-red-400"
                      : isUrgent
                      ? "text-amber-400"
                      : "text-slate-300"
                  }`}
                >
                  {isOverdue
                    ? `${Math.abs(days!)}d overdue`
                    : days === 0
                    ? "Today"
                    : `${days}d`}
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  {new Date(clause.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            {clause.amount && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Amount</p>
                <p className="text-xs font-mono font-semibold text-slate-300 mt-0.5">
                  {formatCurrency(clause.amount)}
                </p>
              </div>
            )}
            {clause.noticeDays && (
              <div>
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Notice</p>
                <p className="text-xs font-mono font-semibold text-slate-300 mt-0.5">
                  {clause.noticeDays}d
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
