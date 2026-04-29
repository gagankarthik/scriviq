"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Minus, Activity,
} from "lucide-react";
import { type Clause } from "@/lib/mock-data";
import { clauseTypeLabel, daysUntil, formatCurrency } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";

// ── Confidence ────────────────────────────────────────────────────────────────

function inferConfidence(clause: Clause): "high" | "medium" | "low" {
  const len = clause.rawText?.length ?? 0;
  if (len > 400) return "high";
  if (len > 120) return "medium";
  return "low";
}

const CONFIDENCE_STYLES = {
  high:   { label: "High confidence",   color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)" },
  medium: { label: "Medium confidence", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)" },
  low:    { label: "Low confidence",    color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)" },
};

// ── Favorability (termination clauses only) ───────────────────────────────────

type Favorability = "agency-friendly" | "balanced" | "client-friendly";

interface FavStyle {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  Icon:   React.ElementType;
}

const FAV_STYLES: Record<Favorability, FavStyle> = {
  "agency-friendly": { label: "Agency-friendly",  color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  Icon: ThumbsUp },
  "balanced":        { label: "Balanced",          color: "#0072E5", bg: "rgba(0,114,229,0.08)",   border: "rgba(0,114,229,0.2)",   Icon: Minus },
  "client-friendly": { label: "Client-favoured",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  Icon: ThumbsDown },
};

function inferFavorability(clause: Clause): FavStyle | null {
  if (clause.type !== "termination_notice") return null;
  if (clause.riskLevel === "high") return FAV_STYLES["client-friendly"];
  if (clause.noticeDays && clause.noticeDays >= 30) return FAV_STYLES["agency-friendly"];
  if (clause.noticeDays && clause.noticeDays < 14)  return FAV_STYLES["client-friendly"];
  return FAV_STYLES["balanced"];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ClauseRowProps {
  clause:      Clause;
  onAction?:   (clauseId: string, status: Clause["status"]) => void;
  reviewMode?: boolean;
}

export function ClauseRow({ clause, onAction, reviewMode = false }: ClauseRowProps) {
  const [expanded, setExpanded] = useState(reviewMode);

  useEffect(() => { setExpanded(reviewMode); }, [reviewMode]);

  const days        = clause.dueDate ? daysUntil(clause.dueDate) : null;
  const isUrgent    = days !== null && days <= 7 && days >= 0;
  const isOverdue   = days !== null && days < 0;
  const confidence  = inferConfidence(clause);
  const favStyle    = inferFavorability(clause);
  const confStyle   = CONFIDENCE_STYLES[confidence];

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-[rgba(0,114,229,0.25)] transition-all duration-150 overflow-hidden">

      {reviewMode ? (
        /* ── Review mode: side-by-side ────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
          {/* Left: raw text */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)]">Source text</span>
              <span
                className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                style={{ color: confStyle.color, backgroundColor: confStyle.bg, borderColor: confStyle.border }}
              >
                {confidence} conf.
              </span>
            </div>
            <p className="text-xs font-mono text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {clause.rawText || "—"}
            </p>
          </div>
          {/* Right: extracted data */}
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)]">Extracted</span>
              <Activity size={10} className="text-[var(--fg-muted)]" />
            </div>
            <MetaPanel clause={clause} days={days} isUrgent={isUrgent} isOverdue={isOverdue} favStyle={favStyle} onAction={onAction} />
          </div>
        </div>
      ) : (
        /* ── List mode ────────────────────────────────────────────────── */
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                  {clauseTypeLabel(clause.type)}
                </span>
                <RiskBadge level={clause.riskLevel} />
                {favStyle && (
                  <span
                    className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                    style={{ color: favStyle.color, backgroundColor: favStyle.bg, borderColor: favStyle.border }}
                  >
                    <favStyle.Icon size={9} />
                    {favStyle.label}
                  </span>
                )}
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
                <span
                  className="ml-auto text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                  style={{ color: confStyle.color, backgroundColor: confStyle.bg, borderColor: confStyle.border }}
                  title={confStyle.label}
                >
                  {confidence} conf.
                </span>
              </div>

              <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">{clause.title}</p>
              <p className="text-sm text-[var(--fg-secondary)] leading-relaxed line-clamp-2">{clause.summary}</p>

              {clause.riskReason && clause.riskLevel !== "low" && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  <span>{clause.riskReason}</span>
                </div>
              )}

              {expanded && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-1.5">Source text</p>
                  <p className="text-xs font-mono text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
                    {clause.rawText}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {clause.tags.map((t) => (
                  <span key={t} className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="ml-auto flex items-center gap-0.5 text-[10px] font-mono text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors"
                >
                  {expanded ? <><ChevronUp size={11} /> Hide text</> : <><ChevronDown size={11} /> Show clause text</>}
                </button>
              </div>
            </div>

            {/* Right meta column */}
            <div className="shrink-0 text-right space-y-2 min-w-[80px]">
              {clause.dueDate && (
                <div>
                  <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Due</p>
                  <p className={`text-xs font-mono font-semibold mt-0.5 ${isOverdue ? "text-red-500 dark:text-red-400" : isUrgent ? "text-amber-500 dark:text-amber-400" : "text-[var(--fg-secondary)]"}`}>
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
                  <p className="text-xs font-mono font-semibold text-[var(--fg-secondary)] mt-0.5">{clause.noticeDays}d</p>
                </div>
              )}
              {onAction && clause.status === "active" && (
                <button
                  onClick={() => onAction(clause.id, "actioned")}
                  className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors ml-auto mt-2"
                >
                  <CheckCircle2 size={12} />
                  Mark done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared content panel for review mode ─────────────────────────────────────

function MetaPanel({
  clause, days, isUrgent, isOverdue, favStyle, onAction,
}: {
  clause:    Clause;
  days:      number | null;
  isUrgent:  boolean;
  isOverdue: boolean;
  favStyle:  FavStyle | null;
  onAction?: (id: string, status: Clause["status"]) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
          {clauseTypeLabel(clause.type)}
        </span>
        <RiskBadge level={clause.riskLevel} />
        {favStyle && (
          <span
            className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
            style={{ color: favStyle.color, backgroundColor: favStyle.bg, borderColor: favStyle.border }}
          >
            <favStyle.Icon size={9} />
            {favStyle.label}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">{clause.title}</p>
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{clause.summary}</p>
      {clause.riskReason && clause.riskLevel !== "low" && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{clause.riskReason}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-3 text-xs font-mono">
        {clause.dueDate && (
          <span className={`font-semibold ${isOverdue ? "text-red-500" : isUrgent ? "text-amber-500" : "text-[var(--fg-secondary)]"}`}>
            Due: {isOverdue ? `${Math.abs(days!)}d late` : days === 0 ? "Today" : `${days}d`}
          </span>
        )}
        {clause.amount     && <span className="text-[var(--fg-secondary)]">Amount: {formatCurrency(clause.amount)}</span>}
        {clause.noticeDays && <span className="text-[var(--fg-secondary)]">Notice: {clause.noticeDays}d</span>}
      </div>
      {onAction && clause.status === "active" && (
        <button
          onClick={() => onAction(clause.id, "actioned")}
          className="mt-3 flex items-center gap-1 text-[10px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <CheckCircle2 size={12} />
          Mark done
        </button>
      )}
    </div>
  );
}
