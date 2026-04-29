import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Loader2, AlertCircle, CheckCircle2, Calendar, DollarSign, Shield } from "lucide-react";
import { dbGetContract, dbListClauses, dbListAlerts } from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import {
  getContractById,
  getContractClauses,
  ALERTS,
  formatCurrency,
  daysUntil,
} from "@/lib/mock-data";
import { RiskBadge, RiskBadgeLarge } from "@/components/domain/RiskBadge";
import { ClauseList } from "@/components/domain/ClauseList";

function StatusBadge({ status }: { status: "processing" | "ready" | "error" }) {
  if (status === "processing")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
        style={{ backgroundColor: "rgba(0,114,229,0.08)", color: "#75D8FC", borderColor: "rgba(0,114,229,0.2)" }}
      >
        <Loader2 size={11} className="animate-spin" />
        Processing
      </span>
    );
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
        <CheckCircle2 size={11} />
        Ready
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30">
      <AlertCircle size={11} />
      Error
    </span>
  );
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const workspace = session?.workspace ?? "";

  let contract, clauses, contractAlerts;

  try {
    const [c, cl, al] = await Promise.all([
      dbGetContract(workspace, id),
      dbListClauses(workspace, id),
      dbListAlerts(workspace),
    ]);
    if (!c) throw new Error("not found");
    contract       = c;
    clauses        = cl;
    contractAlerts = al.filter((a) => a.contractId === id && a.status !== "dismissed");
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "not found") notFound();
    // Fallback to mock data
    const c = getContractById(id);
    if (!c) notFound();
    contract       = c;
    clauses        = getContractClauses(id);
    contractAlerts = ALERTS.filter((a) => a.contractId === id && a.status !== "dismissed");
  }

  const days      = contract.expiryDate ? daysUntil(contract.expiryDate) : null;
  const highRisk  = clauses.filter((c) => c.riskLevel === "high");
  const withDates = clauses.filter((c) => c.dueDate);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] font-mono">
        <Link href="/contracts" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Contracts
        </Link>
        <span>/</span>
        <span className="text-[var(--fg-secondary)] truncate max-w-xs">{contract.title}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
              <span className="text-xs font-mono text-[var(--fg-muted)]">
                {contract.pageCount} pages
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-all">
              <Download size={14} />
              Download
            </button>
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] text-sm transition-all"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
        </div>

        {/* AI Summary */}
        {contract.aiSummary && (
          <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mb-2">
              AI Summary
            </p>
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
              {contract.aiSummary}
            </p>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Contract Value",
            value: contract.contractValue ? formatCurrency(contract.contractValue) : "—",
            accent: "indigo" as const,
            Icon: DollarSign,
          },
          {
            label: "Total Clauses",
            value: String(clauses.length),
            accent: "slate" as const,
            Icon: Shield,
          },
          {
            label: "High-Risk",
            value: String(highRisk.length),
            accent: highRisk.length > 0 ? "red" as const : "slate" as const,
            Icon: AlertCircle,
          },
          {
            label: days !== null ? (days < 0 ? "Expired" : "Expires in") : "Expiry",
            value: days !== null ? (days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today" : `${days}d`) : "—",
            accent: (days !== null && days <= 7) ? "amber" as const : (days !== null && days < 0) ? "red" as const : "slate" as const,
            Icon: Calendar,
          },
        ].map(({ label, value, accent, Icon }) => {
          const leftBorder = accent === "indigo" ? "border-l-[#0072E5]" : accent === "red" ? "border-l-red-500" : accent === "amber" ? "border-l-amber-500" : "border-l-[var(--border-color)]";
          const textColor  = accent === "indigo" ? "text-[#0072E5] dark:text-[#75D8FC]" : accent === "red" ? "text-red-600 dark:text-red-400" : accent === "amber" ? "text-amber-600 dark:text-amber-400" : "text-[var(--fg-primary)]";
          return (
            <div key={label} className={`rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 border-l-2 ${leftBorder}`}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={12} className="text-[var(--fg-muted)]" />
                <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] font-semibold">{label}</p>
              </div>
              <p className={`text-2xl font-bold font-mono ${textColor}`}>{value}</p>
            </div>
          );
        })}
      </div>

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
              <p className="text-sm text-[var(--fg-muted)] mb-4">
                The AI could not process this document. Check the file and retry.
              </p>
              <button className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
                Retry extraction &rarr;
              </button>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Deadlines */}
          {withDates.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={13} className="text-[var(--fg-muted)]" />
                <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">
                  Deadlines
                </h3>
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
              <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">
                Risk Breakdown
              </h3>
            </div>
            {clauses.length > 0 ? (
              <div className="space-y-2.5">
                {(["high", "medium", "low"] as const).map((level) => {
                  const count = clauses.filter((c) => c.riskLevel === level).length;
                  const pct   = clauses.length ? Math.round((count / clauses.length) * 100) : 0;
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
    </div>
  );
}
