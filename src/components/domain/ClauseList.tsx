"use client";

import { useState } from "react";
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
  const [riskFilter, setRiskFilter] = useState<"" | RiskLevel>("");

  const filtered = clauses.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (riskFilter && c.riskLevel !== riskFilter) return false;
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 overflow-hidden">
      {/* Header + filters */}
      <div className="px-5 py-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Extracted Clauses{" "}
            <span className="text-slate-500 font-normal font-mono">
              ({filtered.length}/{clauses.length})
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-900/60 border border-slate-800/40 p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatusFilter(t.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                  statusFilter === t.value
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Risk tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-900/60 border border-slate-800/40 p-1">
            {RISK_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setRiskFilter(t.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                  riskFilter === t.value
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clause rows */}
      <div className="p-4 space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((clause) => (
            <ClauseRow key={clause.id} clause={clause} />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-slate-500 text-sm">No clauses match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
