"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { type Clause } from "@/lib/mock-data";
import { clauseTypeLabel, daysUntil, formatCurrency } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";

interface ClauseRowProps {
  clause:     Clause;
  onAction?:  (clauseId: string, status: Clause["status"]) => void;
}

export function ClauseRow({ clause, onAction }: ClauseRowProps) {
  const [expanded, setExpanded] = useState(false);
  const days      = clause.dueDate ? daysUntil(clause.dueDate) : null;
  const isUrgent  = days !== null && days <= 7 && days >= 0;
  const isOverdue = days !== null && days < 0;

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-[rgba(0,114,229,0.25)] transition-all duration-150 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                {clauseTypeLabel(clause.type)}
              </span>
              <RiskBadge level={clause.riskLevel} />
              {clause.status !== "active" && (
                <span
                  className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                    clause.status === "actioned"
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                      : "bg-[var(--surface-subtle)] text-[var(--fg-muted)] border-[var(--border-subtle)]"
                  }`}
                >
                  {clause.status}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">
              {clause.title}
            </p>
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed line-clamp-2">
              {clause.summary}
            </p>

            {clause.riskReason && clause.riskLevel !== "low" && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                <span>{clause.riskReason}</span>
              </div>
            )}

            {/* Raw text (expandable) */}
            {expanded && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                <p className="text-xs font-mono text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
                  {clause.rawText}
                </p>
              </div>
            )}

            {/* Tags + expand */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {clause.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="ml-auto flex items-center gap-0.5 text-[10px] font-mono text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors"
              >
                {expanded ? (
                  <><ChevronUp size={11} /> Hide text</>
                ) : (
                  <><ChevronDown size={11} /> Show clause text</>
                )}
              </button>
            </div>
          </div>

          {/* Right: meta + action */}
          <div className="shrink-0 text-right space-y-2 min-w-[80px]">
            {clause.dueDate && (
              <div>
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Due</p>
                <p className={`text-xs font-mono font-semibold mt-0.5 ${
                  isOverdue  ? "text-red-500 dark:text-red-400"
                  : isUrgent ? "text-amber-500 dark:text-amber-400"
                  : "text-[var(--fg-secondary)]"
                }`}>
                  {isOverdue ? `${Math.abs(days!)}d late` : days === 0 ? "Today" : `${days}d`}
                </p>
                <p className="text-[10px] text-[var(--fg-muted)] font-mono">
                  {new Date(clause.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            )}
            {clause.amount && (
              <div>
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Amount</p>
                <p className="text-xs font-mono font-semibold text-[var(--fg-secondary)] mt-0.5">
                  {formatCurrency(clause.amount)}
                </p>
              </div>
            )}
            {clause.noticeDays && (
              <div>
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Notice</p>
                <p className="text-xs font-mono font-semibold text-[var(--fg-secondary)] mt-0.5">
                  {clause.noticeDays}d
                </p>
              </div>
            )}

            {onAction && clause.status === "active" && (
              <button
                onClick={() => onAction(clause.id, "actioned")}
                className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ml-auto mt-2"
              >
                <CheckCircle2 size={12} />
                Mark done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
