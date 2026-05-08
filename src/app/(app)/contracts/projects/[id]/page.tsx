import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Upload, FileText, DollarSign, ShieldAlert, Clock,
  GitBranch, GitMerge, Layers, ScrollText, AlertCircle,
  TrendingUp, AlertTriangle, ShieldCheck, Lock, CalendarClock,
  CheckCircle2, ArrowRight, Loader2,
} from "lucide-react";
import {
  dbGetProject, dbListContracts, dbListClauses, dbListAmendments,
  dbGetProjectConsolidation, dbListContractActivity,
} from "@/lib/aws/contracts";
import { getSession } from "@/lib/auth/session";
import {
  formatCurrency, daysUntil, withDerivedVersions, detectAmendmentConflicts, relativeTime,
} from "@/lib/utils";
import { ProjectDocumentRail, type DocRailItem } from "@/components/domain/ProjectDocumentRail";
import { ProjectDocumentIntelligence } from "@/components/domain/ProjectDocumentIntelligence";
import type {
  Contract, Clause, Amendment, ActivityEvent, AmendmentConflict,
} from "@/lib/mock-data";

// ── Aggregated dashboard data ─────────────────────────────────────────────────

interface ProjectAggregate {
  contracts:        Contract[];
  totalValue:       number;
  ready:            number;
  processing:       number;
  /** Per-contract data joined together */
  perDoc:           Map<string, {
    contract:    Contract;
    clauses:     Clause[];
    amendments:  Amendment[];
    conflicts:   AmendmentConflict[];
    activity:    ActivityEvent[];
  }>;
  totalAmendments:  number;
  pendingAmendments:number;
  totalConflicts:   AmendmentConflict[];
  highRiskClauses:  Clause[];
  upcomingClauses:  Clause[];
  allActivity:      ActivityEvent[];
  recentAmendments: Array<{ contract: Contract; amendment: Amendment }>;
}

async function buildAggregate(workspace: string, contracts: Contract[]): Promise<ProjectAggregate> {
  const today = Date.now();
  const in30  = today + 30 * 86_400_000;

  const perDoc = new Map<string, {
    contract: Contract; clauses: Clause[]; amendments: Amendment[];
    conflicts: AmendmentConflict[]; activity: ActivityEvent[];
  }>();

  await Promise.all(contracts.map(async (c) => {
    const [clauses, rawAmendments, activity] = await Promise.all([
      dbListClauses(workspace, c.id).catch(() => []),
      dbListAmendments(workspace, c.id).catch(() => []),
      dbListContractActivity(workspace, c.id, 50).catch(() => []),
    ]);
    const amendments = withDerivedVersions(rawAmendments);
    const conflicts  = detectAmendmentConflicts(amendments);
    perDoc.set(c.id, { contract: c, clauses, amendments, conflicts, activity });
  }));

  const totalValue = contracts.reduce((s, c) => s + (c.contractValue ?? 0), 0);
  const ready      = contracts.filter((c) => c.status === "ready").length;
  const processing = contracts.filter((c) => c.status === "processing").length;

  let totalAmendments    = 0;
  let pendingAmendments  = 0;
  const totalConflicts: AmendmentConflict[] = [];
  const highRiskClauses: Clause[] = [];
  const upcomingClauses: Clause[] = [];
  const allActivity: ActivityEvent[] = [];
  const recentAmendments: Array<{ contract: Contract; amendment: Amendment }> = [];

  for (const [, data] of perDoc) {
    totalAmendments   += data.amendments.length;
    pendingAmendments += data.amendments.filter((a) => a.status === "pending_review").length;
    totalConflicts.push(...data.conflicts);
    highRiskClauses.push(...data.clauses.filter((c) => c.riskLevel === "high" && c.status === "active"));
    for (const cl of data.clauses) {
      if (!cl.dueDate) continue;
      const t = new Date(cl.dueDate).getTime();
      if (t >= today && t <= in30) upcomingClauses.push(cl);
    }
    allActivity.push(...data.activity);
    for (const a of data.amendments) recentAmendments.push({ contract: data.contract, amendment: a });
  }

  allActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  upcomingClauses.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  recentAmendments.sort((a, b) => new Date(b.amendment.uploadedAt).getTime() - new Date(a.amendment.uploadedAt).getTime());

  return {
    contracts, totalValue, ready, processing, perDoc,
    totalAmendments, pendingAmendments, totalConflicts,
    highRiskClauses, upcomingClauses, allActivity, recentAmendments,
  };
}

function buildRailItems(agg: ProjectAggregate): DocRailItem[] {
  return agg.contracts.map((c) => {
    const data = agg.perDoc.get(c.id)!;
    const latestVersion = data.amendments.length
      ? Math.max(1, ...data.amendments.map((a) => a.version ?? 1))
      : 1;
    const today = Date.now();
    const in30  = today + 30 * 86_400_000;
    const upcoming = data.clauses.filter((cl) => {
      if (!cl.dueDate) return false;
      const t = new Date(cl.dueDate).getTime();
      return t >= today && t <= in30;
    }).length;
    return {
      contract:       c,
      amendmentCount: data.amendments.length,
      pendingCount:   data.amendments.filter((a) => a.status === "pending_review").length,
      conflictCount:  data.conflicts.length,
      highRiskCount:  data.clauses.filter((cl) => cl.riskLevel === "high" && cl.status === "active").length,
      latestVersion,
      upcomingDue:    upcoming,
    };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, Icon, href,
}: {
  label: string; value: string; sub?: string;
  color: string; Icon: React.ElementType; href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={14} />
        </div>
      </div>
      <p className="text-xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[var(--fg-muted)] mt-1">{sub}</p>}
    </>
  );
  const cls = "rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 border-l-[3px] transition-all duration-200";
  if (href) {
    return (
      <Link href={href} className={cls + " hover:border-[rgba(0,114,229,0.25)]"} style={{ borderLeftColor: color }}>
        {inner}
      </Link>
    );
  }
  return <div className={cls} style={{ borderLeftColor: color }}>{inner}</div>;
}

function AmendmentActivityFeed({
  recentAmendments,
}: {
  recentAmendments: Array<{ contract: Contract; amendment: Amendment }>;
}) {
  const top = recentAmendments.slice(0, 8);
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <GitBranch size={14} style={{ color: "#0072E5" }} />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Amendment Activity</h3>
        <span className="text-xs text-[var(--fg-muted)] font-mono">
          {recentAmendments.length} total
        </span>
      </div>
      {top.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <GitBranch size={20} className="mx-auto mb-2 text-[var(--fg-muted)]" />
          <p className="text-xs text-[var(--fg-muted)]">No amendments uploaded across these documents yet.</p>
        </div>
      ) : (
        <ul className="relative px-5 py-4">
          <div className="absolute left-[31px] top-6 bottom-6 w-px bg-[var(--border-subtle)]" />
          {top.map(({ contract, amendment }) => {
            const isPending = amendment.status === "pending_review";
            const accepted  = amendment.changes.filter((c) => c.status === "accepted").length;
            const high      = amendment.changes.filter((c) => c.riskLevel === "high").length;
            const ringColor = isPending ? "#f59e0b" : high > 0 ? "#ef4444" : "#10b981";
            return (
              <li key={amendment.id} className="relative flex items-start gap-3 py-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0 z-10 bg-[var(--surface-elevated)]"
                  style={{ border: `2px solid ${ringColor}`, color: ringColor }}
                >
                  v{amendment.version ?? "?"}
                </div>
                <Link href={`/contracts/${contract.id}#amendments`} className="flex-1 min-w-0 group">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[var(--fg-primary)] truncate group-hover:text-[#0072E5] dark:group-hover:text-[#75D8FC] transition-colors">
                      {amendment.title}
                    </p>
                    <span
                      className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0"
                      style={
                        isPending
                          ? { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
                          : { color: "#10b981", backgroundColor: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.25)" }
                      }
                    >
                      {isPending ? "Pending" : "Resolved"}
                    </span>
                    {high > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded border"
                        style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}>
                        <AlertTriangle size={8} />{high} high
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                    <span className="font-medium text-[var(--fg-secondary)]">{contract.title}</span>
                    {" · "}
                    {amendment.changes.length} change{amendment.changes.length !== 1 ? "s" : ""}
                    {!isPending && ` · ${accepted} accepted`}
                    {" · "}
                    {relativeTime(amendment.uploadedAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ConflictsList({
  conflicts, perDoc,
}: {
  conflicts: AmendmentConflict[];
  perDoc:    ProjectAggregate["perDoc"];
}) {
  if (conflicts.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={14} className="text-emerald-500" />
          <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Cross-Document Conflicts</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200/40 dark:border-emerald-900/20">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            No conflicts detected. All pending amendments touch distinct clauses.
          </p>
        </div>
      </div>
    );
  }

  // Find which contract each conflict belongs to via amendmentIds → perDoc lookup
  const contractByAmendmentId = new Map<string, Contract>();
  for (const [, data] of perDoc) {
    for (const a of data.amendments) {
      contractByAmendmentId.set(a.id, data.contract);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-red-200/60 dark:border-red-900/20 flex items-center gap-2">
        <ShieldAlert size={14} className="text-red-600 dark:text-red-400" />
        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Cross-Document Conflicts</h3>
        <span className="text-xs font-mono text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
          {conflicts.length}
        </span>
      </div>
      <div className="px-5 py-4 space-y-2">
        {conflicts.slice(0, 6).map((c) => {
          const contract = contractByAmendmentId.get(c.amendmentIds[0]);
          return (
            <Link
              key={c.id}
              href={contract ? `/contracts/${contract.id}#amendments` : "#"}
              className="flex items-start gap-2 px-3 py-2.5 rounded-lg border bg-[var(--surface-elevated)] hover:border-red-300 dark:hover:border-red-900/50 transition-colors"
              style={{ borderColor: c.severity === "error" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)" }}
            >
              <span className="inline-flex items-center text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0 mt-0.5"
                style={
                  c.severity === "error"
                    ? { color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }
                    : { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }
                }>
                {c.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--fg-primary)] truncate">{c.clauseTitle}</p>
                <p className="text-[11px] text-[var(--fg-secondary)] mt-0.5 line-clamp-1">{c.description}</p>
                {contract && (
                  <p className="text-[10px] text-[var(--fg-muted)] font-mono mt-0.5">in {contract.title}</p>
                )}
              </div>
              <ArrowRight size={11} className="text-[var(--fg-muted)] shrink-0 mt-1" />
            </Link>
          );
        })}
        {conflicts.length > 6 && (
          <p className="text-[10px] text-[var(--fg-muted)] text-center pt-1">
            + {conflicts.length - 6} more conflict{conflicts.length - 6 !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

function UpcomingDeadlines({
  upcoming, perDoc,
}: {
  upcoming: Clause[];
  perDoc:   ProjectAggregate["perDoc"];
}) {
  if (upcoming.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock size={14} className="text-[var(--fg-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Upcoming Deadlines</h3>
        </div>
        <p className="text-xs text-[var(--fg-muted)]">No deadlines in the next 30 days.</p>
      </div>
    );
  }

  // Build clause → contract map
  const contractByClauseId = new Map<string, Contract>();
  for (const [, data] of perDoc) {
    for (const cl of data.clauses) contractByClauseId.set(cl.id, data.contract);
  }

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <CalendarClock size={14} style={{ color: "#f59e0b" }} />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Upcoming Deadlines</h3>
        <span className="text-xs text-[var(--fg-muted)] font-mono">
          next 30 days
        </span>
      </div>
      <div className="px-5 py-4 space-y-2">
        {upcoming.slice(0, 8).map((cl) => {
          const d = daysUntil(cl.dueDate!);
          const contract = contractByClauseId.get(cl.id);
          const color = d <= 1 ? "#ef4444" : d <= 7 ? "#f59e0b" : "#0072E5";
          return (
            <Link
              key={cl.id}
              href={contract ? `/contracts/${contract.id}` : "#"}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-transparent hover:bg-[var(--surface-subtle)] hover:border-[var(--border-subtle)] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--fg-primary)] truncate group-hover:text-[#0072E5] dark:group-hover:text-[#75D8FC] transition-colors">
                  {cl.title}
                </p>
                {contract && (
                  <p className="text-[10px] text-[var(--fg-muted)] truncate">{contract.title}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono font-bold" style={{ color }}>
                  {d === 0 ? "Today" : `${d}d`}
                </p>
                <p className="text-[10px] text-[var(--fg-muted)] font-mono">
                  {new Date(cl.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </Link>
          );
        })}
        {upcoming.length > 8 && (
          <p className="text-[10px] text-[var(--fg-muted)] text-center pt-1">
            + {upcoming.length - 8} more
          </p>
        )}
      </div>
    </div>
  );
}

function DocumentMatrix({ items }: { items: DocRailItem[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <FileText size={14} className="text-[var(--fg-muted)]" />
        <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Document Status Matrix</h3>
        <span className="text-xs text-[var(--fg-muted)] font-mono">{items.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]">
            <tr>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-5 py-2.5">Document</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Value</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Version</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Amend.</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Risk</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Conflicts</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Due Soon</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const c = it.contract;
              return (
                <tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-subtle)] transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/contracts/${c.id}`} className="block max-w-[280px] group">
                      <p className="text-sm font-medium text-[var(--fg-primary)] truncate group-hover:text-[#0072E5] dark:group-hover:text-[#75D8FC] transition-colors">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-[var(--fg-muted)] truncate font-mono">{c.fileType.toUpperCase()} · {c.pageCount}p</p>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-right text-xs font-mono text-[var(--fg-secondary)]">
                    {c.contractValue ? formatCurrency(c.contractValue) : "—"}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-[10px] font-mono font-semibold text-[#0072E5] dark:text-[#75D8FC]">
                      v{it.latestVersion}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {it.amendmentCount > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                        <GitBranch size={9} />{it.amendmentCount}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {it.highRiskCount > 0 ? (
                      <span className="text-[10px] font-mono font-semibold text-red-500">
                        {it.highRiskCount} high
                      </span>
                    ) : c.riskScore ? (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)] uppercase">{c.riskScore}</span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {it.conflictCount > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-red-600 dark:text-red-400">
                        <ShieldAlert size={9} />{it.conflictCount}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {it.upcomingDue > 0 ? (
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                        {it.upcomingDue}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--fg-muted)]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {c.status === "ready" && <CheckCircle2 size={12} className="inline text-emerald-500" />}
                    {c.status === "processing" && <Loader2 size={12} className="inline text-[#0072E5] animate-spin" />}
                    {c.status === "error" && <AlertCircle size={12} className="inline text-red-500" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectAuditFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText size={14} className="text-[var(--fg-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Recent Activity</h3>
        </div>
        <p className="text-xs text-[var(--fg-muted)]">No activity yet across these documents.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ScrollText size={14} style={{ color: "#0072E5" }} />
          <h3 className="text-sm font-semibold text-[var(--fg-primary)]">Project Activity</h3>
          <span className="text-xs text-[var(--fg-muted)] font-mono">{events.length}</span>
        </div>
        <Link href="/audit" className="text-[10px] font-mono uppercase tracking-widest text-[#0072E5] dark:text-[#75D8FC] hover:underline">
          Full audit log →
        </Link>
      </div>
      <ul className="px-5 py-3 space-y-2 max-h-[280px] overflow-y-auto">
        {events.slice(0, 12).map((e) => (
          <li key={e.id} className="flex items-start gap-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--fg-muted)] mt-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--fg-primary)]">{e.actorName ?? e.actorEmail ?? "System"}</span>{" "}
                {e.description}
              </p>
              <p className="text-[10px] text-[var(--fg-muted)] font-mono mt-0.5">{relativeTime(e.timestamp)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }    = await params;
  const session   = await getSession();
  const workspace = session?.workspace ?? "";

  let project: Awaited<ReturnType<typeof dbGetProject>> = null;
  let allContracts: Awaited<ReturnType<typeof dbListContracts>> = [];

  try {
    [project, allContracts] = await Promise.all([
      dbGetProject(workspace, id),
      dbListContracts(workspace, { projectId: id }),
    ]);
  } catch { /* ignore */ }

  if (!project) notFound();

  const consolidation = await dbGetProjectConsolidation(workspace, id).catch(() => null);
  const aggregate     = await buildAggregate(workspace, allContracts);
  const railItems     = buildRailItems(aggregate);

  const totalHigh = aggregate.highRiskClauses.length;

  return (
    <div className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 -mb-4 sm:-mb-6 flex min-h-[calc(100vh-4rem)] bg-[var(--surface-base)]">

      {/* ── Persistent document rail (left) ── */}
      <ProjectDocumentRail
        items={railItems}
        projectId={id}
        projectColor={project.color}
        projectName={project.name}
        clientName={project.clientName}
      />

      {/* ── Aggregated dashboard (right) ── */}
      <div className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top header bar */}
        <div className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--surface-base)]/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/contracts"
                className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0"
              >
                <ArrowLeft size={14} />
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-[var(--fg-primary)] tracking-tight truncate">
                      {project.name}
                    </h1>
                    <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                      style={{ color: "#0072E5", backgroundColor: "rgba(0,114,229,0.08)", borderColor: "rgba(0,114,229,0.25)" }}>
                      Project Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] truncate">
                    {project.clientName}
                    {project.description && <span className="ml-2 opacity-70">— {project.description}</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {[
                { Icon: ScrollText,  label: "Audit",  color: "#0072E5" },
                { Icon: Lock,        label: "GDPR",   color: "#10b981" },
                { Icon: ShieldCheck, label: "SOC 2",  color: "#8b5cf6" },
              ].map(({ Icon, label, color }) => (
                <span
                  key={label}
                  className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-widest border"
                  style={{ color, backgroundColor: `${color}10`, borderColor: `${color}30` }}
                >
                  <Icon size={10} />{label}
                </span>
              ))}
              <Link
                href={`/contracts/upload?projectId=${id}`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-white text-sm font-semibold transition-all"
                style={{ backgroundColor: "#0072E5" }}
              >
                <Upload size={13} strokeWidth={2} />
                Upload
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="px-6 py-6 space-y-6 max-w-[1400px]">

          {/* Empty state */}
          {allContracts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-elevated)] p-16 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: `${project.color}18`, border: `1px solid ${project.color}40` }}
              >
                <Layers size={22} style={{ color: project.color }} />
              </div>
              <h2 className="text-base font-semibold text-[var(--fg-primary)] mb-1">No documents yet in this project</h2>
              <p className="text-sm text-[var(--fg-muted)] max-w-md mx-auto leading-relaxed mb-6">
                Upload your first SOW, change order, or amendment. Scriviq extracts every clause,
                stacks revisions into a versioned timeline, and aggregates every change here.
              </p>
              <Link
                href={`/contracts/upload?projectId=${id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium btn-brand"
              >
                <Upload size={14} />Upload first document
              </Link>
            </div>
          ) : (
            <>
              {/* Conflict banner — top priority */}
              {aggregate.totalConflicts.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/15">
                  <ShieldAlert size={15} className="text-red-600 dark:text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      {aggregate.totalConflicts.length} amendment conflict{aggregate.totalConflicts.length !== 1 ? "s" : ""} across this project
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Two or more pending amendments touch the same clauses. Resolve before applying.
                    </p>
                  </div>
                </div>
              )}

              {/* Stats — 6 mega cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard
                  label="Documents"
                  value={String(allContracts.length)}
                  sub={`${aggregate.ready} ready · ${aggregate.processing} processing`}
                  color={project.color}
                  Icon={FileText}
                />
                <StatCard
                  label="Total Value"
                  value={aggregate.totalValue > 0 ? formatCurrency(aggregate.totalValue) : "—"}
                  sub="across all docs"
                  color="#0072E5"
                  Icon={DollarSign}
                />
                <StatCard
                  label="Amendments"
                  value={String(aggregate.totalAmendments)}
                  sub={aggregate.pendingAmendments > 0 ? `${aggregate.pendingAmendments} pending` : "all resolved"}
                  color={aggregate.pendingAmendments > 0 ? "#f59e0b" : "#10b981"}
                  Icon={GitBranch}
                />
                <StatCard
                  label="Conflicts"
                  value={String(aggregate.totalConflicts.length)}
                  sub={aggregate.totalConflicts.length > 0 ? "needs review" : "none"}
                  color={aggregate.totalConflicts.length > 0 ? "#ef4444" : "#10b981"}
                  Icon={ShieldAlert}
                />
                <StatCard
                  label="High-Risk"
                  value={String(totalHigh)}
                  sub="active clauses"
                  color={totalHigh > 0 ? "#ef4444" : "#10b981"}
                  Icon={AlertTriangle}
                />
                <StatCard
                  label="Due ≤ 30d"
                  value={String(aggregate.upcomingClauses.length)}
                  sub="upcoming"
                  color={aggregate.upcomingClauses.length > 0 ? "#f59e0b" : "var(--fg-muted)"}
                  Icon={Clock}
                />
              </div>

              {/* Row: amendment activity + conflicts + deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AmendmentActivityFeed recentAmendments={aggregate.recentAmendments} />
                <div className="space-y-6">
                  <ConflictsList conflicts={aggregate.totalConflicts} perDoc={aggregate.perDoc} />
                  <UpcomingDeadlines upcoming={aggregate.upcomingClauses} perDoc={aggregate.perDoc} />
                </div>
              </div>

              {/* Document Intelligence (consolidation) */}
              <ProjectDocumentIntelligence
                projectId={id}
                projectColor={project.color}
                initialConsolidation={consolidation}
              />

              {/* Document matrix table */}
              <DocumentMatrix items={railItems} />

              {/* Project audit feed */}
              <ProjectAuditFeed events={aggregate.allActivity} />

              {/* Footer summary */}
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-5 py-4 flex items-center gap-3 flex-wrap">
                <TrendingUp size={13} className="text-[var(--fg-muted)]" />
                <p className="text-xs text-[var(--fg-secondary)] flex-1 min-w-0">
                  Project hub view aggregates every clause, amendment, conflict, and audit event across
                  the {allContracts.length} document{allContracts.length !== 1 ? "s" : ""} in this project.
                  Click a document on the left to drill into its full detail page.
                </p>
                <Link
                  href={`/contracts/upload?projectId=${id}`}
                  className="text-[10px] font-mono uppercase tracking-widest text-[#0072E5] dark:text-[#75D8FC] hover:underline shrink-0"
                >
                  + Add document
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
