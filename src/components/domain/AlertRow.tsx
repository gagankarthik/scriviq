"use client";

import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle2, X } from "lucide-react";
import { type Alert } from "@/lib/mock-data";
import { clauseTypeLabel, daysUntil } from "@/lib/utils";

const TYPE_CONFIG = {
  overdue: {
    label:   "Overdue",
    color:   "text-red-600 dark:text-red-400",
    bg:      "border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10",
    hoverBg: "hover:bg-red-100 dark:hover:bg-red-950/20",
    Icon:    AlertTriangle,
  },
  "1_day": {
    label:   "Due Tomorrow",
    color:   "text-amber-600 dark:text-amber-400",
    bg:      "border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/10",
    hoverBg: "hover:bg-amber-100 dark:hover:bg-amber-950/20",
    Icon:    Clock,
  },
  "7_day": {
    label:   "Due in 7 days",
    color:   "text-yellow-600 dark:text-yellow-400",
    bg:      "border-[var(--border-color)] bg-[var(--surface-elevated)]",
    hoverBg: "hover:bg-[var(--surface-subtle)]",
    Icon:    Clock,
  },
  "budget_80pct": {
    label:   "Budget 80%",
    color:   "text-orange-600 dark:text-orange-400",
    bg:      "border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/10",
    hoverBg: "hover:bg-orange-100 dark:hover:bg-orange-950/20",
    Icon:    AlertTriangle,
  },
};

interface AlertRowProps {
  alert:     Alert;
  onDismiss?:(id: string) => void;
  onAction?: (id: string) => void;
}

export function AlertRow({ alert, onDismiss, onAction }: AlertRowProps) {
  const cfg = TYPE_CONFIG[alert.type];
  const days = daysUntil(alert.dueDate);
  const isDismissed = alert.status === "dismissed";
  const { Icon } = cfg;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 ${
        isDismissed
          ? "border-[var(--border-subtle)] bg-transparent opacity-50"
          : `${cfg.bg} ${cfg.hoverBg}`
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${cfg.color}`}>
        <Icon size={15} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
            {clauseTypeLabel(alert.clauseType)}
          </span>
          {alert.status === "sent" && (
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 size={9} />
              Sent
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-[var(--fg-primary)] truncate">
          {alert.clauseTitle}
        </p>
        <Link
          href={`/contracts/${alert.contractId}`}
          className="text-xs text-[var(--fg-muted)] hover:text-[#75D8FC] transition-colors truncate block"
        >
          {alert.contractTitle} · {alert.clientName}
        </Link>
        <p className="text-xs font-mono text-[var(--fg-muted)] mt-1">
          {days < 0
            ? `${Math.abs(days)} days overdue`
            : days === 0
            ? "Due today"
            : `Due in ${days}d — ${new Date(alert.dueDate).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}`}
        </p>
      </div>

      {/* Actions */}
      {!isDismissed && (
        <div className="flex items-center gap-1 shrink-0">
          {onAction && (
            <button
              onClick={() => onAction(alert.id)}
              className="text-xs font-medium px-2 py-1 rounded-lg transition-colors"
              style={{ color: "#0072E5" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,114,229,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; }}
            >
              Action
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}
      {isDismissed && (
        <span className="shrink-0 text-xs text-[var(--fg-muted)]">Dismissed</span>
      )}
    </div>
  );
}
