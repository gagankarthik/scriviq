"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";

export function DeleteProjectButton({
  projectId, projectName, contractCount,
}: {
  projectId:     string;
  projectName:   string;
  contractCount: number;
}) {
  const router = useRouter();
  const [open, setOpen]         = useState(false);
  const [confirm, setConfirm]   = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  async function handleDelete() {
    if (confirm !== projectName) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Delete failed");
      }
      router.push("/contracts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all"
        title="Delete project"
      >
        <Trash2 size={13} />
        <span className="hidden sm:inline text-xs font-medium">Delete</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => !deleting && setOpen(false)} style={{ backdropFilter: "blur(4px)" }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Delete project</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">This cannot be undone.</p>
                </div>
                <button
                  onClick={() => !deleting && setOpen(false)}
                  className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
                  disabled={deleting}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-5 space-y-3">
                <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                  Deleting <span className="font-semibold text-[var(--fg-primary)]">{projectName}</span> removes the project record only.
                  {contractCount > 0 && (
                    <>
                      {" "}The {contractCount} document{contractCount !== 1 ? "s" : ""} inside will become <span className="font-semibold">ungrouped</span> — they remain in your workspace and are still accessible from the Contracts list.
                    </>
                  )}
                </p>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--fg-muted)] block mb-1">
                    Type the project name to confirm
                  </label>
                  <input
                    type="text"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={projectName}
                    autoFocus
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] font-mono placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30">
                    <AlertTriangle size={11} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2 bg-[var(--surface-subtle)]/40">
                <button
                  onClick={() => setOpen(false)}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={confirm !== projectName || deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting && <Loader2 size={11} className="animate-spin" />}
                  <Trash2 size={11} />
                  {deleting ? "Deleting…" : "Delete project"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
