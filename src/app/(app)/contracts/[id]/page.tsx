import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getContractById,
  getContractClauses,
  ALERTS,
  formatCurrency,
  daysUntil,
} from "@/lib/mock-data";
import { RiskBadge, RiskBadgeLarge } from "@/components/domain/RiskBadge";
import { ClauseList } from "@/components/domain/ClauseList";

function ContractStatusBadge({ status }: { status: "processing" | "ready" | "error" }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        Processing
      </span>
    );
  if (status === "ready")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Ready
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-950/40 text-red-400 border border-red-800/30">
      <span className="w-2 h-2 rounded-full bg-red-500" />
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
  const contract = getContractById(id);
  if (!contract) notFound();

  const clauses = getContractClauses(id);
  const contractAlerts = ALERTS.filter((a) => a.contractId === id && a.status !== "dismissed");
  const days = contract.expiryDate ? daysUntil(contract.expiryDate) : null;
  const highRisk = clauses.filter((c) => c.riskLevel === "high");
  const withDates = clauses.filter((c) => c.dueDate);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <Link href="/contracts" className="hover:text-indigo-400 transition-colors">
          Contracts
        </Link>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-xs">{contract.title}</span>
      </div>

      {/* Contract header */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-1">{contract.clientName}</p>
            <h1 className="text-xl font-semibold text-white tracking-tight mb-3">
              {contract.title}
            </h1>
            <div className="flex items-center gap-2.5 flex-wrap">
              <ContractStatusBadge status={contract.status} />
              {contract.riskScore && (
                <RiskBadgeLarge level={contract.riskScore} />
              )}
              <span className="text-xs font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded uppercase">
                {contract.fileType}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {contract.pageCount} pages
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-all">
              ↓ Download
            </button>
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white text-sm transition-all"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* AI Summary */}
        {contract.aiSummary && (
          <div className="mt-5 pt-5 border-t border-slate-800/40">
            <p className="text-[10px] uppercase tracking-wider font-medium text-slate-600 mb-2">
              AI Summary
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
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
            accent: "indigo",
          },
          {
            label: "Total Clauses",
            value: String(clauses.length),
            accent: "slate",
          },
          {
            label: "High-Risk",
            value: String(highRisk.length),
            accent: highRisk.length > 0 ? "red" : "slate",
          },
          {
            label: days !== null ? (days < 0 ? "Expired" : `Expires in`) : "Expiry",
            value:
              days !== null
                ? days < 0
                  ? `${Math.abs(days)}d ago`
                  : days === 0
                  ? "Today"
                  : `${days}d`
                : "—",
            accent: days !== null && days <= 7 ? "amber" : days !== null && days < 0 ? "red" : "slate",
          },
        ].map(({ label, value, accent }) => {
          const leftBorder =
            accent === "indigo" ? "border-l-indigo-500"
            : accent === "red" ? "border-l-red-500"
            : accent === "amber" ? "border-l-amber-500"
            : "border-l-slate-700";
          const textColor =
            accent === "indigo" ? "text-indigo-300"
            : accent === "red" ? "text-red-300"
            : accent === "amber" ? "text-amber-300"
            : "text-slate-300";
          return (
            <div
              key={label}
              className={`rounded-xl border border-slate-800/50 bg-slate-900/20 p-4 border-l-2 ${leftBorder}`}
            >
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">{label}</p>
              <p className={`text-2xl font-semibold font-mono ${textColor}`}>{value}</p>
            </div>
          );
        })}
      </div>

      {/* Main content: clauses + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clause list */}
        <div className="lg:col-span-2">
          {contract.status === "ready" && clauses.length > 0 ? (
            <ClauseList clauses={clauses} />
          ) : contract.status === "processing" ? (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-8 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-slate-300 font-medium mb-1">Extracting clauses…</p>
              <p className="text-sm text-slate-500">This usually takes about 15 seconds.</p>
            </div>
          ) : contract.status === "error" ? (
            <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-8 text-center">
              <p className="text-2xl mb-3">⚠</p>
              <p className="text-slate-300 font-medium mb-1">Extraction failed</p>
              <p className="text-sm text-slate-500 mb-4">
                The AI could not process this document. Please check the file and try again.
              </p>
              <button className="text-xs text-indigo-400 hover:underline">
                Retry extraction →
              </button>
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming deadlines */}
          {withDates.length > 0 && (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Deadlines
              </h3>
              <div className="space-y-3">
                {withDates.map((c) => {
                  const d = daysUntil(c.dueDate!);
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate">{c.title}</p>
                        <p className="text-[10px] text-slate-600 font-mono">
                          {new Date(c.dueDate!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold shrink-0 ${
                          d < 0 ? "text-red-400" : d <= 7 ? "text-amber-400" : "text-slate-500"
                        }`}
                      >
                        {d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Today" : `${d}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alerts */}
          {contractAlerts.length > 0 && (
            <div className="rounded-2xl border border-amber-900/30 bg-amber-950/10 p-5">
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                Active Alerts ({contractAlerts.length})
              </h3>
              <div className="space-y-2">
                {contractAlerts.map((a) => (
                  <div key={a.id} className="text-xs">
                    <p className="text-slate-300">{a.clauseTitle}</p>
                    <p className="text-slate-500 font-mono">
                      {a.type === "overdue" ? "Overdue" : a.type === "1_day" ? "1 day" : "7 days"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk summary */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Risk Breakdown
            </h3>
            {clauses.length > 0 ? (
              <div className="space-y-2">
                {(["high", "medium", "low"] as const).map((level) => {
                  const count = clauses.filter((c) => c.riskLevel === level).length;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <RiskBadge level={level} />
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            level === "high" ? "bg-red-500" : level === "medium" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.round((count / clauses.length) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-slate-500 w-4 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-600">No clauses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
