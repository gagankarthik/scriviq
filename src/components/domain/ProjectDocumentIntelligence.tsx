"use client";

import { useState, type ReactNode } from "react";
import {
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Layers,
  GitMerge,
  Link2,
  MessageSquare,
  FileText,
  ArrowRight,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Shield,
  TrendingUp,
  TrendingDown,
  Network,
  FileCheck2,
  Minus,
} from "lucide-react";
import type {
  ProjectConsolidation,
  CrossDocConflict,
  ConsolidatedClause,
  DocTimelineEntry,
  DocType,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface Props {
  projectId: string;
  projectColor: string;
  initialConsolidation: ProjectConsolidation | null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const DOC_TYPE_META: Record<DocType, { label: string; color: string; bg: string; border: string }> = {
  base_sow:     { label: "Base SOW",     color: "#0072E5", bg: "rgba(0,114,229,0.1)",  border: "rgba(0,114,229,0.3)"  },
  amendment:    { label: "Amendment",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  change_order: { label: "Change Order", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" },
  informal:     { label: "Informal",     color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)"  },
  side_sow:     { label: "Side SOW",     color: "#14b8a6", bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.3)" },
};

const CONFLICT_TYPE_ICON: Record<CrossDocConflict["type"], ReactNode> = {
  contradiction:                <GitMerge size={14} />,
  scope_budget_mismatch:        <DollarSign size={14} />,
  timeline_resource_mismatch:   <Clock size={14} />,
  missing_approval:             <FileCheck2 size={14} />,
  overlap:                      <Layers size={14} />,
  external_reference:           <Link2 size={14} />,
  informal_change:              <MessageSquare size={14} />,
};

const SEVERITY_COLOR: Record<CrossDocConflict["severity"], string> = {
  critical: "#ef4444",
  warning:  "#f59e0b",
  info:     "#0072E5",
};

const SEVERITY_BG: Record<CrossDocConflict["severity"], string> = {
  critical: "rgba(239,68,68,0.08)",
  warning:  "rgba(245,158,11,0.08)",
  info:     "rgba(0,114,229,0.08)",
};

function DocTypeBadge({ docType, isInformal }: { docType: DocType; isInformal: boolean }) {
  const meta = DOC_TYPE_META[docType];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ color: meta.color, backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
      {isInformal && <AlertTriangle size={9} />}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: CrossDocConflict["severity"] }) {
  const color = SEVERITY_COLOR[severity];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {severity}
    </span>
  );
}

function StatBox({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: ReactNode;
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-3.5 border-l-[3px]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">{label}</p>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-lg font-bold font-mono text-[var(--fg-primary)] leading-none">{value}</p>
      {sub && <p className="text-[11px] text-[var(--fg-muted)] mt-1">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 animate-pulse">
      <div className="h-3 w-24 rounded bg-[var(--surface-subtle)] mb-3" />
      <div className="h-4 w-3/4 rounded bg-[var(--surface-subtle)] mb-2" />
      <div className="h-3 w-1/2 rounded bg-[var(--surface-subtle)]" />
    </div>
  );
}

const LOADING_MESSAGES = [
  "Parsing document timeline…",
  "Detecting conflicts…",
  "Comparing clause versions…",
  "Building consolidated view…",
  "Calculating budget delta…",
  "Generating master SOW…",
];

function TimelineNode({
  entry,
  index,
  isLast,
}: {
  entry: DocTimelineEntry;
  index: number;
  isLast: boolean;
}) {
  const meta = DOC_TYPE_META[entry.docType];
  const isInformalDoc = entry.isInformal;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2"
          style={{
            backgroundColor: isInformalDoc ? "rgba(239,68,68,0.12)" : meta.bg,
            borderColor: isInformalDoc ? "#ef4444" : meta.color,
            color: isInformalDoc ? "#ef4444" : meta.color,
          }}
        >
          v{index + 1}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ backgroundColor: "var(--border-color)", minHeight: 20 }} />
        )}
      </div>

      <div
        className="flex-1 mb-4 rounded-xl border p-3.5"
        style={{
          backgroundColor: isInformalDoc ? "rgba(239,68,68,0.04)" : "var(--surface-elevated)",
          borderColor: isInformalDoc ? "rgba(239,68,68,0.3)" : "var(--border-color)",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={12} className="text-[var(--fg-muted)] shrink-0" />
            <p className="text-sm font-semibold text-[var(--fg-primary)] truncate">{entry.title}</p>
          </div>
          <DocTypeBadge docType={entry.docType} isInformal={entry.isInformal} />
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[var(--fg-muted)] mb-2 flex-wrap">
          <span>{new Date(entry.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          {entry.contractValue != null && (
            <span className="font-mono">{formatCurrency(entry.contractValue)}</span>
          )}
          <span>{entry.clauseCount} clause{entry.clauseCount !== 1 ? "s" : ""}</span>
        </div>

        {entry.keyChanges.length > 0 && (
          <ul className="space-y-0.5">
            {entry.keyChanges.map((change, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-[var(--fg-secondary)]">
                <ArrowRight size={9} className="mt-0.5 shrink-0 text-[var(--fg-muted)]" />
                {change}
              </li>
            ))}
          </ul>
        )}

        {isInformalDoc && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#ef4444]">
            <AlertTriangle size={10} />
            <span>No formal amendment header detected — may not be legally binding</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ConflictCard({ conflict }: { conflict: CrossDocConflict }) {
  const color = SEVERITY_COLOR[conflict.severity];
  const bg = SEVERITY_BG[conflict.severity];

  return (
    <div
      className="rounded-xl border border-l-[3px] overflow-hidden"
      style={{ borderColor: "var(--border-color)", borderLeftColor: color, backgroundColor: bg }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{ color }}>{CONFLICT_TYPE_ICON[conflict.type]}</span>
            <p className="text-sm font-semibold text-[var(--fg-primary)]">{conflict.title}</p>
          </div>
          <SeverityBadge severity={conflict.severity} />
        </div>

        <p className="text-[12px] text-[var(--fg-secondary)] mb-3 leading-relaxed">{conflict.description}</p>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
            style={{ backgroundColor: "var(--surface-subtle)", color: "var(--fg-muted)", border: "1px solid var(--border-subtle)" }}
          >
            <FileText size={9} />
            {conflict.docATitle}
          </span>
          {conflict.docBTitle && (
            <>
              <ArrowRight size={10} className="text-[var(--fg-muted)]" />
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                style={{ backgroundColor: "var(--surface-subtle)", color: "var(--fg-muted)", border: "1px solid var(--border-subtle)" }}
              >
                <FileText size={9} />
                {conflict.docBTitle}
              </span>
            </>
          )}
        </div>

        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <p className="text-[11px] font-semibold text-[#10b981] mb-0.5 uppercase tracking-wide">Recommended Action</p>
          <p className="text-[12px] text-[var(--fg-secondary)]">{conflict.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function ClauseRow({ clause }: { clause: ConsolidatedClause }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--fg-primary)] truncate">{clause.clauseTitle}</p>
          <p className="text-[10px] text-[var(--fg-muted)] truncate">{clause.clauseType.replace(/_/g, " ")}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[var(--fg-muted)] hidden sm:block truncate max-w-[120px]">
            {clause.sourceDocTitle}
          </span>

          {clause.isOverridden ? (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              Updated
            </span>
          ) : (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ color: "#10b981", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              Original
            </span>
          )}

          {clause.isOverridden && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 rounded text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {expanded && clause.isOverridden && (
        <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#ef4444" }}>
              Original — {clause.originalDocTitle}
            </p>
            <p className="text-[11px] text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
              {clause.originalText ?? "—"}
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#10b981" }}>
              Current — {clause.sourceDocTitle}
            </p>
            <p className="text-[11px] text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
              {clause.currentText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectDocumentIntelligence({ projectId, projectColor, initialConsolidation }: Props) {
  const [consolidation, setConsolidation] = useState<ProjectConsolidation | null>(initialConsolidation);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [masterExpanded, setMasterExpanded] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);

    try {
      const res = await fetch(`/api/projects/${projectId}/consolidate`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "Analysis failed");
      }
      const data = await res.json() as { consolidation: ProjectConsolidation };
      setConsolidation(data.consolidation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Loader2 size={18} className="animate-spin" style={{ color: projectColor }} />
          <p className="text-sm font-semibold text-[var(--fg-primary)]">Analysing documents…</p>
          <p className="text-xs text-[var(--fg-muted)] ml-1">{LOADING_MESSAGES[loadingMsgIdx]}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // ── Pre-analysis CTA ──────────────────────────────────────────────────────

  if (!consolidation) {
    return (
      <div
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 text-center"
        style={{ borderTopColor: projectColor, borderTopWidth: 2 }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: `${projectColor}14`, border: `1px solid ${projectColor}30` }}
        >
          <Network size={24} style={{ color: projectColor }} />
        </div>

        <h2 className="text-lg font-bold text-[var(--fg-primary)] mb-2">Document Intelligence</h2>
        <p className="text-sm text-[var(--fg-muted)] mb-5 max-w-md mx-auto">
          Automatically detect issues across all SOW documents in this project.
        </p>

        <ul className="inline-flex flex-col gap-2 text-left mb-6">
          {[
            "Conflicting amendments and clause contradictions",
            "Scope increases without matching budget changes",
            "Timeline extensions without resource additions",
            "Informal changes that may not be legally binding",
            "Overlapping responsibilities across SOWs",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
              <CheckCircle2 size={13} style={{ color: projectColor }} className="shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <div
            className="mb-4 px-4 py-2.5 rounded-xl text-sm text-[#ef4444] flex items-center gap-2 max-w-sm mx-auto"
            style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <XCircle size={14} />
            {error}
          </div>
        )}

        <button
          onClick={runAnalysis}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: projectColor }}
        >
          <GitBranch size={15} />
          Analyse Documents
        </button>
      </div>
    );
  }

  // ── Single-document empty state ───────────────────────────────────────────

  if (consolidation.docCount <= 1) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6 text-center">
        <Layers size={20} className="mx-auto mb-3 text-[var(--fg-muted)]" />
        <p className="text-sm font-semibold text-[var(--fg-primary)] mb-1">
          Add more SOWs or amendments to this project to enable cross-document intelligence.
        </p>
        <p className="text-xs text-[var(--fg-muted)]">
          Upload at least two documents to detect conflicts, track value changes, and build a consolidated master view.
        </p>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────

  const valueDeltaPositive = (consolidation.valueDelta ?? 0) >= 0;
  const timelineDeltaPositive = (consolidation.timelineDeltaDays ?? 0) >= 0;
  const hasCritical = consolidation.criticalConflictCount > 0;
  const hasInformal = consolidation.informalChangeCount > 0;

  return (
    <div className="space-y-5">

      {/* ── Intelligence Summary Bar ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Network size={15} style={{ color: projectColor }} />
            <h2 className="text-sm font-bold text-[var(--fg-primary)]">Document Intelligence</h2>
            <span className="text-[10px] text-[var(--fg-muted)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
              {consolidation.docCount} docs · analysed {new Date(consolidation.analysedAt).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={runAnalysis}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-secondary)] border border-[var(--border-color)] bg-[var(--surface-subtle)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <RefreshCw size={11} />
            Re-analyse
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <StatBox
            label="Contract Value"
            value={consolidation.currentValue != null ? formatCurrency(consolidation.currentValue) : "—"}
            sub={
              consolidation.valueDelta != null
                ? `${valueDeltaPositive ? "+" : ""}${formatCurrency(consolidation.valueDelta)} from original`
                : undefined
            }
            color={consolidation.valueDelta == null ? "var(--fg-muted)" : valueDeltaPositive ? "#10b981" : "#ef4444"}
            icon={
              consolidation.valueDelta == null ? <Minus size={13} /> :
              valueDeltaPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />
            }
          />
          <StatBox
            label="Timeline Delta"
            value={
              consolidation.timelineDeltaDays != null
                ? `${timelineDeltaPositive ? "+" : ""}${consolidation.timelineDeltaDays}d`
                : "—"
            }
            sub={
              consolidation.currentEndDate
                ? `Ends ${new Date(consolidation.currentEndDate).toLocaleDateString()}`
                : undefined
            }
            color={consolidation.timelineDeltaDays == null ? "var(--fg-muted)" : timelineDeltaPositive ? "#f59e0b" : "#10b981"}
            icon={<Clock size={13} />}
          />
          <StatBox
            label="Conflicts"
            value={String(consolidation.conflictCount)}
            sub={hasCritical ? `${consolidation.criticalConflictCount} critical` : "No critical issues"}
            color={hasCritical ? "#ef4444" : consolidation.conflictCount > 0 ? "#f59e0b" : "#10b981"}
            icon={hasCritical ? <XCircle size={13} /> : consolidation.conflictCount > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
          />
          <StatBox
            label="Informal Changes"
            value={String(consolidation.informalChangeCount)}
            sub={hasInformal ? "Review for legal validity" : "All changes formal"}
            color={hasInformal ? "#f59e0b" : "#10b981"}
            icon={<Shield size={13} />}
          />
        </div>
      </div>

      {/* ── Document Timeline ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={14} style={{ color: projectColor }} />
          <h3 className="text-sm font-bold text-[var(--fg-primary)]">Document Timeline</h3>
          <span className="text-[10px] text-[var(--fg-muted)] ml-1">{consolidation.timeline.length} document{consolidation.timeline.length !== 1 ? "s" : ""} in chronological order</span>
        </div>

        <div className="pl-1">
          {consolidation.timeline.map((entry, i) => (
            <TimelineNode
              key={entry.contractId}
              entry={entry}
              index={i}
              isLast={i === consolidation.timeline.length - 1}
            />
          ))}
        </div>
      </div>

      {/* ── Conflicts Panel ───────────────────────────────────────────────── */}
      {consolidation.conflicts.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} style={{ color: hasCritical ? "#ef4444" : "#f59e0b" }} />
            <h3 className="text-sm font-bold text-[var(--fg-primary)]">Conflicts & Issues</h3>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: hasCritical ? "#ef4444" : "#f59e0b",
                backgroundColor: hasCritical ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${hasCritical ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              {consolidation.conflicts.length} found
            </span>
          </div>

          <div className="space-y-3">
            {[...consolidation.conflicts]
              .sort((a, b) => {
                const order = { critical: 0, warning: 1, info: 2 };
                return order[a.severity] - order[b.severity];
              })
              .map((conflict) => (
                <ConflictCard key={conflict.id} conflict={conflict} />
              ))}
          </div>
        </div>
      )}

      {/* ── Consolidated Master SOW ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
        <button
          onClick={() => setMasterExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--surface-subtle)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <GitBranch size={14} style={{ color: projectColor }} />
            <h3 className="text-sm font-bold text-[var(--fg-primary)]">Master Consolidated SOW</h3>
            <span className="text-[10px] text-[var(--fg-muted)]">Current source of truth</span>
          </div>
          {masterExpanded ? (
            <ChevronUp size={15} className="text-[var(--fg-muted)]" />
          ) : (
            <ChevronDown size={15} className="text-[var(--fg-muted)]" />
          )}
        </button>

        {masterExpanded && (
          <div className="px-5 pb-5 border-t border-[var(--border-subtle)]">
            {/* Executive summary */}
            {consolidation.executiveSummary && (
              <div
                className="mt-4 mb-4 px-4 py-3 rounded-xl"
                style={{ backgroundColor: `${projectColor}0d`, border: `1px solid ${projectColor}25` }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: projectColor }}>
                  Executive Summary
                </p>
                <p className="text-[13px] text-[var(--fg-secondary)] leading-relaxed">
                  {consolidation.executiveSummary}
                </p>
              </div>
            )}

            {/* Master SOW text */}
            {consolidation.masterSowText && (
              <div
                className="mb-5 px-4 py-4 rounded-xl"
                style={{ backgroundColor: "var(--surface-subtle)", border: "1px solid var(--border-subtle)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--fg-muted)] mb-2">
                  Consolidated Scope
                </p>
                <p className="text-[12px] text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
                  {consolidation.masterSowText}
                </p>
              </div>
            )}

            {/* Consolidated clauses */}
            {consolidation.consolidatedClauses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={13} className="text-[var(--fg-muted)]" />
                  <p className="text-xs font-bold text-[var(--fg-primary)]">Authoritative Clause State</p>
                  <span className="text-[10px] text-[var(--fg-muted)]">{consolidation.consolidatedClauses.length} clauses</span>
                </div>

                <div
                  className="rounded-xl overflow-hidden border border-[var(--border-color)]"
                >
                  <div
                    className="grid grid-cols-3 px-4 py-2 border-b border-[var(--border-subtle)]"
                    style={{ backgroundColor: "var(--surface-subtle)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--fg-muted)]">Clause</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--fg-muted)] hidden sm:block">Current Source</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--fg-muted)]">Status</p>
                  </div>
                  {consolidation.consolidatedClauses.map((clause, i) => (
                    <ClauseRow key={i} clause={clause} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
