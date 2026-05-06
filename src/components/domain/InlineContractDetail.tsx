import Link from "next/link";
import {
  ArrowLeft, DollarSign, Shield, Calendar, AlertCircle,
  CheckCircle2, Loader2, TrendingUp, Activity, CheckSquare,
  GitBranch, BarChart3, FileWarning,
} from "lucide-react";
import {
  dbGetContract, dbListClauses, dbListAmendments,
  dbGetSowAnalysis, dbListAlerts,
} from "@/lib/aws/contracts";
import { ClauseList } from "./ClauseList";
import { AmendmentPanel } from "./AmendmentPanel";
import { SowAnalysisPanel } from "./SowAnalysisPanel";
import { RiskBadge, RiskBadgeLarge } from "./RiskBadge";
import { RiskGauge } from "./RiskGauge";
import { SowTypeBadge } from "./SowTypeBadge";
import { BudgetTracker } from "./BudgetTracker";
import { formatCurrency, daysUntil, computeRiskScore } from "@/lib/utils";

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "processing" | "ready" | "error" }) {
  if (status === "processing")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
        style={{ backgroundColor: "rgba(0,114,229,0.08)", color: "#75D8FC", borderColor: "rgba(0,114,229,0.2)" }}
      >
        <Loader2 size={11} className="animate-spin" />Processing
      </span>
    );
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
        <CheckCircle2 size={11} />Ready
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30">
      <AlertCircle size={11} />Error
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export async function InlineContractDetail({
  contractId,
  workspace,
  projectId,
}: {
  contractId: string;
  workspace:  string;
  projectId:  string;
}) {
  const contract = await dbGetContract(workspace, contractId).catch(() => null);

  if (!contract) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-12 text-center">
        <AlertCircle size={36} className="mx-auto mb-4 text-[var(--fg-muted)]" />
        <p className="text-[var(--fg-primary)] font-semibold mb-2">Document not found</p>
        <Link
          href={`/contracts/projects/${projectId}`}
          className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft size={11} />
          Back to Project Overview
        </Link>
      </div>
    );
  }

  const [clauses, allAlerts, amendments, sowAnalysis] = await Promise.all([
    dbListClauses(workspace, contractId).catch(() => []),
    dbListAlerts(workspace).catch(() => []),
    dbListAmendments(workspace, contractId).catch(() => []),
    dbGetSowAnalysis(workspace, contractId).catch(() => null),
  ]);

  const contractAlerts = allAlerts.filter(
    (a) => a.contractId === contractId && a.status !== "dismissed"
  );

  const days         = contract.expiryDate ? daysUntil(contract.expiryDate) : null;
  const highRisk     = clauses.filter((c) => c.riskLevel === "high");
  const riskScore    = computeRiskScore(clauses);

  // ── Back bar ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl space-y-6">

      {/* Back bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href={`/contracts/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Project Overview
        </Link>
        <Link
          href={`/contracts/${contractId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: "#0072E5" }}
        >
          View full page →
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--fg-muted)] mb-1">{contract.clientName}</p>
            <h1 className="text-xl font-bold text-[var(--fg-primary)] tracking-tight mb-3">
              {contract.title}
            </h1>
            <div className="flex items-center gap-2.5 flex-wrap">
              <StatusBadge status={contract.status} />
              {contract.riskScore && <RiskBadgeLarge level={contract.riskScore} />}
              {contract.sowType && <SowTypeBadge type={contract.sowType} />}
              <span className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 rounded uppercase">
                {contract.fileType}
              </span>
              <span className="text-xs font-mono text-[var(--fg-muted)]">{contract.pageCount} pages</span>
            </div>

            {contract.aiSummary && (
              <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mb-2">AI Summary</p>
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{contract.aiSummary}</p>
              </div>
            )}
          </div>

          {clauses.length > 0 && (
            <div className="shrink-0 flex flex-col items-center gap-1">
              <RiskGauge score={riskScore} />
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--fg-muted)]">
                Risk Score
              </p>
            </div>
          )}

          <div className="shrink-0 sm:self-start">
            {contract.status === "ready" && clauses.length > 0 && (
              <Link
                href={`/contracts/${contractId}/report`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: "rgba(0,114,229,0.1)", color: "#0072E5", border: "1px solid rgba(0,114,229,0.25)" }}
              >
                <BarChart3 size={14} />
                View Report
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label:     "Contract Value",
            value:     contract.contractValue ? formatCurrency(contract.contractValue) : "—",
            leftColor: "#0072E5",
            textColor: "text-[#0072E5] dark:text-[#75D8FC]",
            Icon:      DollarSign,
          },
          {
            label:     "Total Clauses",
            value:     String(clauses.length),
            leftColor: "var(--border-color)",
            textColor: "text-[var(--fg-primary)]",
            Icon:      Shield,
          },
          {
            label:     "High-Risk",
            value:     String(highRisk.length),
            leftColor: highRisk.length > 0 ? "#ef4444" : "var(--border-color)",
            textColor: highRisk.length > 0 ? "text-red-600 dark:text-red-400" : "text-[var(--fg-primary)]",
            Icon:      AlertCircle,
          },
          {
            label:     days !== null ? (days < 0 ? "Expired" : "Expires in") : "Expiry",
            value:     days !== null ? (days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `${days}d`) : "—",
            leftColor: (days !== null && days <= 7) ? "#f59e0b" : (days !== null && days < 0) ? "#ef4444" : "var(--border-color)",
            textColor: (days !== null && days <= 7) ? "text-amber-600 dark:text-amber-400" : (days !== null && days < 0) ? "text-red-600 dark:text-red-400" : "text-[var(--fg-primary)]",
            Icon:      Calendar,
          },
        ].map(({ label, value, leftColor, textColor, Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 border-l-2"
            style={{ borderLeftColor: leftColor }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} className="text-[var(--fg-muted)]" />
              <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold">{label}</p>
            </div>
            <p className={`text-lg sm:text-2xl font-bold font-mono ${textColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pending amendment alert */}
      {amendments.some((a) => a.status === "pending_review") && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/15">
          <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {amendments.filter((a) => a.status === "pending_review").length} amendment
              {amendments.filter((a) => a.status === "pending_review").length !== 1 ? "s" : ""} pending review
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Review clause-by-clause changes before applying to this contract.
            </p>
          </div>
          <a
            href="#amendments"
            className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
          >
            Review now →
          </a>
        </div>
      )}

      {/* Budget tracker (LOE contracts) */}
      {(contract.budgetHours || contract.sowType === "loe") && (
        <BudgetTracker
          contractId={contractId}
          budgetHours={contract.budgetHours}
          budgetRate={contract.budgetRate}
        />
      )}

      {/* Clause list */}
      <div>
        {contract.status === "ready" && clauses.length > 0 ? (
          <ClauseList clauses={clauses} />
        ) : contract.status === "processing" ? (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-12 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#0072E5] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-[var(--fg-primary)] font-semibold mb-1">Extracting clauses…</p>
            <p className="text-sm text-[var(--fg-muted)]">This usually takes about 15 seconds.</p>
          </div>
        ) : contract.status === "error" ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10 p-12 text-center">
            <AlertCircle size={36} className="mx-auto mb-4 text-red-500" />
            <p className="text-[var(--fg-primary)] font-semibold mb-1">Extraction failed</p>
            <p className="text-sm text-[var(--fg-muted)] mb-4">The AI could not process this document. Check the file and retry.</p>
          </div>
        ) : null}
      </div>

      {/* SOW Intelligence */}
      <SowAnalysisPanel contractId={contractId} initialAnalysis={sowAnalysis} />

      {/* Amendments */}
      <AmendmentPanel contractId={contractId} initialAmendments={amendments} />
    </div>
  );
}
