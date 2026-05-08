"use client";

import { useMemo, useState } from "react";
import {
  GitBranch, ChevronDown, ChevronUp, ArrowRight,
  PlusCircle, MinusCircle, RotateCcw, Clock,
} from "lucide-react";
import type { ClauseAmendmentEntry } from "@/lib/mock-data";

// ── Word-level diff (LCS) ─────────────────────────────────────────────────────

type DiffOp = { text: string; type: "same" | "add" | "del" };

function computeWordDiff(a: string, b: string): DiffOp[] {
  if (!a && !b) return [];
  if (!a) return [{ text: b, type: "add" }];
  if (!b) return [{ text: a, type: "del" }];
  if (a.length > 6000 || b.length > 6000) return [{ text: a, type: "del" }, { text: b, type: "add" }];
  const aw = a.split(/(\s+)/);
  const bw = b.split(/(\s+)/);
  const am = aw.slice(0, 500), bm = bw.slice(0, 500);
  const m = am.length, n = bm.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = am[i-1] === bm[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && am[i-1] === bm[j-1]) { ops.unshift({ text: am[i-1], type: "same" }); i--; j--; }
    else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) { ops.unshift({ text: bm[j-1], type: "add" }); j--; }
    else { ops.unshift({ text: am[i-1], type: "del" }); i--; }
  }
  return ops;
}

function InlineDiff({ ops }: { ops: DiffOp[] }) {
  return (
    <p className="text-[11.5px] font-mono leading-[1.65] whitespace-pre-wrap">
      {ops.map((t, i) =>
        t.type === "same" ? (
          <span key={i} className="text-[var(--fg-secondary)]">{t.text}</span>
        ) : t.type === "add" ? (
          <mark key={i} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-sm not-italic">{t.text}</mark>
        ) : (
          <mark key={i} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-sm not-italic line-through opacity-80">{t.text}</mark>
        )
      )}
    </p>
  );
}

const CHANGE_META = {
  added:    { label: "Added",    color: "#10b981", Icon: PlusCircle  },
  modified: { label: "Modified", color: "#f59e0b", Icon: RotateCcw   },
  removed:  { label: "Removed",  color: "#ef4444", Icon: MinusCircle },
} as const;

// ── Amendment history viewer ──────────────────────────────────────────────────

export function ClauseAmendmentHistory({
  history, originalText, currentText,
}: {
  history:      ClauseAmendmentEntry[];
  originalText: string;
  currentText:  string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(history.length); // default: original→current

  if (!history.length) return null;

  // Selectable timeline: 0 = original, 1..N = state after each amendment
  const timeline = useMemo(() => {
    const points = [{
      label: "Original",
      version: null as number | null,
      text: originalText,
      meta: null as ClauseAmendmentEntry | null,
    }];
    for (const h of history) {
      points.push({
        label: `v${h.amendmentVersion}`,
        version: h.amendmentVersion,
        text: h.changeType === "removed" ? "" : (h.newText ?? ""),
        meta: h,
      });
    }
    return points;
  }, [history, originalText]);

  // Comparison: against original (idx 0) vs the selected point
  const selected = timeline[Math.min(activeIdx, timeline.length - 1)] ?? timeline[timeline.length - 1];
  const compareDiff = useMemo(
    () => computeWordDiff(originalText, selected.text),
    [originalText, selected.text]
  );

  const lastEntry = history[history.length - 1];
  const lastMeta  = CHANGE_META[lastEntry.changeType];

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)]/50 overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors text-left"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${lastMeta.color}1f`, color: lastMeta.color }}
        >
          <GitBranch size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-[var(--fg-primary)]">
              Amended {history.length} time{history.length !== 1 ? "s" : ""}
            </p>
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={{
                color: lastMeta.color,
                backgroundColor: `${lastMeta.color}10`,
                borderColor: `${lastMeta.color}40`,
              }}
            >
              <lastMeta.Icon size={9} />latest: {lastMeta.label}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[var(--fg-muted)]">
              <Clock size={9} />
              {new Date(lastEntry.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
            Last change by amendment v{lastEntry.amendmentVersion} — {lastEntry.amendmentTitle}
          </p>
        </div>
        {expanded ? <ChevronUp size={13} className="text-[var(--fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--fg-muted)]" />}
      </button>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)]">
          {/* Version timeline selector */}
          <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto">
            {timeline.map((p, i) => {
              const active = i === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest transition-colors shrink-0"
                  style={
                    active
                      ? { backgroundColor: "rgba(41,98,255,0.16)", color: "var(--color-brand-light)", border: "1px solid rgba(41,98,255,0.4)" }
                      : { color: "var(--fg-muted)", border: "1px solid var(--border-color)" }
                  }
                >
                  {p.label}
                  {p.meta && (
                    <span className="text-[9px] opacity-70 normal-case tracking-normal">
                      · {new Date(p.meta.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Diff: original vs selected */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--fg-muted)]">
              <span>Original</span>
              <ArrowRight size={9} />
              <span style={{ color: "var(--color-brand-light)" }}>{selected.label}</span>
              {selected.meta && (
                <span className="ml-auto normal-case tracking-normal text-[var(--fg-muted)]">
                  by {selected.meta.appliedBy ?? "system"}
                </span>
              )}
            </div>

            <div className="rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] p-3 max-h-72 overflow-y-auto">
              {compareDiff.length > 0
                ? <InlineDiff ops={compareDiff} />
                : <p className="text-xs text-[var(--fg-muted)] italic">No content at this point.</p>
              }
            </div>

            {selected.meta?.riskReason && (
              <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/40 dark:border-amber-900/20 rounded-lg px-3 py-2">
                <span className="font-semibold">Why this changed:</span> {selected.meta.riskReason}
              </div>
            )}
          </div>

          {/* Full history list (compact) */}
          <div className="px-4 pb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-2">
              Change history
            </p>
            <ol className="space-y-1.5">
              {history.map((h, i) => {
                const meta = CHANGE_META[h.changeType];
                return (
                  <li key={i} className="flex items-start gap-2.5 text-[11px]">
                    <span className="font-mono text-[var(--fg-muted)] tnum w-6 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <meta.Icon size={11} className="shrink-0 mt-0.5" style={{ color: meta.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--fg-secondary)]">
                        <span className="font-semibold text-[var(--fg-primary)]">v{h.amendmentVersion}</span>{" "}
                        — {h.amendmentTitle}{" "}
                        <span className="text-[var(--fg-muted)]">
                          · {new Date(h.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {h.appliedBy && ` · ${h.appliedBy}`}
                        </span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[10px] font-mono text-[var(--fg-muted)] italic">
              Current text shown in the clause is the result of all accepted changes.
              {currentText !== originalText && " Original is preserved here for audit."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
