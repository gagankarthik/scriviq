"use client";

import { useState } from "react";
import { Shield, SplitSquareHorizontal, List } from "lucide-react";
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

type Category = "" | "payment" | "termination" | "renewal" | "legal" | "other";

const CATEGORY_TABS: { value: Category; label: string }[] = [
  { value: "",            label: "All types" },
  { value: "payment",     label: "Payment" },
  { value: "termination", label: "Termination" },
  { value: "renewal",     label: "Renewal" },
  { value: "legal",       label: "Legal" },
  { value: "other",       label: "Other" },
];

const CATEGORY_TYPES: Record<Exclude<Category, "">, string[]> = {
  payment:     ["payment_milestone"],
  termination: ["termination_notice"],
  renewal:     ["renewal_auto"],
  legal:       ["ip_ownership", "liability_cap", "confidentiality", "governing_law", "dispute_resolution", "force_majeure"],
  other:       ["penalty_clause", "acceptance_criteria", "scope_change", "other"],
};

function matchesCategory(clause: Clause, category: Category): boolean {
  if (!category) return true;
  return CATEGORY_TYPES[category]?.includes(clause.type) ?? false;
}

interface ClauseListProps {
  clauses: Clause[];
}

export function ClauseList({ clauses }: ClauseListProps) {
  const [statusFilter,   setStatusFilter]   = useState<"" | ClauseStatus>("");
  const [riskFilter,     setRiskFilter]     = useState<"" | RiskLevel>("");
  const [categoryFilter, setCategoryFilter] = useState<Category>("");
  const [reviewMode,     setReviewMode]     = useState(false);
  const [statuses,       setStatuses]       = useState<Record<string, Clause["status"]>>({});

  const getCurrent = (cl: Clause): Clause =>
    statuses[cl.id] ? { ...cl, status: statuses[cl.id] } : cl;

  const filtered = clauses.map(getCurrent).filter((c) => {
    if (statusFilter   && c.status    !== statusFilter)          return false;
    if (riskFilter     && c.riskLevel !== riskFilter)            return false;
    if (categoryFilter && !matchesCategory(c, categoryFilter))   return false;
    return true;
  });

  function handleAction(clauseId: string, status: Clause["status"]) {
    setStatuses((prev) => ({ ...prev, [clauseId]: status }));
  }

  // Category badge counts
  const countFor = (cat: Category) =>
    cat ? clauses.filter((c) => matchesCategory(c, cat)).length : clauses.length;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[var(--fg-muted)]" />
            <h2 className="text-sm font-semibold text-[var(--fg-primary)]">
              Extracted Clauses{" "}
              <span className="text-[var(--fg-muted)] font-normal font-mono">
                ({filtered.length}/{clauses.length})
              </span>
            </h2>
          </div>

          {/* Review mode toggle */}
          <button
            onClick={() => setReviewMode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={
              reviewMode
                ? { backgroundColor: "rgba(0,114,229,0.12)", color: "#0072E5", border: "1px solid rgba(0,114,229,0.2)" }
                : { border: "1px solid var(--border-color)", color: "var(--fg-muted)" }
            }
          >
            {reviewMode ? <List size={12} /> : <SplitSquareHorizontal size={12} />}
            {reviewMode ? "List view" : "Review mode"}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {CATEGORY_TABS.map((t) => {
            const count  = countFor(t.value);
            const active = categoryFilter === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setCategoryFilter(t.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0"
                style={
                  active
                    ? { backgroundColor: "#0072E5", color: "#fff" }
                    : { color: "var(--fg-muted)", border: "1px solid transparent" }
                }
              >
                {t.label}
                <span
                  className="text-[10px] px-1 rounded font-mono"
                  style={{
                    backgroundColor: active ? "rgba(255,255,255,0.2)" : "var(--surface-subtle)",
                    color: active ? "#fff" : "var(--fg-muted)",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status + risk filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatusFilter(t.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                style={statusFilter === t.value ? { backgroundColor: "#0072E5", color: "#fff" } : { color: "var(--fg-muted)" }}
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
                style={riskFilter === t.value ? { backgroundColor: "#0072E5", color: "#fff" } : { color: "var(--fg-muted)" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clause list */}
      <div className="p-4 space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((clause) => (
            <ClauseRow
              key={clause.id}
              clause={clause}
              onAction={handleAction}
              reviewMode={reviewMode}
            />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-[var(--fg-muted)] text-sm">No clauses match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
