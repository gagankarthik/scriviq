"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface ContractActionsProps {
  contractId:    string;
  contractTitle: string;
}

export function ContractActions({ contractId, contractTitle }: ContractActionsProps) {
  const router = useRouter();
  const [analysing,      setAnalysing]      = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  async function handleAnalyse() {
    setAnalysing(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/extract`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Re-analysis failed — please try again.");
    } finally {
      setAnalysing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/contracts");
    } catch {
      setError("Delete failed — please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleAnalyse}
          disabled={analysing}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[#0072E5] hover:border-[rgba(0,114,229,0.35)] text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analysing
            ? <Loader2 size={14} className="animate-spin" />
            : <RefreshCw size={14} />
          }
          {analysing ? "Analysing…" : "Re-analyse"}
        </button>

        <button
          onClick={() => { setError(null); setConfirmDelete(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/40 text-sm font-medium transition-all"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Delete contract</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors ml-2"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-6">
              Permanently delete{" "}
              <span className="font-semibold text-[var(--fg-primary)]">{contractTitle}</span>?
              All extracted clauses, amendments, and alerts will be removed.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Deleting…" : "Delete contract"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
