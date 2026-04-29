"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileDiff, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, PlusCircle, MinusCircle, RotateCcw,
  GitMerge, CornerDownRight,
} from "lucide-react";
import type { Amendment, ClauseChange, ClauseChangeType, ClauseChangeStatus } from "@/lib/mock-data";
import { RiskBadge } from "./RiskBadge";

// ── Word-level diff ───────────────────────────────────────────────────────────

type DiffOp = { text: string; type: "same" | "add" | "del" };

function computeWordDiff(a: string, b: string): DiffOp[] {
  if (a.length > 6000 || b.length > 6000) {
    return [{ text: a, type: "del" }, { text: b, type: "add" }];
  }
  const aw = a.split(/(\s+)/);
  const bw = b.split(/(\s+)/);
  const MAX = 500;
  const am = aw.slice(0, MAX);
  const bm = bw.slice(0, MAX);
  const m = am.length, n = bm.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = am[i - 1] === bm[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const ops: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && am[i - 1] === bm[j - 1]) {
      ops.unshift({ text: am[i - 1], type: "same" }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ text: bm[j - 1], type: "add" }); j--;
    } else {
      ops.unshift({ text: am[i - 1], type: "del" }); i--;
    }
  }
  return ops;
}

// ── Diff pane views ───────────────────────────────────────────────────────────

function DiffPane({
  ops, side,
}: {
  ops: DiffOp[];
  side: "original" | "revised";
}) {
  const tokens = side === "original"
    ? ops.filter((t) => t.type !== "add")
    : ops.filter((t) => t.type !== "del");

  return (
    <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
      {tokens.map((t, i) =>
        t.type === "same" ? (
          <span key={i} className="text-[var(--fg-secondary)]">{t.text}</span>
        ) : side === "original" ? (
          <mark key={i} className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-sm not-italic">{t.text}</mark>
        ) : (
          <mark key={i} className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-sm not-italic">{t.text}</mark>
        )
      )}
    </p>
  );
}

// ── Change type metadata ──────────────────────────────────────────────────────

const CHANGE_META: Record<ClauseChangeType, {
  label: string; color: string; bg: string; border: string; Icon: React.ElementType;
}> = {
  added:    { label: "Added",    color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)", Icon: PlusCircle  },
  modified: { label: "Modified", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)", Icon: RotateCcw   },
  removed:  { label: "Removed",  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",  Icon: MinusCircle },
};

// ── Single change card ────────────────────────────────────────────────────────

function ChangeCard({
  change,
  localStatus,
  onAccept,
  onReject,
  onUndo,
  disabled,
}: {
  change:      ClauseChange;
  localStatus: ClauseChangeStatus;
  onAccept:    () => void;
  onReject:    () => void;
  onUndo:      () => void;
  disabled:    boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const { label, color, bg, border, Icon } = CHANGE_META[change.changeType];

  const ops = useMemo(() => {
    if (change.changeType === "modified" && change.originalText && change.newText)
      return computeWordDiff(change.originalText, change.newText);
    return null;
  }, [change.changeType, change.originalText, change.newText]);

  const isReviewed = localStatus !== "pending";

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors duration-150"
      style={{ borderColor: isReviewed ? "var(--border-subtle)" : border }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: isReviewed ? undefined : bg }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0"
          style={{ color, backgroundColor: bg, borderColor: border }}
        >
          <Icon size={9} />
          {label}
        </span>
        <p className="flex-1 text-sm font-medium text-[var(--fg-primary)] truncate">{change.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge level={change.riskLevel} />
          {localStatus === "accepted" && <CheckCircle2 size={14} className="text-emerald-500" />}
          {localStatus === "rejected" && <XCircle       size={14} className="text-red-400"     />}
          {localStatus === "pending"  && <Clock         size={14} className="text-[var(--fg-muted)]" />}
          {expanded ? <ChevronUp size={13} className="text-[var(--fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--fg-muted)]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)]">
          {/* Risk reason banner */}
          {change.riskReason && (
            <div className="px-4 py-2.5 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/15 border-b border-amber-200 dark:border-amber-900/20">
              <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-300">{change.riskReason}</span>
            </div>
          )}

          {/* Diff view */}
          <div className="p-4">
            {change.changeType === "modified" && ops ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-1.5">
                    Original
                  </p>
                  <div className="rounded-lg bg-red-50/60 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 p-3 max-h-44 overflow-y-auto">
                    <DiffPane ops={ops} side="original" />
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-1.5">
                    Revised <span className="text-[var(--fg-muted)] normal-case tracking-normal">(amendment)</span>
                  </p>
                  <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 p-3 max-h-44 overflow-y-auto">
                    <DiffPane ops={ops} side="revised" />
                  </div>
                </div>
              </div>
            ) : change.changeType === "added" && change.newText ? (
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-1.5">New clause text</p>
                <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 p-3 max-h-44 overflow-y-auto">
                  <p className="text-xs font-mono text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">{change.newText}</p>
                </div>
              </div>
            ) : change.changeType === "removed" && change.originalText ? (
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-1.5">Clause being removed</p>
                <div className="rounded-lg bg-red-50/60 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 p-3 max-h-44 overflow-y-auto">
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 leading-relaxed whitespace-pre-wrap line-through opacity-70">{change.originalText}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action row */}
          <div className="px-4 pb-4 flex items-center gap-2">
            {localStatus === "pending" ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onAccept(); }}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50"
                >
                  <CheckCircle2 size={12} />
                  Accept change
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReject(); }}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 transition-all disabled:opacity-50"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  {localStatus === "accepted"
                    ? <><CheckCircle2 size={12} className="text-emerald-500" /><span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Accepted</span></>
                    : <><XCircle       size={12} className="text-red-400"     /><span className="text-xs text-[var(--fg-muted)]">Rejected — original kept</span></>
                  }
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onUndo(); }}
                  disabled={disabled}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors disabled:opacity-50"
                >
                  <CornerDownRight size={10} />
                  Undo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Upload form ───────────────────────────────────────────────────────────────

function UploadAmendmentForm({
  contractId,
  onUploaded,
  onCancel,
}: {
  contractId: string;
  onUploaded: (amendment: Amendment) => void;
  onCancel:   () => void;
}) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [text,        setText]        = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/amendments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, description, text }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const { amendment } = await res.json() as { amendment: Amendment };
      onUploaded(amendment);
    } catch {
      setError("Failed to process amendment — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <FileDiff size={14} className="text-[#0072E5]" />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Upload contract amendment</h3>
      </div>
      <p className="text-xs text-[var(--fg-muted)] -mt-2">
        Paste the amendment document text. The AI will identify every changed, added, or removed clause.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1">
            Amendment title <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. SOW Amendment #1 — Scope Expansion"
            required
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1">
            Brief description <span className="text-[var(--fg-muted)] font-normal normal-case">(optional)</span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Client requested additional UX research phase"
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1">
            Amendment document text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            required
            placeholder="Paste the full amendment text here…"
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm font-mono text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30 transition-all resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || !title.trim() || !text.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#0072E5" }}
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {loading ? "Analysing changes…" : "Analyse changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Amendment card ────────────────────────────────────────────────────────────

function AmendmentCard({
  amendment,
  contractId,
  onResolved,
}: {
  amendment:  Amendment;
  contractId: string;
  onResolved: (resolved: Amendment) => void;
}) {
  const router = useRouter();
  const [changeStatuses, setChangeStatuses] = useState<Record<string, ClauseChangeStatus>>({});
  const [resolving,      setResolving]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [expanded,       setExpanded]       = useState(amendment.status === "pending_review");

  function getStatus(changeId: string): ClauseChangeStatus {
    return changeStatuses[changeId] ?? "pending";
  }

  const allReviewed = amendment.changes.every((c) => getStatus(c.id) !== "pending");
  const pendingCount = amendment.changes.filter((c) => getStatus(c.id) === "pending").length;

  async function handleResolve() {
    setResolving(true);
    setError(null);
    try {
      const payload = amendment.changes.map((c) => ({ id: c.id, status: getStatus(c.id) }));
      const res = await fetch(
        `/api/contracts/${contractId}/amendments/${amendment.id}`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ changes: payload }),
        }
      );
      if (!res.ok) throw new Error();
      const { amendment: resolved } = await res.json() as { amendment: Amendment };
      onResolved(resolved);
      router.refresh();
    } catch {
      setError("Failed to apply changes — please try again.");
    } finally {
      setResolving(false);
    }
  }

  const isResolved   = amendment.status === "resolved";
  const acceptedCount = isResolved
    ? amendment.changes.filter((c) => c.status === "accepted").length
    : amendment.changes.filter((c) => getStatus(c.id) === "accepted").length;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={
                isResolved
                  ? { color: "#10b981", backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)" }
                  : { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
              }
            >
              {isResolved ? "Resolved" : "Pending review"}
            </span>
            <h4 className="text-sm font-semibold text-[var(--fg-primary)]">{amendment.title}</h4>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[var(--fg-muted)] font-mono">
              {new Date(amendment.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-xs text-[var(--fg-muted)]">
              {amendment.changes.length} change{amendment.changes.length !== 1 ? "s" : ""}
              {isResolved && ` · ${acceptedCount} accepted`}
              {!isResolved && pendingCount > 0 && ` · ${pendingCount} pending`}
            </span>
          </div>
          {amendment.description && (
            <p className="text-xs text-[var(--fg-secondary)] mt-1 line-clamp-1">{amendment.description}</p>
          )}
        </div>
        <div className="shrink-0">
          {expanded ? <ChevronUp size={15} className="text-[var(--fg-muted)]" /> : <ChevronDown size={15} className="text-[var(--fg-muted)]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)] p-5 space-y-3">
          {amendment.changes.map((change) => (
            <ChangeCard
              key={change.id}
              change={change}
              localStatus={isResolved ? change.status : getStatus(change.id)}
              onAccept={() => setChangeStatuses((p) => ({ ...p, [change.id]: "accepted" }))}
              onReject={() => setChangeStatuses((p) => ({ ...p, [change.id]: "rejected" }))}
              onUndo={()   => setChangeStatuses((p) => { const n = { ...p }; delete n[change.id]; return n; })}
              disabled={isResolved || resolving}
            />
          ))}

          {/* Resolve footer */}
          {!isResolved && (
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs text-[var(--fg-muted)]">
                {allReviewed
                  ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">All changes reviewed — ready to apply.</span>
                  : <span>{pendingCount} change{pendingCount !== 1 ? "s" : ""} still need review.</span>
                }
              </div>
              <button
                onClick={handleResolve}
                disabled={!allReviewed || resolving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#0072E5" }}
              >
                {resolving && <Loader2 size={13} className="animate-spin" />}
                <GitMerge size={13} />
                {resolving ? "Applying…" : "Apply accepted changes"}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

interface AmendmentPanelProps {
  contractId:         string;
  initialAmendments:  Amendment[];
}

export function AmendmentPanel({ contractId, initialAmendments }: AmendmentPanelProps) {
  const [amendments, setAmendments] = useState(initialAmendments);
  const [showUpload, setShowUpload] = useState(false);

  const pendingCount = amendments.filter((a) => a.status === "pending_review").length;

  function handleUploaded(amendment: Amendment) {
    setAmendments((prev) => [amendment, ...prev]);
    setShowUpload(false);
  }

  function handleResolved(resolved: Amendment) {
    setAmendments((prev) => prev.map((a) => a.id === resolved.id ? resolved : a));
  }

  return (
    <div id="amendments" className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileDiff size={14} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">
            Contract Amendments
            {amendments.length > 0 && (
              <span className="ml-2 text-[var(--fg-muted)] font-normal font-mono">
                ({amendments.length})
              </span>
            )}
          </h2>
          {pendingCount > 0 && (
            <span
              className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={{ color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--fg-secondary)] hover:text-[#0072E5] hover:border-[rgba(0,114,229,0.35)] transition-all"
          >
            <Plus size={12} />
            Upload amendment
          </button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <UploadAmendmentForm
          contractId={contractId}
          onUploaded={handleUploaded}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Amendment list */}
      {amendments.map((amendment) => (
        <AmendmentCard
          key={amendment.id}
          amendment={amendment}
          contractId={contractId}
          onResolved={handleResolved}
        />
      ))}

      {/* Empty state */}
      {amendments.length === 0 && !showUpload && (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-subtle)] p-10 text-center">
          <FileDiff size={28} className="mx-auto mb-3 text-[var(--fg-muted)]" />
          <p className="text-sm font-medium text-[var(--fg-secondary)] mb-1">No amendments yet</p>
          <p className="text-xs text-[var(--fg-muted)] mb-4">
            When a client sends a revised SOW or change order, upload it here to see exactly what changed.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ backgroundColor: "#0072E5" }}
          >
            <Plus size={12} />
            Upload first amendment
          </button>
        </div>
      )}
    </div>
  );
}
