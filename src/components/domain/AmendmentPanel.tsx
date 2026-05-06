"use client";

import { useState, useMemo, useRef, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FileDiff, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, PlusCircle, MinusCircle, RotateCcw,
  GitMerge, CornerDownRight, Upload, FileText,
  Type, X, GitCommitHorizontal, TrendingUp, TrendingDown, Minus,
  ArrowRight,
} from "lucide-react";
import type { Amendment, ClauseChange, ClauseChangeType, ClauseChangeStatus } from "@/lib/mock-data";
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
  change, localStatus, onAccept, onReject, onUndo, disabled,
}: {
  change: ClauseChange; localStatus: ClauseChangeStatus;
  onAccept: () => void; onReject: () => void; onUndo: () => void; disabled: boolean;
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
    <div className="rounded-xl border overflow-hidden transition-colors" style={{ borderColor: isReviewed ? "var(--border-subtle)" : border }}>
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
          <RiskBadge level={change.riskLevel} />
          {localStatus === "accepted" && <CheckCircle2 size={14} className="text-emerald-500" />}
          {localStatus === "rejected" && <XCircle size={14} className="text-red-400" />}
          {localStatus === "pending"  && <Clock size={14} className="text-[var(--fg-muted)]" />}
          {expanded ? <ChevronUp size={13} className="text-[var(--fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--fg-muted)]" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)]">
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
  contractId, onUploaded, onCancel,
}: {
  contractId: string;
  onUploaded: (a: Amendment) => void;
  onCancel:   () => void;
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
      </div>
      <p className="text-xs text-[var(--fg-muted)] -mt-2">
        Upload a PDF/DOCX file or paste the text — the AI compares it against the original contract and flags every changed, added, or removed clause.
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
            placeholder="e.g. SOW Amendment #1 — Scope Expansion" className={inputCls} />
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
                Text will be extracted server-side and sent to GPT-4o-mini alongside the original contract clauses for a precise, verbatim comparison.
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

// ── Amendment card ────────────────────────────────────────────────────────────

function AmendmentCard({
  amendment, contractId, onResolved,
}: {
  amendment: Amendment; contractId: string; onResolved: (r: Amendment) => void;
}) {
  const router = useRouter();
  const [changeStatuses, setChangeStatuses] = useState<Record<string, ClauseChangeStatus>>({});
  const [resolving,      setResolving]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [expanded,       setExpanded]       = useState(amendment.status === "pending_review");

  function getStatus(id: string): ClauseChangeStatus {
    return changeStatuses[id] ?? "pending";
  }

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

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
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
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
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

// ── Evolution timeline ────────────────────────────────────────────────────────

function EvolutionTimeline({ amendments }: { amendments: Amendment[] }) {
  const resolved = amendments.filter((a) => a.status === "resolved");
  if (resolved.length === 0) return null;

  // Net accepted changes across all resolved amendments
  const allAccepted = resolved.flatMap((a) => a.changes.filter((c) => c.status === "accepted"));
  const netAdded    = allAccepted.filter((c) => c.changeType === "added").length;
  const netModified = allAccepted.filter((c) => c.changeType === "modified").length;
  const netRemoved  = allAccepted.filter((c) => c.changeType === "removed").length;
  const highRisk    = allAccepted.filter((c) => c.riskLevel === "high").length;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <GitCommitHorizontal size={14} style={{ color: "#0072E5" }} />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Contract Evolution</h3>
        <span className="text-xs text-[var(--fg-muted)] font-mono">
          {resolved.length} resolved amendment{resolved.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex items-start gap-0 overflow-x-auto pb-1">
        {/* Origin node */}
        <div className="flex flex-col items-center gap-1 shrink-0 min-w-[80px]">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: "rgba(0,114,229,0.12)", border: "2px solid #0072E5", color: "#0072E5" }}>
            v1
          </div>
          <p className="text-[9px] text-[var(--fg-muted)] text-center font-semibold uppercase tracking-wider">Original</p>
          <p className="text-[9px] text-[var(--fg-muted)] text-center">SOW</p>
        </div>

        {resolved.map((amendment, i) => {
          const accepted = amendment.changes.filter((c) => c.status === "accepted");
          const hasHigh  = accepted.some((c) => c.riskLevel === "high");
          return (
            <div key={amendment.id} className="flex items-center shrink-0">
              {/* Connector */}
              <div className="flex flex-col items-center gap-0.5 mx-1 mt-4">
                <ArrowRight size={14} className="text-[var(--fg-muted)]" />
              </div>
              {/* Amendment node */}
              <div className="flex flex-col items-center gap-1 min-w-[90px]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: hasHigh ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                    border: `2px solid ${hasHigh ? "#ef4444" : "#10b981"}`,
                    color: hasHigh ? "#ef4444" : "#10b981",
                  }}>
                  v{i + 2}
                </div>
                <p className="text-[9px] text-[var(--fg-muted)] text-center font-semibold uppercase tracking-wider truncate max-w-[88px]">
                  {amendment.title.replace(/amendment/i, "Amend.").slice(0, 18)}
                </p>
                <p className="text-[9px] text-[var(--fg-muted)] text-center">
                  {accepted.length} change{accepted.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Net change summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--border-subtle)]">
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

      <p className="text-[10px] text-[var(--fg-muted)]">
        Net accepted changes from original SOW to current version.
        {highRisk > 0 && (
          <span className="ml-1 text-red-500 font-semibold">{highRisk} high-risk clause{highRisk !== 1 ? "s" : ""} were accepted — review carefully.</span>
        )}
      </p>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AmendmentPanel({ contractId, initialAmendments }: {
  contractId: string; initialAmendments: Amendment[];
}) {
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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

      {/* Evolution timeline — shown when there are resolved amendments */}
      <EvolutionTimeline amendments={amendments} />

      {showUpload && (
        <UploadAmendmentForm
          contractId={contractId}
          onUploaded={handleUploaded}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {amendments.map((amendment) => (
        <AmendmentCard
          key={amendment.id}
          amendment={amendment}
          contractId={contractId}
          onResolved={handleResolved}
        />
      ))}

      {amendments.length === 0 && !showUpload && (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-subtle)] p-10 text-center">
          <FileDiff size={28} className="mx-auto mb-3 text-[var(--fg-muted)]" />
          <p className="text-sm font-medium text-[var(--fg-secondary)] mb-1">No amendments yet</p>
          <p className="text-xs text-[var(--fg-muted)] mb-4">
            When a client sends a revised SOW or change order, upload the file or paste the text here.
            The AI compares it verbatim against the original contract and flags every material change.
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
