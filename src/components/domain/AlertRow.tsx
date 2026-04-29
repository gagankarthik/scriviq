"use client";

import Link from "next/link";
import { type Alert, clauseTypeLabel, daysUntil } from "@/lib/mock-data";

const TYPE_CONFIG = {
  overdue: { label: "Overdue", icon: "🔴", color: "text-red-400" },
  "1_day": { label: "Due Tomorrow", icon: "🟠", color: "text-amber-400" },
  "7_day": { label: "Due in 7 days", icon: "🟡", color: "text-yellow-400" },
};

interface AlertRowProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
}

export function AlertRow({ alert, onDismiss }: AlertRowProps) {
  const cfg = TYPE_CONFIG[alert.type];
  const days = daysUntil(alert.dueDate);
  const isDismissed = alert.status === "dismissed";

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 ${
        isDismissed
          ? "border-slate-800/30 bg-transparent opacity-50"
          : alert.type === "overdue"
          ? "border-red-900/30 bg-red-950/10 hover:bg-red-950/15"
          : alert.type === "1_day"
          ? "border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/15"
          : "border-slate-800/50 bg-slate-900/20 hover:bg-slate-900/40"
      }`}
    >
      {/* Icon */}
      <div className="shrink-0 text-lg mt-0.5">{cfg.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-xs font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded">
            {clauseTypeLabel(alert.clauseType)}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-100 truncate">
          {alert.clauseTitle}
        </p>
        <Link
          href={`/contracts/${alert.contractId}`}
          className="text-xs text-slate-500 hover:text-indigo-400 transition-colors truncate block"
        >
          {alert.contractTitle} · {alert.clientName}
        </Link>
        <p className="text-xs font-mono text-slate-600 mt-1">
          {days < 0
            ? `${Math.abs(days)} days overdue`
            : days === 0
            ? "Due today"
            : `Due in ${days} days — ${new Date(alert.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
        </p>
      </div>

      {/* Actions */}
      {!isDismissed && onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          className="shrink-0 text-xs text-slate-600 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/60"
        >
          Dismiss
        </button>
      )}
      {isDismissed && (
        <span className="shrink-0 text-xs text-slate-700">Dismissed</span>
      )}
    </div>
  );
}
