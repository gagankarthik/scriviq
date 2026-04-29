import Link from "next/link";
import { type Contract, daysUntil, formatCurrency } from "@/lib/mock-data";
import { RiskBadge } from "./RiskBadge";

function StatusPill({ status }: { status: Contract["status"] }) {
  if (status === "processing")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Processing
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Error
      </span>
    );
  return null;
}

export function ContractCard({ contract }: { contract: Contract }) {
  const days = contract.expiryDate ? daysUntil(contract.expiryDate) : null;
  const isUrgent = days !== null && days <= 7;
  const isExpired = days !== null && days < 0;

  return (
    <Link
      href={`/contracts/${contract.id}`}
      className="block rounded-2xl border border-slate-800/60 bg-slate-900/20 hover:bg-slate-900/50 hover:border-slate-700/60 transition-all duration-200 overflow-hidden group"
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate mb-0.5">{contract.clientName}</p>
            <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-white transition-colors">
              {contract.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {contract.status === "ready" && contract.riskScore && (
              <RiskBadge level={contract.riskScore} />
            )}
            <StatusPill status={contract.status} />
          </div>
        </div>

        {/* Meta strip */}
        {contract.status === "ready" && (
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800/40">
            <span className="font-mono">{contract.clauseCount} clauses</span>
            {contract.contractValue && (
              <span className="font-mono font-medium text-slate-400">
                {formatCurrency(contract.contractValue)}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider bg-slate-800/60 px-1.5 py-0.5 rounded font-mono">
              {contract.fileType.toUpperCase()}
            </span>
            {days !== null && (
              <span
                className={`ml-auto font-mono ${
                  isExpired
                    ? "text-red-400"
                    : isUrgent
                    ? "text-amber-400"
                    : "text-slate-500"
                }`}
              >
                {isExpired
                  ? "Expired"
                  : days === 0
                  ? "Expires today"
                  : `Expires in ${days}d`}
              </span>
            )}
          </div>
        )}

        {contract.status === "processing" && (
          <div className="mt-3 pt-3 border-t border-slate-800/40">
            <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full w-1/2 bg-indigo-600/60 rounded-full animate-pulse" />
            </div>
            <p className="text-xs text-slate-600 mt-1.5">Extracting clauses…</p>
          </div>
        )}

        {contract.status === "error" && (
          <div className="mt-3 pt-3 border-t border-slate-800/40">
            <p className="text-xs text-red-500/80">
              Extraction failed — click to retry
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
