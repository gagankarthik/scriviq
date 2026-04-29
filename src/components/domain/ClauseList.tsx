"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { type Clause, type RiskLevel, type ClauseStatus } from "@/lib/mock-data";
import { ClauseRow } from "./ClauseRow";

const STATUS_TABS: { value: "" | ClauseStatus; label: string }[] = [
  { value: "",         label: "All" },
  { value: "active",   label: "Active" },
  { value: "actioned", label: "Actioned" },
  { value: "expired",  label: "Expired" },
];

const RISK_TABS: { value: "" | RiskLevel; label: string }[] = [
  { value: "",       label: "All risk" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
];

interface ClauseListProps {
  clauses: Clause[];
}

export function ClauseList({ clauses }: ClauseListProps) {
  const [statusFilter, setStatusFilter] = useState<"" | ClauseStatus>("");
  const [riskFilter,   setRiskFilter]   = useState<"" | RiskLevel>("");
  const [statuses,     setStatuses]     = useState<Record<string, Clause["status"]>>({});

  const getCurrent = (cl: Clause): Clause =>
    statuses[cl.id] ? { ...cl, status: statuses[cl.id] } : cl;

  const filtered = clauses
    .map(getCurrent)
    .filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (riskFilter   && c.riskLevel !== riskFilter)   return false;
      return true;
    });

  function handleAction(clauseId: string, status: Clause["status"]) {
    setStatuses((prev) => ({ ...prev, [clauseId]: status }));
  }

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">
            Extracted Clauses{" "}
            <span className="text-[var(--fg-muted)] font-normal font-mono">
              ({filtered.length}/{clauses.length})
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatusFilter(t.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                style={statusFilter === t.value ? { backgroundColor: "#0072E5", color: "#fff" } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1">
            {RISK_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setRiskFilter(t.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                style={riskFilter === t.value ? { backgroundColor: "#0072E5", color: "#fff" } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="p-4 space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((clause) => (
            <ClauseRow key={clause.id} clause={clause} onAction={handleAction} />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-[var(--fg-muted)] text-sm">No clauses match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
