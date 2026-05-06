"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Upload, FileText, FileType2,
  CheckCircle2, Loader2, AlertCircle, Plus, LayoutDashboard,
} from "lucide-react";
import type { Contract } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface Props {
  contracts:     Contract[];
  projectId:     string;
  projectColor:  string;
  projectName:   string;
  mode?:         "inline" | "navigate";
  selectedDocId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: Contract["status"] }) {
  if (status === "processing")
    return <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0 mt-[5px]" />;
  if (status === "error")
    return <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-[5px]" />;
  return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-[5px]" />;
}

function RiskDot({ risk }: { risk: Contract["riskScore"] }) {
  if (!risk) return null;
  const color = risk === "high" ? "#ef4444" : risk === "medium" ? "#f59e0b" : "#10b981";
  return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectDocumentSidebar({
  contracts,
  projectId,
  projectColor,
  projectName,
  mode = "navigate",
  selectedDocId,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const path = usePathname();

  function getHref(c: Contract): string {
    if (mode === "inline") return `/contracts/projects/${projectId}?doc=${c.id}`;
    return `/contracts/${c.id}`;
  }

  function getIsActive(c: Contract): boolean {
    if (mode === "inline") return selectedDocId === c.id;
    return path === `/contracts/${c.id}`;
  }

  const overviewIsActive = mode === "inline" && !selectedDocId;

  return (
    <div
      className="relative hidden lg:flex flex-col bg-[var(--surface-base)] border-r border-[var(--border-subtle)] transition-[width] duration-200 ease-in-out shrink-0 sticky top-0 h-[calc(100vh-4rem)] overflow-hidden self-start"
      style={{ width: expanded ? 248 : 44 }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="absolute -right-3 top-5 z-20 w-6 h-6 rounded-full border border-[var(--border-color)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors shadow-sm"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
      </button>

      {expanded ? (
        /* ── Expanded ── */
        <div className="flex flex-col h-full overflow-hidden w-[248px]">
          {/* Header */}
          <div className="px-3 pt-4 pb-3 border-b border-[var(--border-subtle)] shrink-0">
            <div className="flex items-center gap-2 min-w-0 mb-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />
              <p className="text-xs font-semibold text-[var(--fg-primary)] truncate flex-1">{projectName}</p>
              <span className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded shrink-0">
                {contracts.length}
              </span>
            </div>
            <Link
              href={`/contracts/upload?projectId=${projectId}`}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#0072E5" }}
            >
              <Plus size={12} strokeWidth={2.5} />
              Upload SOW
            </Link>
          </div>

          {/* Document list */}
          <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {/* Project Overview link — inline mode only */}
            {mode === "inline" && (
              <Link
                href={`/contracts/projects/${projectId}`}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-100 group ${
                  overviewIsActive
                    ? "border border-[rgba(0,114,229,0.25)]"
                    : "hover:bg-[var(--surface-subtle)] border border-transparent"
                }`}
                style={overviewIsActive ? { backgroundColor: "rgba(0,114,229,0.08)" } : {}}
              >
                <LayoutDashboard
                  size={13}
                  className={overviewIsActive ? "text-[#0072E5] dark:text-[#75D8FC] shrink-0" : "text-[var(--fg-muted)] shrink-0"}
                />
                <p className={`text-xs font-medium leading-snug ${
                  overviewIsActive ? "text-[#0072E5] dark:text-[#75D8FC]" : "text-[var(--fg-primary)] group-hover:text-[var(--fg-primary)]"
                }`}>
                  Project Overview
                </p>
              </Link>
            )}

            {contracts.length === 0 ? (
              <div className="py-10 text-center px-3">
                <div className="w-10 h-10 rounded-xl border border-dashed border-[var(--border-color)] flex items-center justify-center mx-auto mb-3">
                  <FileText size={16} className="text-[var(--fg-muted)]" />
                </div>
                <p className="text-xs text-[var(--fg-muted)]">No documents yet</p>
              </div>
            ) : (
              contracts.map((c, i) => {
                const isActive = getIsActive(c);
                return (
                  <Link
                    key={c.id}
                    href={getHref(c)}
                    className={`flex items-start gap-2 px-2.5 py-2 rounded-xl transition-all duration-100 group ${
                      isActive
                        ? "border border-[rgba(0,114,229,0.25)]"
                        : "hover:bg-[var(--surface-subtle)] border border-transparent"
                    }`}
                    style={isActive ? { backgroundColor: "rgba(0,114,229,0.08)" } : {}}
                  >
                    <StatusDot status={c.status} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug line-clamp-2 ${
                        isActive ? "text-[#0072E5] dark:text-[#75D8FC]" : "text-[var(--fg-primary)] group-hover:text-[var(--fg-primary)]"
                      }`}>
                        {c.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono text-[var(--fg-muted)] uppercase tracking-wider">
                          {c.fileType}
                        </span>
                        {c.contractValue != null && (
                          <>
                            <span className="text-[9px] text-[var(--fg-muted)]">·</span>
                            <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                              {formatCurrency(c.contractValue)}
                            </span>
                          </>
                        )}
                        {c.riskScore && c.status === "ready" && (
                          <>
                            <span className="text-[9px] text-[var(--fg-muted)]">·</span>
                            <RiskDot risk={c.riskScore} />
                          </>
                        )}
                      </div>
                    </div>
                    {/* Index badge */}
                    <span className="text-[9px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] px-1 py-0.5 rounded shrink-0 mt-0.5">
                      v{i + 1}
                    </span>
                  </Link>
                );
              })
            )}
          </nav>

          {/* Footer — back to project (navigate mode only) */}
          {mode === "navigate" && (
            <div className="shrink-0 px-3 py-3 border-t border-[var(--border-subtle)]">
              <Link
                href={`/contracts/projects/${projectId}`}
                className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
              >
                <ChevronLeft size={11} />
                Back to project
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* ── Collapsed ── */
        <div className="flex flex-col items-center py-4 gap-2 w-[44px]">
          {/* Project color dot */}
          <div
            className="w-4 h-4 rounded-full shrink-0 mb-1"
            style={{ backgroundColor: projectColor }}
            title={projectName}
          />

          {/* Overview icon — inline mode only */}
          {mode === "inline" && (
            <Link
              href={`/contracts/projects/${projectId}`}
              title="Project Overview"
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                overviewIsActive
                  ? "text-[#0072E5]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)]"
              }`}
              style={overviewIsActive ? { backgroundColor: "rgba(0,114,229,0.1)", border: "1px solid rgba(0,114,229,0.2)" } : {}}
            >
              <LayoutDashboard size={13} />
            </Link>
          )}

          <div className="w-5 border-t border-[var(--border-subtle)]" />

          {/* Document icons */}
          {contracts.map((c, i) => {
            const isActive = getIsActive(c);
            return (
              <Link
                key={c.id}
                href={getHref(c)}
                title={`v${i + 1} — ${c.title}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all relative group ${
                  isActive
                    ? "text-[#0072E5]"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)]"
                }`}
                style={isActive ? { backgroundColor: "rgba(0,114,229,0.1)", border: "1px solid rgba(0,114,229,0.2)" } : {}}
              >
                <span className="text-[9px] font-bold font-mono">v{i + 1}</span>
                <StatusDot status={c.status} />
              </Link>
            );
          })}

          <div className="w-5 border-t border-[var(--border-subtle)] mt-1" />

          {/* Upload icon */}
          <Link
            href={`/contracts/upload?projectId=${projectId}`}
            title="Upload SOW"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-muted)] hover:text-[#0072E5] hover:bg-[rgba(0,114,229,0.08)] transition-all"
          >
            <Upload size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
