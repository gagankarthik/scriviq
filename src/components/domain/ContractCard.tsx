import Link from "next/link";
import { FileText, FileType2, AlertCircle, Loader2 } from "lucide-react";
import { type Contract } from "@/lib/mock-data";
import { daysUntil, formatCurrency } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";
import { SowTypeBadge } from "./SowTypeBadge";

function StatusPill({ status }: { status: Contract["status"] }) {
  if (status === "processing")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
        style={{ backgroundColor: "rgba(0,114,229,0.1)", color: "#75D8FC", borderColor: "rgba(0,114,229,0.2)" }}
      >
        <Loader2 size={9} className="animate-spin" />
        Processing
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
        <AlertCircle size={9} />
        Error
      </span>
    );
  return null;
}

function FileIcon({ type }: { type: "pdf" | "docx" }) {
  return type === "pdf"
    ? <FileText size={13} className="text-red-500 dark:text-red-400" />
    : <FileType2 size={13} className="text-blue-500 dark:text-blue-400" />;
}

export function ContractCard({ contract, href }: { contract: Contract; href?: string }) {
  const days = contract.expiryDate ? daysUntil(contract.expiryDate) : null;
  const isUrgent  = days !== null && days <= 7 && days >= 0;
  const isExpired = days !== null && days < 0;

  return (
    <Link
      href={href ?? `/contracts/${contract.id}`}
      className="block rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] hover:shadow-lg transition-all duration-200 overflow-hidden group"
      style={{ ["--tw-hover-border" as string]: "rgba(0,114,229,0.3)" }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--fg-muted)] truncate mb-0.5">
              {contract.clientName}
            </p>
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] truncate group-hover:text-[#75D8FC] transition-colors">
              {contract.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {contract.sowType && <SowTypeBadge type={contract.sowType} />}
            {contract.status === "ready" && contract.riskScore && (
              <RiskBadge level={contract.riskScore} />
            )}
            <StatusPill status={contract.status} />
          </div>
        </div>

        {/* Meta */}
        {contract.status === "ready" && (
          <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--fg-muted)] mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <span className="flex items-center gap-1">
              <FileIcon type={contract.fileType} />
              <span className="font-mono">{contract.fileType.toUpperCase()}</span>
            </span>
            <span className="font-mono">{contract.clauseCount} clauses</span>
            {contract.contractValue && (
              <span className="font-mono font-semibold text-[var(--fg-secondary)]">
                {formatCurrency(contract.contractValue)}
              </span>
            )}
            {days !== null && (
              <span
                className={`ml-auto font-mono font-medium ${
                  isExpired
                    ? "text-red-500 dark:text-red-400"
                    : isUrgent
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-[var(--fg-muted)]"
                }`}
              >
                {isExpired
                  ? "Expired"
                  : days === 0
                  ? "Expires today"
                  : `${days}d left`}
              </span>
            )}
          </div>
        )}

        {contract.status === "processing" && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full w-1/2 rounded-full animate-pulse" style={{ backgroundColor: "#0072E5" }} />
            </div>
            <p className="text-xs text-[var(--fg-muted)] mt-1.5">
              Extracting clauses with AI…
            </p>
          </div>
        )}

        {contract.status === "error" && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-red-500 dark:text-red-400">
              Extraction failed — click to retry
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
