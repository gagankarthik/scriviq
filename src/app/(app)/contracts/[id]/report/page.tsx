"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Printer, Loader2, AlertCircle,
  DollarSign, Calendar, Users, Layers, GitBranch,
  Zap, Clock, CheckCircle2, Circle, TrendingUp,
  Shield, AlertTriangle, Activity, Link2,
  ChevronDown, ChevronRight, Building2, FileText,
} from "lucide-react";
import type { Contract, Clause } from "@/lib/mock-data";
import type { ReportData, Phase, WbsItem, Resource, Integration, KeyDate } from "@/app/api/contracts/[id]/report/route";
import { clauseTypeLabel, formatCurrency } from "@/lib/utils";
import { SowTypeBadge } from "@/components/domain/SowTypeBadge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysFrom(iso: string) {
  const d = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return "Today";
  return `in ${d}d`;
}

const RISK_COLOR: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#10b981",
};

const DATE_TYPE_STYLE: Record<KeyDate["type"], { color: string; bg: string; border: string; label: string }> = {
  milestone: { color: "#0072E5", bg: "rgba(0,114,229,0.08)",   border: "rgba(0,114,229,0.2)",   label: "Milestone" },
  payment:   { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  label: "Payment"   },
  deadline:  { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   label: "Deadline"  },
  review:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)",  label: "Review"    },
};

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ id, icon: Icon, title, count, children, color = "#0072E5" }: {
  id?: string; icon: React.ElementType; title: string; count?: number;
  children: React.ReactNode; color?: string;
}) {
  return (
    <section id={id} className="space-y-4 print:break-inside-avoid">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <h2 className="text-base font-bold text-[var(--fg-primary)]">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
            {count}
          </span>
        )}
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>
      {children}
    </section>
  );
}

// ── Financial summary ─────────────────────────────────────────────────────────

function FinancialSection({ contract, clauses }: { contract: Contract; clauses: Clause[] }) {
  const allMilestones = clauses.filter((c) => c.type === "payment_milestone");
  const grossSum = allMilestones.reduce((s, c) => s + (c.amount ?? 0), 0);

  // Drop any clause whose amount ≈ sum of all other milestones (it's a "Total" summary line)
  const milestones = allMilestones
    .filter((c) => {
      if (!c.amount || grossSum <= 0) return true;
      const othersSum = grossSum - c.amount;
      return !(othersSum > 0 && Math.abs(c.amount - othersSum) / othersSum < 0.02);
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const total = milestones.reduce((s, c) => s + (c.amount ?? 0), 0)
    || contract.contractValue
    || 0;

  return (
    <Section icon={DollarSign} title="Financial Overview" color="#10b981">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total value card */}
        <div className="sm:col-span-1 rounded-2xl border bg-[var(--surface-elevated)] p-5"
          style={{ borderColor: "rgba(16,185,129,0.3)", borderLeftWidth: 3, borderLeftColor: "#10b981" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-1">Total Contract Value</p>
          <p className="text-3xl font-bold font-mono" style={{ color: "#10b981" }}>
            {total > 0 ? formatCurrency(total) : "—"}
          </p>
          {milestones.length > 0 && (
            <p className="text-xs text-[var(--fg-muted)] mt-1">{milestones.length} payment milestone{milestones.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Milestones */}
        <div className="sm:col-span-2 space-y-2">
          {milestones.length > 0 ? (
            <>
              {/* Progress bar */}
              {total > 0 && (
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
                  {milestones.map((m, i) => {
                    const pct = total > 0 ? ((m.amount ?? 0) / total) * 100 : 0;
                    const colors = ["#0072E5", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
                    return (
                      <div key={m.id} className="rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length], minWidth: pct > 0 ? "2px" : 0 }}
                        title={`${m.title}: ${formatCurrency(m.amount ?? 0)}`}
                      />
                    );
                  })}
                </div>
              )}
              {milestones.map((m, i) => {
                const colors = ["#0072E5", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
                const pct = total > 0 ? Math.round(((m.amount ?? 0) / total) * 100) : 0;
                const days = m.dueDate ? Math.round((new Date(m.dueDate).getTime() - Date.now()) / 86400000) : null;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--fg-primary)] truncate">{m.title}</p>
                      {m.dueDate && (
                        <p className="text-[10px] text-[var(--fg-muted)] font-mono">{fmtDate(m.dueDate)}</p>
                      )}
                    </div>
                    {pct > 0 && (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">{pct}%</span>
                    )}
                    {m.amount && (
                      <span className="text-sm font-bold font-mono shrink-0" style={{ color: colors[i % colors.length] }}>
                        {formatCurrency(m.amount)}
                      </span>
                    )}
                    {days !== null && (
                      <span className={`text-[10px] font-mono shrink-0 ${days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-[var(--fg-muted)]"}`}>
                        {daysFrom(m.dueDate!)}
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-[var(--fg-muted)] py-2">No payment milestones extracted.</p>
          )}
        </div>
      </div>
    </Section>
  );
}

// ── Phases ────────────────────────────────────────────────────────────────────

function PhasesSection({ phases }: { phases: Phase[] }) {
  if (!phases.length) return null;

  const phaseColors = ["#0072E5", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <Section icon={Layers} title="Project Phases" count={phases.length} color="#8b5cf6">
      <div className="space-y-4">
        {phases.map((phase, i) => {
          const color = phaseColors[i % phaseColors.length];
          return (
            <div key={phase.id}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden"
              style={{ borderLeftWidth: 3, borderLeftColor: color }}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-widest"
                        style={{ color }}>Phase {i + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--fg-primary)] mb-1">{phase.name}</h3>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{phase.description}</p>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    {phase.budget != null && phase.budget > 0 && (
                      <div>
                        <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Budget</p>
                        <p className="text-lg font-bold font-mono" style={{ color }}>{formatCurrency(phase.budget)}</p>
                      </div>
                    )}
                    {(phase.startDate || phase.endDate) && (
                      <div>
                        <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Timeline</p>
                        <p className="text-xs font-mono text-[var(--fg-secondary)]">
                          {phase.startDate ? fmtShort(phase.startDate) : "?"}
                          {" — "}
                          {phase.endDate ? fmtShort(phase.endDate) : "?"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {phase.deliverables.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Deliverables</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables.map((d, j) => (
                        <span key={j}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border"
                          style={{ color, backgroundColor: `${color}10`, borderColor: `${color}30` }}>
                          <CheckCircle2 size={10} />
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function TimelineSection({ keyDates, clauses }: { keyDates: KeyDate[]; clauses: Clause[] }) {
  const datedClauses = clauses.filter((c) => c.dueDate && c.type !== "payment_milestone");
  const clauseDates: KeyDate[] = datedClauses.map((c) => ({
    event: c.title,
    date:  c.dueDate!,
    type:  c.type === "termination_notice" ? "deadline" : c.type === "renewal_auto" ? "review" : "milestone",
  }));

  const all = [...keyDates, ...clauseDates]
    .filter((d, i, arr) => arr.findIndex((x) => x.date === d.date && x.event === d.event) === i)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!all.length) return null;

  const now = Date.now();
  // If 80%+ of dates are in the past, treat this as a historical document
  const pastCount    = all.filter((d) => new Date(d.date).getTime() < now).length;
  const isHistorical = pastCount / all.length >= 0.8;

  return (
    <Section icon={Clock} title="Timeline" count={all.length} color="#0072E5">
      {isHistorical && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs text-[var(--fg-muted)] mb-1">
          <Calendar size={11} />
          Historical document — dates shown reflect the original contract terms
        </div>
      )}
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[var(--border-subtle)]" />

        <div className="space-y-3 pl-0">
          {all.map((d, i) => {
            const ts      = new Date(d.date).getTime();
            const isPast  = ts < now;
            const isNear  = !isPast && ts - now < 7 * 86400000;
            const s       = DATE_TYPE_STYLE[d.type] ?? DATE_TYPE_STYLE.milestone;
            // Historical mode: show all as completed steps, not greyed-out
            const showActive = isHistorical || !isPast;

            return (
              <div key={i} className="flex items-start gap-4">
                <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2"
                  style={{
                    borderColor:     showActive ? s.border : "var(--border-subtle)",
                    backgroundColor: showActive ? s.bg    : "var(--surface-subtle)",
                  }}>
                  {isPast && !isHistorical
                    ? <CheckCircle2 size={14} className="text-[var(--fg-muted)]" />
                    : isPast && isHistorical
                    ? <CheckCircle2 size={14} style={{ color: s.color }} />
                    : <Circle size={14} style={{ color: s.color }} />
                  }
                </div>

                <div className={`flex-1 min-w-0 rounded-xl border p-3 -mt-0.5 ${isNear ? "shadow-sm" : ""}`}
                  style={{
                    borderColor:     showActive ? s.border : "var(--border-subtle)",
                    backgroundColor: showActive ? s.bg    : "transparent",
                  }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                          style={{ color: s.color, borderColor: s.border, backgroundColor: s.bg }}>
                          {s.label}
                        </span>
                        {isNear && (
                          <span className="text-[9px] font-bold font-mono uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 px-1.5 py-0.5 rounded">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[var(--fg-primary)]">{d.event}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono text-[var(--fg-secondary)] font-semibold">{fmtDate(d.date)}</p>
                      {!isHistorical && (
                        <p className={`text-[10px] font-mono mt-0.5 ${isPast ? "text-[var(--fg-muted)]" : isNear ? "text-amber-600 font-semibold" : "text-[var(--fg-muted)]"}`}>
                          {daysFrom(d.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ── WBS ───────────────────────────────────────────────────────────────────────

function WbsSection({ wbs, phases }: { wbs: WbsItem[]; phases: Phase[] }) {
  if (!wbs.length) return null;

  const phaseColors: Record<string, string> = {};
  const colors = ["#0072E5", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  phases.forEach((p, i) => { phaseColors[p.name] = colors[i % colors.length]; });

  const grouped = wbs.reduce<Record<string, WbsItem[]>>((acc, item) => {
    const key = item.phase || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <Section icon={GitBranch} title="Work Breakdown Structure" count={wbs.length} color="#f59e0b">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] pb-2 pr-4 w-6">ID</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] pb-2 pr-4">Task</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] pb-2 pr-4">Phase</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] pb-2 pr-4">Effort</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] pb-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([phase, items]) => (
              <>
                <tr key={`ph-${phase}`}>
                  <td colSpan={5} className="pt-3 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{
                        color:           phaseColors[phase] ?? "#0072E5",
                        backgroundColor: `${phaseColors[phase] ?? "#0072E5"}12`,
                      }}>
                      {phase}
                    </span>
                  </td>
                </tr>
                {items.map((item, j) => (
                  <tr key={item.id} className={`border-b border-[var(--border-subtle)] last:border-0 ${j % 2 === 0 ? "bg-[var(--surface-subtle)]/30" : ""}`}>
                    <td className="py-2 pr-4 font-mono text-xs text-[var(--fg-muted)]">{item.id}</td>
                    <td className="py-2 pr-4 text-sm text-[var(--fg-primary)] font-medium">{item.task}</td>
                    <td className="py-2 pr-4">
                      <span className="text-[10px] font-mono" style={{ color: phaseColors[item.phase] ?? "var(--fg-muted)" }}>
                        {item.phase}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs font-mono text-[var(--fg-secondary)]">{item.effort ?? "—"}</td>
                    <td className="py-2 text-xs text-[var(--fg-muted)] max-w-[200px] truncate">{item.notes ?? "—"}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ── Resources ─────────────────────────────────────────────────────────────────

function ResourcesSection({ resources }: { resources: Resource[] }) {
  if (!resources.length) return null;

  return (
    <Section icon={Users} title="Resources" count={resources.length} color="#06b6d4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((r, i) => (
          <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: "rgba(6,182,212,0.12)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.25)" }}>
                {r.role.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--fg-primary)] truncate">{r.role}</p>
                {r.allocation && (
                  <p className="text-[10px] font-mono text-[var(--fg-muted)]">{r.allocation}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">{r.responsibilities}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

function IntegrationsSection({ integrations }: { integrations: Integration[] }) {
  if (!integrations.length) return null;

  return (
    <Section icon={Link2} title="Integrations & Systems" count={integrations.length} color="#8b5cf6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {integrations.map((int, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Zap size={14} style={{ color: "#8b5cf6" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-semibold text-[var(--fg-primary)]">{int.name}</p>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#8b5cf6] bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)] px-1.5 py-0.5 rounded">
                  {int.type}
                </span>
              </div>
              <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">{int.purpose}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Key Terms ─────────────────────────────────────────────────────────────────

function KeyTermsSection({ clauses }: { clauses: Clause[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const IMPORTANT_TYPES = ["ip_ownership", "liability_cap", "termination_notice", "confidentiality", "governing_law", "dispute_resolution", "force_majeure", "acceptance_criteria", "penalty_clause"];
  const keyTermClauses = clauses.filter((c) => IMPORTANT_TYPES.includes(c.type));

  if (!keyTermClauses.length) return null;

  const grouped = keyTermClauses.reduce<Record<string, Clause[]>>((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {});

  return (
    <Section icon={FileText} title="Key Terms & Conditions" count={keyTermClauses.length} color="#0072E5">
      <div className="space-y-3">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
            <button
              onClick={() => setExpanded((p) => ({ ...p, [type]: !p[type] }))}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-subtle)] transition-colors"
            >
              <span className="text-xs font-semibold text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 rounded uppercase tracking-wide">
                {clauseTypeLabel(type as never)}
              </span>
              <span className="text-sm font-medium text-[var(--fg-primary)] flex-1 min-w-0 truncate">
                {items.length === 1 ? items[0].title : `${items.length} clauses`}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  color:           RISK_COLOR[items[0].riskLevel],
                  backgroundColor: `${RISK_COLOR[items[0].riskLevel]}12`,
                }}>
                {items[0].riskLevel}
              </span>
              {expanded[type] ? <ChevronDown size={13} className="shrink-0 text-[var(--fg-muted)]" /> : <ChevronRight size={13} className="shrink-0 text-[var(--fg-muted)]" />}
            </button>

            {expanded[type] && (
              <div className="border-t border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                {items.map((clause) => (
                  <div key={clause.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--fg-primary)]">{clause.title}</p>
                      {clause.noticeDays && (
                        <span className="text-xs font-mono text-[var(--fg-muted)] shrink-0">{clause.noticeDays}d notice</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{clause.summary}</p>
                    {clause.riskReason && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                        <span>{clause.riskReason}</span>
                      </div>
                    )}
                    {clause.rawText && (
                      <p className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] rounded p-2 leading-relaxed line-clamp-3">
                        {clause.rawText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Risk summary ──────────────────────────────────────────────────────────────

function RiskSection({ clauses }: { clauses: Clause[] }) {
  const high   = clauses.filter((c) => c.riskLevel === "high");
  const medium = clauses.filter((c) => c.riskLevel === "medium");
  const low    = clauses.filter((c) => c.riskLevel === "low");
  const total  = clauses.length;

  return (
    <Section icon={Shield} title="Risk Summary" color="#ef4444">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Breakdown bars */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 space-y-3">
          {([["high", high, "#ef4444"], ["medium", medium, "#f59e0b"], ["low", low, "#10b981"]] as const).map(([level, items, color]) => (
            <div key={level} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold capitalize" style={{ color }}>{level} risk</span>
                <span className="font-mono text-[var(--fg-muted)]">{items.length}/{total}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${total > 0 ? (items.length / total) * 100 : 0}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top risks */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Top risks to watch</p>
          {high.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-start gap-2 p-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/10">
              <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--fg-primary)] truncate">{c.title}</p>
                {c.riskReason && <p className="text-xs text-[var(--fg-muted)] mt-0.5 line-clamp-2">{c.riskReason}</p>}
              </div>
            </div>
          ))}
          {high.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/10">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">No high-risk clauses — looking good.</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ── Main report ───────────────────────────────────────────────────────────────

interface ReportPayload {
  contract:   Contract;
  clauses:    Clause[];
  reportData: ReportData;
}

export default function ContractReportPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [data,    setData]    = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/contracts/${params.id}/report`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Failed to generate report — please try again."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-[#0072E5]/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0072E5] animate-spin" />
          <div className="absolute inset-1 rounded-full border border-[#8b5cf6]/20 border-t-transparent animate-spin" style={{ animationDuration: "2.4s", animationDirection: "reverse" }} />
          <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,114,229,0.1)" }}>
            <Activity size={18} style={{ color: "#0072E5" }} />
          </div>
        </div>
        <div className="text-center max-w-xs">
          <p className="text-sm font-semibold text-[var(--fg-primary)]">Building your report…</p>
          <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
            GPT-4o is reading all extracted clauses and deriving phases, WBS, resources, timelines, and integrations.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-[10px] font-mono text-[var(--fg-muted)]">
            {["Phases", "WBS", "Timeline", "Resources"].map((s, i) => (
              <span key={s} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#0072E5", animationDelay: `${i * 0.3}s` }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={36} className="text-red-500" />
        <p className="text-sm text-[var(--fg-muted)]">{error}</p>
        <button onClick={() => router.back()} className="text-xs text-[#0072E5] hover:underline">← Go back</button>
      </div>
    );
  }

  const { contract, clauses, reportData } = data;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)]/90 backdrop-blur-md shadow-sm print:hidden">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
        >
          <ArrowLeft size={13} />
          Back
        </button>
        <div className="w-px h-4 bg-[var(--border-subtle)]" />
        <p className="text-sm font-semibold text-[var(--fg-primary)] flex-1 truncate">{contract.title}</p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-all"
        >
          <Printer size={12} />
          Print / PDF
        </button>
      </div>

      <div ref={printRef} className="space-y-10 pb-16">
        {/* ── Cover ─────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden print:border-none">
          {/* Top accent band */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #0072E5 0%, #8b5cf6 40%, #10b981 100%)" }} />

          <div className="p-8 sm:p-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                    Analysed Document
                  </span>
                  {contract.sowType && <SowTypeBadge type={contract.sowType} />}
                  {contract.riskScore && (
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border"
                      style={{
                        color:            RISK_COLOR[contract.riskScore],
                        backgroundColor:  `${RISK_COLOR[contract.riskScore]}10`,
                        borderColor:      `${RISK_COLOR[contract.riskScore]}30`,
                      }}>
                      {contract.riskScore} risk
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--fg-primary)] tracking-tight mb-2">
                  {contract.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                  <Building2 size={13} className="text-[var(--fg-muted)]" />
                  <span className="font-medium">{contract.clientName}</span>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-right shrink-0">
                {[
                  { label: "Contract Value", value: contract.contractValue ? formatCurrency(contract.contractValue) : "—" },
                  { label: "Clauses",        value: `${clauses.length} extracted` },
                  { label: "Contract Period",value: reportData.contractPeriod ?? (contract.expiryDate ? `Until ${fmtDate(contract.expiryDate)}` : "—") },
                  { label: "Report Date",    value: today },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--fg-muted)]">{label}</p>
                    <p className="text-sm font-semibold text-[var(--fg-primary)] font-mono">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {(contract.aiSummary || reportData.projectSummary) && (
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-2">Executive Summary</p>
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-3xl">
                  {reportData.projectSummary || contract.aiSummary}
                </p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {reportData.estimatedDuration && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
                      <Clock size={11} />
                      <span>Duration: <span className="font-semibold text-[var(--fg-secondary)]">{reportData.estimatedDuration}</span></span>
                    </div>
                  )}
                  {reportData.contractPeriod && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--fg-muted)]">
                      <Calendar size={11} />
                      <span>Period: <span className="font-semibold text-[var(--fg-secondary)]">{reportData.contractPeriod}</span></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick stats band */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { label: "Phases",       value: reportData.phases.length       || "—", color: "#8b5cf6", Icon: Layers },
                { label: "WBS Items",    value: reportData.wbs.length           || "—", color: "#f59e0b", Icon: GitBranch },
                { label: "Resources",    value: reportData.resources.length     || "—", color: "#06b6d4", Icon: Users },
                { label: "Integrations", value: reportData.integrations.length  || "—", color: "#8b5cf6", Icon: Zap },
              ].map(({ label, value, color, Icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
                    <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider leading-none">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sections ───────────────────────────────────────────────── */}
        <FinancialSection contract={contract} clauses={clauses} />
        <PhasesSection phases={reportData.phases} />
        <TimelineSection keyDates={reportData.keyDates} clauses={clauses} />
        <WbsSection wbs={reportData.wbs} phases={reportData.phases} />
        <ResourcesSection resources={reportData.resources} />
        <IntegrationsSection integrations={reportData.integrations} />
        <KeyTermsSection clauses={clauses} />
        <RiskSection clauses={clauses} />

        {/* Footer */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--fg-muted)] font-mono">
          <span>Scriviq — {contract.title}</span>
          <span>Generated {today}</span>
        </div>
      </div>
    </div>
  );
}
