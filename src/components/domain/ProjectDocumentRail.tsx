"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, Plus, FileText, ChevronLeft, ChevronRight,
  CheckCircle2, Loader2, AlertCircle, GitBranch, ShieldAlert,
} from "lucide-react";
import type { Contract } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export interface DocRailItem {
  contract:        Contract;
  amendmentCount:  number;
  pendingCount:    number;
  conflictCount:   number;
  highRiskCount:   number;
  latestVersion:   number;
  upcomingDue:     number;
}

function StatusIcon({ status }: { status: Contract["status"] }) {
  if (status === "processing")
    return <Loader2 size={11} className="text-[#0072E5] animate-spin shrink-0" />;
  if (status === "error")
    return <AlertCircle size={11} className="text-red-500 shrink-0" />;
  return <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />;
}

export function ProjectDocumentRail({
  items, projectId, projectColor, projectName, clientName,
}: {
  items:        DocRailItem[];
  projectId:    string;
  projectColor: string;
  projectName:  string;
  clientName:   string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [query,     setQuery]     = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "pending">("all");

  const visible = useMemo(() => {
    let xs = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      xs = xs.filter((it) => it.contract.title.toLowerCase().includes(q));
    }
    if (riskFilter === "high")    xs = xs.filter((it) => it.highRiskCount > 0 || it.conflictCount > 0);
    if (riskFilter === "pending") xs = xs.filter((it) => it.pendingCount > 0);
    return xs;
  }, [items, query, riskFilter]);

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col w-[44px] shrink-0 sticky top-0 h-[calc(100vh-4rem)] bg-[var(--surface-base)] border-r border-[var(--border-subtle)] items-center py-3 gap-2">
        <button
          onClick={() => setCollapsed(false)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors"
          title="Expand documents"
        >
          <ChevronRight size={13} />
        </button>
        <div
          className="w-3.5 h-3.5 rounded-full mt-1"
          style={{ backgroundColor: projectColor }}
          title={projectName}
        />
        <span className="text-[9px] font-mono text-[var(--fg-muted)] mt-1">
          {items.length}
        </span>
        <div className="w-5 border-t border-[var(--border-subtle)] my-1" />
        {items.slice(0, 12).map((it) => (
          <Link
            key={it.contract.id}
            href={`/contracts/${it.contract.id}`}
            title={it.contract.title}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-muted)] hover:text-[#0072E5] hover:bg-[rgba(0,114,229,0.08)] transition-colors"
          >
            <FileText size={12} />
          </Link>
        ))}
        <Link
          href={`/contracts/upload?projectId=${projectId}`}
          title="Upload SOW"
          className="mt-auto w-7 h-7 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: "#0072E5" }}
        >
          <Plus size={13} />
        </Link>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-[300px] shrink-0 sticky top-0 h-[calc(100vh-4rem)] bg-[var(--surface-base)] border-r border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-start gap-2.5 mb-3">
          <div
            className="w-3 h-3 rounded-full shrink-0 mt-1"
            style={{ backgroundColor: projectColor }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--fg-primary)] truncate">{projectName}</p>
            <p className="text-[10px] text-[var(--fg-muted)] truncate">{clientName}</p>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors p-0.5"
            title="Collapse documents"
          >
            <ChevronLeft size={13} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-subtle)] pl-7 pr-2.5 py-1.5 text-xs text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1">
          {([
            { key: "all",     label: "All",     count: items.length },
            { key: "high",    label: "Risk",    count: items.filter((i) => i.highRiskCount > 0 || i.conflictCount > 0).length },
            { key: "pending", label: "Pending", count: items.filter((i) => i.pendingCount > 0).length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setRiskFilter(key)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors"
              style={
                riskFilter === key
                  ? { backgroundColor: "rgba(0,114,229,0.12)", color: "#0072E5" }
                  : { color: "var(--fg-muted)" }
              }
            >
              {label}
              <span className="text-[9px] font-mono opacity-70">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload button */}
      <div className="px-3 pt-2 pb-2 shrink-0">
        <Link
          href={`/contracts/upload?projectId=${projectId}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#0072E5" }}
        >
          <Plus size={12} strokeWidth={2.5} />
          Upload document
        </Link>
      </div>

      {/* Document list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {visible.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <FileText size={20} className="mx-auto mb-2 text-[var(--fg-muted)]" />
            <p className="text-xs text-[var(--fg-muted)]">
              {items.length === 0 ? "No documents yet" : "No matches"}
            </p>
          </div>
        ) : (
          visible.map((it, i) => {
            const c = it.contract;
            const ringColor = it.conflictCount > 0
              ? "#ef4444"
              : it.pendingCount > 0
                ? "#f59e0b"
                : c.riskScore === "high"
                  ? "#ef4444"
                  : c.riskScore === "medium"
                    ? "#f59e0b"
                    : "#10b981";
            return (
              <Link
                key={c.id}
                href={`/contracts/${c.id}`}
                className="flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-[var(--surface-subtle)] transition-all border border-transparent hover:border-[var(--border-subtle)] group"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
                  style={{
                    backgroundColor: `${ringColor}14`,
                    border: `1px solid ${ringColor}40`,
                    color: ringColor,
                  }}
                >
                  v{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <StatusIcon status={c.status} />
                    <p className="text-xs font-semibold text-[var(--fg-primary)] truncate flex-1 group-hover:text-[#0072E5] dark:group-hover:text-[#75D8FC] transition-colors">
                      {c.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.contractValue != null && (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                        {formatCurrency(c.contractValue)}
                      </span>
                    )}
                    {it.amendmentCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-amber-600 dark:text-amber-400">
                        <GitBranch size={8} />
                        {it.amendmentCount}
                      </span>
                    )}
                    {it.conflictCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-red-600 dark:text-red-400">
                        <ShieldAlert size={8} />
                        {it.conflictCount}
                      </span>
                    )}
                    {it.pendingCount > 0 && (
                      <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400">
                        {it.pendingCount} pending
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}
