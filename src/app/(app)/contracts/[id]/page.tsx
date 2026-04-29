import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Download, Loader2, AlertCircle, CheckCircle2,
  Calendar, DollarSign, Shield, TrendingUp, FileWarning,
  Activity, GitBranch, CheckSquare,
} from "lucide-react";
import { dbGetContract, dbListClauses, dbListAlerts, dbListAmendments } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import { formatCurrency, daysUntil, computeRiskScore } from "@/lib/utils";
import { RiskBadge, RiskBadgeLarge } from "@/components/domain/RiskBadge";
import { RiskGauge } from "@/components/domain/RiskGauge";
import { ClauseList } from "@/components/domain/ClauseList";
import { ContractActions } from "@/components/domain/ContractActions";
import { AmendmentPanel } from "@/components/domain/AmendmentPanel";
import { ContractEditModal } from "@/components/domain/ContractEditModal";
import type { Clause } from "@/lib/mock-data";

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "processing" | "ready" | "error" }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
        style={{ backgroundColor: "rgba(0,114,229,0.08)", color: "#75D8FC", borderColor: "rgba(0,114,229,0.2)" }}>
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

// ── Payment milestones section ────────────────────────────────────────────────

function PaymentMilestones({ clauses }: { clauses: Clause[] }) {
  const milestones = clauses
    .filter((c) => c.type === "payment_milestone")
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  if (!milestones.length) return null;

  const totalAmount = milestones.reduce((s, c) => s + (c.amount ?? 0), 0);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[var(--fg-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Payment Milestones</h3>
          <span className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
            {milestones.length}
          </span>
        </div>
        {totalAmount > 0 && (
          <span className="text-sm font-semibold font-mono" style={{ color: "#0072E5" }}>
            {formatCurrency(totalAmount)}
          </span>
        )}
      </div>

      {/* Cash flow bar */}
      {totalAmount > 0 && (
        <div className="mb-4 space-y-1.5">
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {milestones.map((m) => {
              const pct = totalAmount > 0 ? ((m.amount ?? 0) / totalAmount) * 100 : 0;
              const d   = m.dueDate ? daysUntil(m.dueDate) : null;
              const color = d !== null && d < 0 ? "#ef4444" : d !== null && d <= 7 ? "#f59e0b" : "#0072E5";
              return (
                <div
                  key={m.id}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  title={`${m.title}: ${m.amount ? formatCurrency(m.amount) : "—"}`}
                />
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--fg-muted)]">Cash flow distribution across milestones</p>
        </div>
      )}

      {/* Timeline list */}
      <div className="relative pl-5 space-y-4">
        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[var(--border-subtle)]" />
        {milestones.map((m, i) => {
          const d     = m.dueDate ? daysUntil(m.dueDate) : null;
          const color = d !== null && d < 0 ? "#ef4444" : d !== null && d <= 7 ? "#f59e0b" : "#0072E5";
          const pct   = totalAmount > 0 ? Math.round(((m.amount ?? 0) / totalAmount) * 100) : null;
          return (
            <div key={m.id} className="relative">
              <div
                className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-[var(--surface-elevated)]"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--fg-primary)]">{m.title}</p>
                  {m.summary && (
                    <p className="text-xs text-[var(--fg-secondary)] mt-0.5 line-clamp-1">{m.summary}</p>
                  )}
                  {m.dueDate && (
                    <p className="text-[10px] font-mono text-[var(--fg-muted)] mt-1">
                      {new Date(m.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      {d !== null && (
                        <span className="ml-2 font-semibold" style={{ color }}>
                          {d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Due today" : `${d}d remaining`}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {m.amount && (
                    <p className="text-sm font-semibold font-mono text-[var(--fg-primary)]">
                      {formatCurrency(m.amount)}
                    </p>
                  )}
                  {pct !== null && (
                    <p className="text-[10px] font-mono text-[var(--fg-muted)]">{pct}% of total</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Termination summary ───────────────────────────────────────────────────────

function TerminationSummary({ clauses }: { clauses: Clause[] }) {
  const termination = clauses.filter((c) => c.type === "termination_notice");
  if (!termination.length) return null;

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <FileWarning size={13} className="text-amber-600 dark:text-amber-400" />
        <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
          Termination ({termination.length})
        </h3>
      </div>
      <div className="space-y-3">
        {termination.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--fg-primary)]">{c.title}</p>
              <p className="text-xs text-[var(--fg-secondary)] mt-0.5 line-clamp-2">{c.summary}</p>
            </div>
            <div className="shrink-0 text-right">
              {c.noticeDays && (
                <>
                  <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Notice</p>
                  <p className="text-sm font-bold font-mono text-[var(--fg-primary)]">{c.noticeDays}d</p>
                </>
              )}
              <RiskBadge level={c.riskLevel} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }      = await params;
  const session     = await getSession();
  const workspace   = session?.workspace ?? "";

  const dbContract = await dbGetContract(workspace, id).catch(() => null);
  if (!dbContract) notFound();

  const [clauses, allAlerts, amendments] = await Promise.all([
    dbListClauses(workspace, id).catch(() => []),
    dbListAlerts(workspace).catch(() => []),
    dbListAmendments(workspace, id).catch(() => []),
  ]);
  const contract       = dbContract;
  const contractAlerts = allAlerts.filter((a) => a.contractId === id && a.status !== "dismissed");

  const days           = contract.expiryDate ? daysUntil(contract.expiryDate) : null;
  const highRisk       = clauses.filter((c) => c.riskLevel === "high");
  const mediumRisk     = clauses.filter((c) => c.riskLevel === "medium");
  const activeClauses  = clauses.filter((c) => c.status === "active");
  const withDates      = clauses.filter((c) => c.dueDate);
  const riskScore      = computeRiskScore(clauses);
  const milestoneTotal = clauses
    .filter((c) => c.type === "payment_milestone")
    .reduce((s, c) => s + (c.amount ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button + breadcrumb row */}
      <div className="flex items-center gap-3">
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Contracts
        </Link>
        <span className="text-[var(--fg-muted)] text-xs">/</span>
        <span className="text-xs text-[var(--fg-secondary)] font-mono truncate max-w-xs">
          {contract.title}
        </span>
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

          {/* Risk gauge */}
          {clauses.length > 0 && (
            <div className="shrink-0 flex flex-col items-center gap-1">
              <RiskGauge score={riskScore} />
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--fg-muted)]">
                Risk Score
              </p>
            </div>
          )}

          <div className="flex flex-col items-end gap-2 shrink-0 sm:self-start">
            <div className="flex items-center gap-2">
              <ContractEditModal
                contractId={id}
                initial={{
                  title: contract.title,
                  clientName: contract.clientName,
                  contractValue: contract.contractValue ?? undefined,
                  expiryDate: contract.expiryDate ?? undefined,
                }}
              />
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-all">
                <Download size={14} />
                Download
              </button>
              <ContractActions contractId={id} contractTitle={contract.title} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row — primary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Contract Value",
            value: contract.contractValue ? formatCurrency(contract.contractValue) : "—",
            leftColor: "#0072E5",
            textColor: "text-[#0072E5] dark:text-[#75D8FC]",
            Icon: DollarSign,
          },
          {
            label: "Total Clauses",
            value: String(clauses.length),
            leftColor: "var(--border-color)",
            textColor: "text-[var(--fg-primary)]",
            Icon: Shield,
          },
          {
            label: "High-Risk",
            value: String(highRisk.length),
            leftColor: highRisk.length > 0 ? "#ef4444" : "var(--border-color)",
            textColor: highRisk.length > 0 ? "text-red-600 dark:text-red-400" : "text-[var(--fg-primary)]",
            Icon: AlertCircle,
          },
          {
            label: days !== null ? (days < 0 ? "Expired" : "Expires in") : "Expiry",
            value: days !== null ? (days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `${days}d`) : "—",
            leftColor: (days !== null && days <= 7) ? "#f59e0b" : (days !== null && days < 0) ? "#ef4444" : "var(--border-color)",
            textColor: (days !== null && days <= 7) ? "text-amber-600 dark:text-amber-400" : (days !== null && days < 0) ? "text-red-600 dark:text-red-400" : "text-[var(--fg-primary)]",
            Icon: Calendar,
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
            <p className={`text-2xl font-bold font-mono ${textColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Stats row — secondary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Medium-Risk",
            value: String(mediumRisk.length),
            leftColor: mediumRisk.length > 0 ? "#f59e0b" : "var(--border-color)",
            textColor: mediumRisk.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--fg-primary)]",
            Icon: Activity,
            sub: "clauses",
          },
          {
            label: "Active Clauses",
            value: String(activeClauses.length),
            leftColor: "#10b981",
            textColor: "text-emerald-600 dark:text-emerald-400",
            Icon: CheckSquare,
            sub: `of ${clauses.length} total`,
          },
          {
            label: "Amendments",
            value: String(amendments.length),
            leftColor: amendments.some((a) => a.status === "pending_review") ? "#f59e0b" : "var(--border-color)",
            textColor: amendments.some((a) => a.status === "pending_review") ? "text-amber-600 dark:text-amber-400" : "text-[var(--fg-primary)]",
            Icon: GitBranch,
            sub: amendments.some((a) => a.status === "pending_review")
              ? `${amendments.filter((a) => a.status === "pending_review").length} pending`
              : "all resolved",
          },
          {
            label: "Milestone Total",
            value: milestoneTotal > 0 ? formatCurrency(milestoneTotal) : "—",
            leftColor: milestoneTotal > 0 ? "#0072E5" : "var(--border-color)",
            textColor: milestoneTotal > 0 ? "text-[#0072E5] dark:text-[#75D8FC]" : "text-[var(--fg-primary)]",
            Icon: TrendingUp,
            sub: "payment milestones",
          },
        ].map(({ label, value, leftColor, textColor, Icon, sub }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 border-l-2"
            style={{ borderLeftColor: leftColor }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} className="text-[var(--fg-muted)]" />
              <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold">{label}</p>
            </div>
            <p className={`text-xl font-bold font-mono ${textColor}`}>{value}</p>
            {sub && <p className="text-[10px] text-[var(--fg-muted)] mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Pending amendment alert */}
      {amendments.some((a) => a.status === "pending_review") && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/15">
          <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {amendments.filter((a) => a.status === "pending_review").length} amendment{amendments.filter((a) => a.status === "pending_review").length !== 1 ? "s" : ""} pending review
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

      {/* Payment milestones (full width) */}
      {contract.status === "ready" && clauses.length > 0 && (
        <PaymentMilestones clauses={clauses} />
      )}

      {/* Content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clauses */}
        <div className="lg:col-span-2">
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
              <button className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
                Retry extraction &rarr;
              </button>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Termination summary */}
          {contract.status === "ready" && <TerminationSummary clauses={clauses} />}

          {/* Deadlines */}
          {withDates.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={13} className="text-[var(--fg-muted)]" />
                <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">All Deadlines</h3>
              </div>
              <div className="space-y-3">
                {withDates.map((c) => {
                  const d = daysUntil(c.dueDate!);
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--fg-primary)] truncate">{c.title}</p>
                        <p className="text-[10px] text-[var(--fg-muted)] font-mono">
                          {new Date(c.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-xs font-mono font-semibold shrink-0 ${d < 0 ? "text-red-500 dark:text-red-400" : d <= 7 ? "text-amber-500 dark:text-amber-400" : "text-[var(--fg-muted)]"}`}>
                        {d < 0 ? `${Math.abs(d)}d late` : d === 0 ? "Today" : `${d}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active alerts */}
          {contractAlerts.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/10 p-5">
              <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
                Active Alerts ({contractAlerts.length})
              </h3>
              <div className="space-y-2">
                {contractAlerts.map((a) => (
                  <div key={a.id} className="text-xs">
                    <p className="text-[var(--fg-primary)]">{a.clauseTitle}</p>
                    <p className="text-[var(--fg-muted)] font-mono">
                      {a.type === "overdue" ? "Overdue" : a.type === "1_day" ? "1 day" : "7 days"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk breakdown */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={13} className="text-[var(--fg-muted)]" />
              <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">Risk Breakdown</h3>
            </div>
            {clauses.length > 0 ? (
              <div className="space-y-2.5">
                {(["high", "medium", "low"] as const).map((level) => {
                  const count = clauses.filter((c) => c.riskLevel === level).length;
                  const pct   = Math.round((count / clauses.length) * 100);
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <RiskBadge level={level} showDot={false} />
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-subtle)]">
                        <div
                          className={`h-full rounded-full ${level === "high" ? "bg-red-500" : level === "medium" ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[var(--fg-muted)] w-4 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--fg-muted)]">No clauses yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Amendments */}
      <AmendmentPanel contractId={id} initialAmendments={amendments} />
    </div>
  );
}
