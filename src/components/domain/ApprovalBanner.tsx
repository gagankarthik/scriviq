"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ApprovalStatus } from "@/lib/mock-data";

const STATUS_STYLES: Record<Exclude<ApprovalStatus, "draft">, { color: string; bg: string; border: string; Icon: React.ElementType; label: string }> = {
  pending_approval: { color: "#f59e0b", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.2)",  Icon: Clock,        label: "Pending approval" },
  approved:         { color: "#10b981", bg: "rgba(16,185,129,0.06)",  border: "rgba(16,185,129,0.2)",  Icon: CheckCircle2, label: "Approved"         },
  rejected:         { color: "#ef4444", bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.2)",   Icon: XCircle,      label: "Changes requested" },
};

interface ApprovalBannerProps {
  contractId:    string;
  status:        ApprovalStatus;
  approvers?:    string[];
  comments?:     string;
  stepId?:       string;
}

export function ApprovalBanner({ contractId, status, approvers, comments, stepId }: ApprovalBannerProps) {
  const router = useRouter();
  const [expanded,  setExpanded]  = useState(false);
  const [deciding,  setDeciding]  = useState(false);
  const [comment,   setComment]   = useState("");

  if (status === "draft") return null;
  const s = STATUS_STYLES[status];

  async function decide(decision: "approved" | "rejected") {
    if (!stepId) return;
    setDeciding(true);
    try {
      await fetch(`/api/contracts/${contractId}/approve`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ decision, comments: comment, stepId }),
      });
      router.refresh();
    } finally {
      setDeciding(false);
    }
  }

  return (
    <div className="rounded-xl border px-4 py-3" style={{ backgroundColor: s.bg, borderColor: s.border }}>
      <div className="flex items-center gap-2">
        <s.Icon size={14} style={{ color: s.color }} />
        <span className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
        {approvers?.length ? (
          <span className="text-xs text-[var(--fg-muted)] ml-1">
            — {approvers.join(", ")}
          </span>
        ) : null}
        {status === "pending_approval" && stepId && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="ml-auto flex items-center gap-1 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]"
          >
            Review
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {comments && !expanded && (
        <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">{comments}</p>
      )}

      {expanded && (
        <div className="mt-3 space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment (optional)…"
            rows={2}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => decide("approved")}
              disabled={deciding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all disabled:opacity-60"
            >
              {deciding ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
              Approve
            </button>
            <button
              onClick={() => decide("rejected")}
              disabled={deciding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-60"
            >
              <XCircle size={11} />
              Request changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
