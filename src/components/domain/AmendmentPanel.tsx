"use client";

import { useState, useMemo, useRef, useEffect, type DragEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileDiff, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, PlusCircle, MinusCircle, RotateCcw,
  GitMerge, CornerDownRight, Upload, FileText,
  Type, X, TrendingUp, TrendingDown,
  ShieldAlert, GitBranch, Layers,
} from "lucide-react";
import type {
  Amendment, AmendmentConflict, ClauseChange, ClauseChangeType, ClauseChangeStatus,
} from "@/lib/mock-data";
import { withDerivedVersions, detectAmendmentConflicts } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";

// ── Word-level diff ───────────────────────────────────────────────────────────

type DiffOp = { text: string; type: "same" | "add" | "del" };

function computeWordDiff(a: string, b: string): DiffOp[] {
  if (a.length > 6000 || b.length > 6000)
    return [{ text: a, type: "del" }, { text: b, type: "add" }];
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

function DiffPane({ ops, side }: { ops: DiffOp[]; side: "original" | "revised" }) {
  const tokens = side === "original" ? ops.filter((t) => t.type !== "add") : ops.filter((t) => t.type !== "del");
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

const CHANGE_META: Record<ClauseChangeType, { label: string; color: string; bg: string; border: string; Icon: React.ElementType }> = {
  added:    { label: "Added",    color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)", Icon: PlusCircle  },
  modified: { label: "Modified", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)", Icon: RotateCcw   },
  removed:  { label: "Removed",  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",  Icon: MinusCircle },
};

// ── Change card ───────────────────────────────────────────────────────────────

function ChangeCard({
  change, localStatus, onAccept, onReject, onUndo, disabled, conflict,
}: {
  change: ClauseChange; localStatus: ClauseChangeStatus;
  onAccept: () => void; onReject: () => void; onUndo: () => void; disabled: boolean;
  conflict?: AmendmentConflict;
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
      className="rounded-xl border overflow-hidden transition-colors"
      style={{
        borderColor: conflict
          ? (conflict.severity === "error" ? "rgba(239,68,68,0.45)" : "rgba(245,158,11,0.45)")
          : (isReviewed ? "var(--border-subtle)" : border),
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: isReviewed ? undefined : bg }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0"
          style={{ color, backgroundColor: bg, borderColor: border }}>
          <Icon size={9} />{label}
        </span>
        <p className="flex-1 text-sm font-medium text-[var(--fg-primary)] truncate">{change.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          {conflict && (
            <span
              className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={
                conflict.severity === "error"
                  ? { color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }
                  : { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
              }
              title={conflict.description}
            >
              <ShieldAlert size={9} />Conflict
            </span>
          )}
          <RiskBadge level={change.riskLevel} />
          {localStatus === "accepted" && <CheckCircle2 size={14} className="text-emerald-500" />}
          {localStatus === "rejected" && <XCircle size={14} className="text-red-400" />}
          {localStatus === "pending"  && <Clock size={14} className="text-[var(--fg-muted)]" />}
          {expanded ? <ChevronUp size={13} className="text-[var(--fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--fg-muted)]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)]">
          {conflict && (
            <div
              className="px-4 py-2.5 flex items-start gap-2 border-b"
              style={
                conflict.severity === "error"
                  ? { backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }
                  : { backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
              }
            >
              <ShieldAlert size={11} className="mt-0.5 shrink-0" style={{ color: conflict.severity === "error" ? "#ef4444" : "#f59e0b" }} />
              <span className="text-xs" style={{ color: conflict.severity === "error" ? "#dc2626" : "#b45309" }}>
                {conflict.description}
              </span>
            </div>
          )}
          {change.riskReason && (
            <div className="px-4 py-2.5 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/15 border-b border-amber-200 dark:border-amber-900/20">
              <AlertTriangle size={11} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-300">{change.riskReason}</span>
            </div>
          )}
          <div className="p-4">
            {change.changeType === "modified" && ops ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-1.5">Original</p>
                  <div className="rounded-lg bg-red-50/60 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 p-3 max-h-44 overflow-y-auto">
                    <DiffPane ops={ops} side="original" />
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--fg-muted)] mb-1.5">Revised <span className="normal-case tracking-normal text-[var(--fg-muted)]">(amendment)</span></p>
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
          <div className="px-4 pb-4 flex items-center gap-2">
            {localStatus === "pending" ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onAccept(); }} disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50">
                  <CheckCircle2 size={12} />Accept change
                </button>
                <button onClick={(e) => { e.stopPropagation(); onReject(); }} disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 transition-all disabled:opacity-50">
                  <XCircle size={12} />Reject
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  {localStatus === "accepted"
                    ? <><CheckCircle2 size={12} className="text-emerald-500" /><span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Accepted</span></>
                    : <><XCircle size={12} className="text-red-400" /><span className="text-xs text-[var(--fg-muted)]">Rejected — original kept</span></>
                  }
                </div>
                <button onClick={(e) => { e.stopPropagation(); onUndo(); }} disabled={disabled}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors disabled:opacity-50">
                  <CornerDownRight size={10} />Undo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Upload form — supports both text paste and file upload ────────────────────

type InputMode = "file" | "text";

function UploadAmendmentForm({
  contractId, onUploaded, onCancel, nextVersion,
}: {
  contractId: string;
  onUploaded: (a: Amendment) => void;
  onCancel:   () => void;
  nextVersion: number;
}) {
  const [mode,        setMode]        = useState<InputMode>("file");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [text,        setText]        = useState("");
  const [file,        setFile]        = useState<File | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [loadingMsg,  setLoadingMsg]  = useState("");
  const [error,       setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.name.match(/\.(pdf|docx|txt)$/i)) {
      setError("Only PDF, DOCX, or TXT files are supported for amendment upload.");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError("File must be under 15 MB.");
      return;
    }
    setFile(f);
    setError(null);
    if (!title) setTitle(f.name.replace(/\.(pdf|docx|txt)$/i, "").replace(/[-_]/g, " "));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  const canSubmit = !!title.trim() && (mode === "file" ? !!file : !!text.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      let res: Response;
      if (mode === "file" && file) {
        setLoadingMsg("Extracting text from document…");
        await new Promise((r) => setTimeout(r, 400));
        setLoadingMsg("Comparing with original contract…");

        const fd = new FormData();
        fd.append("title",       title.trim());
        fd.append("description", description.trim());
        fd.append("file",        file);
        res = await fetch(`/api/contracts/${contractId}/amendments`, {
          method: "POST",
          body:   fd,
        });
      } else {
        setLoadingMsg("Comparing with original contract…");
        res = await fetch(`/api/contracts/${contractId}/amendments`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ title, description, text }),
        });
      }

      setLoadingMsg("Identifying clause changes…");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Upload failed");
      }
      const { amendment } = await res.json() as { amendment: Amendment };
      onUploaded(amendment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process amendment — please try again.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  const inputCls = "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30 transition-all";
  const labelCls = "text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <FileDiff size={14} style={{ color: "#0072E5" }} />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Upload contract amendment</h3>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
          style={{ color: "#0072E5", backgroundColor: "rgba(0,114,229,0.08)", borderColor: "rgba(0,114,229,0.25)" }}>
          <GitBranch size={9} />Will be v{nextVersion}
        </span>
      </div>
      <p className="text-xs text-[var(--fg-muted)] -mt-2">
        Upload a PDF/DOCX file or paste the text — the AI compares it against the latest accepted contract state and flags every changed, added, or removed clause.
      </p>

      {/* Input mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] w-fit">
        {([
          { id: "file" as InputMode, label: "Upload File", Icon: Upload },
          { id: "text" as InputMode, label: "Paste Text",  Icon: Type   },
        ]).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={
              mode === id
                ? { backgroundColor: "#0072E5", color: "#fff" }
                : { color: "var(--fg-muted)" }
            }
          >
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* Title + description */}
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Amendment title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder={`e.g. SOW Amendment #${nextVersion - 1} — Scope Expansion`} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Brief description <span className="font-normal normal-case text-[var(--fg-muted)]">(optional)</span></label>
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Client requested additional UX research phase" className={inputCls} />
        </div>
      </div>

      {/* File upload mode */}
      {mode === "file" && (
        <div>
          <label className={labelCls}>Amendment document <span className="text-red-500">*</span></label>
          <div
            className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
              dragging ? "border-[#0072E5] bg-[rgba(0,114,229,0.06)]"
              : file ? "border-emerald-400 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-950/10"
              : "border-[var(--border-color)] hover:border-[rgba(0,114,229,0.4)] bg-[var(--surface-subtle)]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {file ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <FileText size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--fg-primary)] truncate">{file.name}</p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    {(file.size / 1024).toFixed(0)} KB · {file.name.split(".").pop()?.toUpperCase()}
                  </p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors shrink-0">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Upload size={20} className="text-[var(--fg-muted)] mb-2" />
                <p className="text-sm text-[var(--fg-secondary)] mb-1">Drop amendment file here or <span style={{ color: "#0072E5" }}>browse</span></p>
                <p className="text-xs text-[var(--fg-muted)]">PDF, DOCX, or TXT — up to 15 MB</p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <AlertTriangle size={11} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-[var(--fg-muted)] leading-relaxed">
                Text is extracted server-side and sent to GPT-4o-mini alongside the original contract clauses for a precise, verbatim comparison.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paste text mode */}
      {mode === "text" && (
        <div>
          <label className={labelCls}>Amendment document text <span className="text-red-500">*</span></label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            required
            placeholder="Paste the full amendment text here…"
            className={`${inputCls} font-mono resize-none`}
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30">
          <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && loadingMsg && (
        <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
          <Loader2 size={12} className="animate-spin shrink-0" />
          {loadingMsg}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#0072E5" }}
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          {loading ? "Analysing changes…" : "Analyse changes"}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}
          className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Stacked version timeline (vertical) ───────────────────────────────────────

function StackedTimeline({
  amendments, conflicts, currentVersion, onSelectVersion,
}: {
  amendments: Amendment[];
  conflicts: AmendmentConflict[];
  currentVersion: number;
  onSelectVersion: (v: number) => void;
}) {
  const conflictedAmendmentIds = new Set(conflicts.flatMap((c) => c.amendmentIds));
  const maxVersion = amendments.length
    ? Math.max(1, ...amendments.map((a) => a.version ?? 1))
    : 1;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={14} style={{ color: "#0072E5" }} />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Version History</h3>
        <span className="text-xs text-[var(--fg-muted)] font-mono">
          {amendments.length + 1} version{amendments.length !== 0 ? "s" : ""}
        </span>
      </div>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-[var(--border-subtle)]" />

        {/* Original SOW node */}
        <button
          onClick={() => onSelectVersion(1)}
          className="relative flex items-start gap-3 w-full text-left py-2 px-2 -mx-2 rounded-lg hover:bg-[var(--surface-subtle)] transition-colors"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 z-10"
            style={
              currentVersion === 1
                ? { backgroundColor: "#0072E5", border: "2px solid #0072E5", color: "#fff" }
                : { backgroundColor: "rgba(0,114,229,0.12)", border: "2px solid #0072E5", color: "#0072E5" }
            }
          >
            v1
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[var(--fg-primary)]">Original SOW</p>
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                style={{ color: "#0072E5", backgroundColor: "rgba(0,114,229,0.08)", borderColor: "rgba(0,114,229,0.25)" }}>
                Baseline
              </span>
            </div>
            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">The starting point of this contract</p>
          </div>
        </button>

        {/* Amendment nodes */}
        {amendments.map((a) => {
          const v        = a.version ?? 1;
          const isActive = currentVersion === v;
          const isPending  = a.status === "pending_review";
          const accepted   = a.changes.filter((c) => c.status === "accepted").length;
          const high       = a.changes.filter((c) => c.riskLevel === "high").length;
          const hasConflict = conflictedAmendmentIds.has(a.id);

          const ringColor = hasConflict
            ? "#ef4444"
            : isPending
            ? "#f59e0b"
            : high > 0
            ? "#ef4444"
            : "#10b981";

          return (
            <button
              key={a.id}
              onClick={() => onSelectVersion(v)}
              className="relative flex items-start gap-3 w-full text-left py-2 px-2 -mx-2 rounded-lg hover:bg-[var(--surface-subtle)] transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 z-10"
                style={
                  isActive
                    ? { backgroundColor: ringColor, border: `2px solid ${ringColor}`, color: "#fff" }
                    : { backgroundColor: "var(--surface-elevated)", border: `2px solid ${ringColor}`, color: ringColor }
                }
              >
                v{v}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[var(--fg-primary)] truncate">{a.title}</p>
                  {hasConflict && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                      style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
                      <ShieldAlert size={9} />Conflict
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                    style={
                      isPending
                        ? { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
                        : { color: "#10b981", backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)" }
                    }>
                    {isPending ? "Pending" : "Resolved"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                    {new Date(a.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)]">·</span>
                  <span className="text-[10px] text-[var(--fg-muted)]">
                    {a.changes.length} change{a.changes.length !== 1 ? "s" : ""}
                    {!isPending && ` · ${accepted} accepted`}
                  </span>
                  {a.parentVersion !== undefined && a.parentVersion !== v - 1 && (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                      based on v{a.parentVersion}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* "Latest" pointer */}
        {maxVersion > 1 && (
          <div className="relative flex items-center gap-3 mt-1 pl-2 -mx-2">
            <div className="w-7 flex justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-[var(--border-color)]" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--fg-muted)]">
              Currently viewing v{currentVersion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Conflict banner ───────────────────────────────────────────────────────────

function ConflictBanner({ conflicts }: { conflicts: AmendmentConflict[] }) {
  if (!conflicts.length) return null;
  const errors  = conflicts.filter((c) => c.severity === "error");
  const isError = errors.length > 0;

  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={
        isError
          ? { borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" }
          : { borderColor: "rgba(245,158,11,0.3)", backgroundColor: "rgba(245,158,11,0.05)" }
      }
    >
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} style={{ color: isError ? "#ef4444" : "#f59e0b" }} />
        <h3 className="text-sm font-semibold" style={{ color: isError ? "#dc2626" : "#b45309" }}>
          {conflicts.length} amendment conflict{conflicts.length !== 1 ? "s" : ""} detected
        </h3>
        {errors.length > 0 && (
          <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
            style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
            {errors.length} blocking
          </span>
        )}
      </div>

      <p className="text-xs" style={{ color: isError ? "#b91c1c" : "#92400e" }}>
        Multiple pending amendments are touching the same clauses. Review and resolve manually before applying — the system will not apply conflicting accepted changes automatically.
      </p>

      <div className="space-y-2 pt-1">
        {conflicts.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-2 px-3 py-2 rounded-lg border bg-[var(--surface-elevated)]"
            style={{ borderColor: c.severity === "error" ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)" }}
          >
            <span className="inline-flex items-center text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 mt-0.5"
              style={
                c.severity === "error"
                  ? { color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }
                  : { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
              }>
              {c.severity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--fg-primary)] truncate">{c.clauseTitle}</p>
              <p className="text-[11px] text-[var(--fg-secondary)] mt-0.5">{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Amendment card ────────────────────────────────────────────────────────────

function AmendmentCard({
  amendment, contractId, onResolved, conflicts, totalAmendments,
}: {
  amendment: Amendment; contractId: string; onResolved: (r: Amendment) => void;
  conflicts: AmendmentConflict[]; totalAmendments: number;
}) {
  const router = useRouter();
  const [changeStatuses, setChangeStatuses] = useState<Record<string, ClauseChangeStatus>>({});
  const [resolving,      setResolving]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [expanded,       setExpanded]       = useState(amendment.status === "pending_review");
  const [forceApply,     setForceApply]     = useState(false);

  function getStatus(id: string): ClauseChangeStatus {
    return changeStatuses[id] ?? "pending";
  }

  // Build conflict map for changes inside this amendment
  const conflictsByChangeId = useMemo(() => {
    const map = new Map<string, AmendmentConflict>();
    for (const c of conflicts) {
      if (!c.amendmentIds.includes(amendment.id)) continue;
      const targetIds = new Set(c.changeIds);
      for (const ch of amendment.changes) {
        // Same-clause conflicts: every change in this amendment touching the conflict clauseId
        if (c.kind === "same_clause" && c.clauseId && ch.clauseId === c.clauseId) {
          map.set(ch.id, c);
        }
        // Direct change-id mapping (modifies_removed)
        else if (targetIds.has(ch.id)) {
          map.set(ch.id, c);
        }
      }
    }
    return map;
  }, [conflicts, amendment]);

  const hasBlockingConflict = useMemo(
    () => Array.from(conflictsByChangeId.values()).some((c) => c.severity === "error"),
    [conflictsByChangeId]
  );

  const allReviewed  = amendment.changes.every((c) => getStatus(c.id) !== "pending");
  const pendingCount = amendment.changes.filter((c) => getStatus(c.id) === "pending").length;

  async function handleResolve() {
    setResolving(true);
    setError(null);
    try {
      const payload = amendment.changes.map((c) => ({ id: c.id, status: getStatus(c.id) }));
      const res = await fetch(`/api/contracts/${contractId}/amendments/${amendment.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ changes: payload }),
      });
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

  const isResolved    = amendment.status === "resolved";
  const acceptedCount = isResolved
    ? amendment.changes.filter((c) => c.status === "accepted").length
    : amendment.changes.filter((c) => getStatus(c.id) === "accepted").length;

  const version       = amendment.version ?? null;
  const cardConflicts = conflictsByChangeId.size > 0;

  return (
    <div
      className="rounded-2xl border bg-[var(--surface-elevated)] overflow-hidden"
      style={{ borderColor: cardConflicts && !isResolved ? "rgba(239,68,68,0.35)" : "var(--border-color)" }}
    >
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        {version !== null && (
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold shrink-0"
            style={
              isResolved
                ? { backgroundColor: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }
                : { backgroundColor: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }
            }
          >
            v{version}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={isResolved
                ? { color: "#10b981", backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)" }
                : { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
              }
            >
              {isResolved ? "Resolved" : "Pending review"}
            </span>
            <h4 className="text-sm font-semibold text-[var(--fg-primary)]">{amendment.title}</h4>
            {cardConflicts && !isResolved && (
              <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
                <ShieldAlert size={9} />{conflictsByChangeId.size} conflict{conflictsByChangeId.size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {version !== null && totalAmendments > 1 && (
              <span className="text-[10px] font-mono text-[var(--fg-muted)] uppercase tracking-wider">
                Amendment {(version - 1)} of {totalAmendments}
              </span>
            )}
            <span className="text-xs text-[var(--fg-muted)] font-mono">
              {new Date(amendment.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-xs text-[var(--fg-muted)]">
              {amendment.changes.length} change{amendment.changes.length !== 1 ? "s" : ""}
              {isResolved && ` · ${acceptedCount} accepted`}
              {!isResolved && pendingCount > 0 && ` · ${pendingCount} pending`}
            </span>
            {/* Change type pills */}
            <div className="flex items-center gap-1">
              {(["added","modified","removed"] as const).map((type) => {
                const count = amendment.changes.filter((c) => c.changeType === type).length;
                if (!count) return null;
                const { color, bg, border, Icon } = CHANGE_META[type];
                return (
                  <span key={type} className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded border"
                    style={{ color, backgroundColor: bg, borderColor: border }}>
                    <Icon size={8} />{count}
                  </span>
                );
              })}
              {amendment.changes.some((c) => c.riskLevel === "high") && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
                  <AlertTriangle size={8} />{amendment.changes.filter((c) => c.riskLevel === "high").length} high-risk
                </span>
              )}
            </div>
          </div>
          {amendment.description && (
            <p className="text-xs text-[var(--fg-secondary)] mt-1 line-clamp-1">{amendment.description}</p>
          )}
          {(amendment.uploadedBy || amendment.resolvedBy) && (
            <p className="text-[10px] font-mono text-[var(--fg-muted)] mt-1">
              {amendment.uploadedBy && <>uploaded by {amendment.uploadedBy}</>}
              {amendment.resolvedBy && <> · resolved by {amendment.resolvedBy}</>}
              {amendment.appliedAt && <> · applied {new Date(amendment.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>}
            </p>
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
              conflict={conflictsByChangeId.get(change.id)}
              onAccept={() => setChangeStatuses((p) => ({ ...p, [change.id]: "accepted" }))}
              onReject={() => setChangeStatuses((p) => ({ ...p, [change.id]: "rejected" }))}
              onUndo={()   => setChangeStatuses((p) => { const n = { ...p }; delete n[change.id]; return n; })}
              disabled={isResolved || resolving}
            />
          ))}

          {!isResolved && (
            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
              {hasBlockingConflict && !forceApply && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border"
                  style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" }}>
                  <ShieldAlert size={13} className="text-red-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                      This amendment has blocking conflicts.
                    </p>
                    <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-0.5">
                      Resolve the underlying conflicts (or reject conflicting changes) before applying. You can override at your own risk.
                    </p>
                    <button
                      onClick={() => setForceApply(true)}
                      className="text-[11px] font-medium text-red-600 dark:text-red-400 hover:underline mt-1"
                    >
                      Override and apply anyway →
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-xs text-[var(--fg-muted)]">
                  {allReviewed
                    ? <span className="text-emerald-600 dark:text-emerald-400 font-medium">All changes reviewed — ready to apply.</span>
                    : <span>{pendingCount} change{pendingCount !== 1 ? "s" : ""} still need review.</span>
                  }
                </div>
                <button
                  onClick={handleResolve}
                  disabled={!allReviewed || resolving || (hasBlockingConflict && !forceApply)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#0072E5" }}
                >
                  {resolving && <Loader2 size={13} className="animate-spin" />}
                  <GitMerge size={13} />
                  {resolving ? "Applying…" : "Apply accepted changes"}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Net change summary ────────────────────────────────────────────────────────

function NetChangeSummary({ amendments }: { amendments: Amendment[] }) {
  const resolved = amendments.filter((a) => a.status === "resolved");
  if (resolved.length === 0) return null;

  const allAccepted = resolved.flatMap((a) => a.changes.filter((c) => c.status === "accepted"));
  const netAdded    = allAccepted.filter((c) => c.changeType === "added").length;
  const netModified = allAccepted.filter((c) => c.changeType === "modified").length;
  const netRemoved  = allAccepted.filter((c) => c.changeType === "removed").length;
  const highRisk    = allAccepted.filter((c) => c.riskLevel === "high").length;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={14} style={{ color: "#0072E5" }} />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Net Change Since Original</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Clauses Added",    value: netAdded,    Icon: TrendingUp,   color: "#10b981" },
          { label: "Clauses Modified", value: netModified, Icon: RotateCcw,    color: "#f59e0b" },
          { label: "Clauses Removed",  value: netRemoved,  Icon: TrendingDown, color: "#ef4444" },
          { label: "High-Risk Changes",value: highRisk,    Icon: AlertTriangle,color: "#ef4444" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Icon size={10} style={{ color }} />
              <p className="text-[9px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold">{label}</p>
            </div>
            <p className="text-lg font-bold font-mono" style={{ color: value > 0 ? color : "var(--fg-muted)" }}>
              {value > 0 ? `+${value}` : value === 0 ? "—" : value}
            </p>
          </div>
        ))}
      </div>
      {highRisk > 0 && (
        <p className="text-[10px] text-red-500 font-medium">
          {highRisk} high-risk clause{highRisk !== 1 ? "s have" : " has"} been accepted across all amendments — review carefully.
        </p>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AmendmentPanel({
  contractId, initialAmendments, initialConflicts,
}: {
  contractId: string;
  initialAmendments: Amendment[];
  initialConflicts?: AmendmentConflict[];
}) {
  const [amendments, setAmendments] = useState(() => withDerivedVersions(initialAmendments));
  const [conflicts,  setConflicts]  = useState<AmendmentConflict[]>(
    initialConflicts ?? detectAmendmentConflicts(withDerivedVersions(initialAmendments))
  );
  const [showUpload, setShowUpload] = useState(false);

  // Auto-open the upload form when arriving via ?upload=amendment
  // (used by the smart project upload redirect)
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("upload") === "amendment") {
      setShowUpload(true);
      // Scroll into view so the form is immediately visible
      requestAnimationFrame(() => {
        document.getElementById("amendments")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [searchParams]);

  const maxVersion = amendments.length
    ? Math.max(1, ...amendments.map((a) => a.version ?? 1))
    : 1;
  const [selectedVersion, setSelectedVersion] = useState(maxVersion);

  const pendingCount = amendments.filter((a) => a.status === "pending_review").length;
  const nextVersion  = (amendments.length
    ? Math.max(...amendments.map((a) => a.version ?? 1))
    : 1) + 1;

  function handleUploaded(amendment: Amendment) {
    const next = withDerivedVersions([amendment, ...amendments]);
    setAmendments(next);
    setConflicts(detectAmendmentConflicts(next));
    setSelectedVersion(amendment.version ?? maxVersion + 1);
    setShowUpload(false);
  }

  function handleResolved(resolved: Amendment) {
    const next = withDerivedVersions(amendments.map((a) => a.id === resolved.id ? resolved : a));
    setAmendments(next);
    setConflicts(detectAmendmentConflicts(next));
  }

  // Sorted: pending first (reverse-chronological), then resolved (reverse-chronological)
  const sortedAmendments = useMemo(() => {
    const pending  = amendments.filter((a) => a.status === "pending_review")
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const resolved = amendments.filter((a) => a.status !== "pending_review")
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return [...pending, ...resolved];
  }, [amendments]);

  return (
    <div id="amendments" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FileDiff size={14} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">
            Contract Amendments
            {amendments.length > 0 && (
              <span className="ml-2 text-[var(--fg-muted)] font-normal font-mono">({amendments.length})</span>
            )}
          </h2>
          {pendingCount > 0 && (
            <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={{ color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}>
              {pendingCount} pending
            </span>
          )}
          {conflicts.length > 0 && (
            <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
              style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
              <ShieldAlert size={9} className="inline mr-0.5" />{conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--fg-secondary)] hover:text-[#0072E5] hover:border-[rgba(0,114,229,0.35)] transition-all"
          >
            <Plus size={12} />Upload amendment
          </button>
        )}
      </div>

      {/* Conflict banner — top-priority */}
      <ConflictBanner conflicts={conflicts} />

      {/* Two-column: timeline + net change summary */}
      {amendments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StackedTimeline
            amendments={sortedAmendments}
            conflicts={conflicts}
            currentVersion={selectedVersion}
            onSelectVersion={setSelectedVersion}
          />
          <NetChangeSummary amendments={amendments} />
        </div>
      )}

      {showUpload && (
        <UploadAmendmentForm
          contractId={contractId}
          onUploaded={handleUploaded}
          onCancel={() => setShowUpload(false)}
          nextVersion={nextVersion}
        />
      )}

      {sortedAmendments.map((amendment) => (
        <AmendmentCard
          key={amendment.id}
          amendment={amendment}
          contractId={contractId}
          onResolved={handleResolved}
          conflicts={conflicts}
          totalAmendments={amendments.length}
        />
      ))}

      {amendments.length === 0 && !showUpload && (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-subtle)] p-10 text-center">
          <FileDiff size={28} className="mx-auto mb-3 text-[var(--fg-muted)]" />
          <p className="text-sm font-medium text-[var(--fg-secondary)] mb-1">No amendments yet</p>
          <p className="text-xs text-[var(--fg-muted)] mb-4">
            When a client sends a revised SOW or change order, upload the file or paste the text here.
            The AI compares it verbatim against the original contract and flags every material change.
            Multiple amendments stack chronologically and conflicts are flagged automatically.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ backgroundColor: "#0072E5" }}
          >
            <Plus size={12} />Upload first amendment
          </button>
        </div>
      )}
    </div>
  );
}
