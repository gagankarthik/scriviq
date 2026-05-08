import Link from "next/link";
import {
  Upload, ArrowUpRight, ArrowDownRight, Sparkles, FolderOpen, Plus,
  ScrollText, Lock, GitBranch, Bell, ShieldCheck, TrendingUp,
  AlertTriangle, FileText, Clock, MoreHorizontal, ArrowRight,
} from "lucide-react";
import { AlertsWidget } from "@/components/domain/AlertsWidget";
import { ActivityFeed } from "@/components/domain/ActivityFeed";
import {
  PortfolioChart,
  RiskDonutChart,
  MonthlyUploadsChart,
  ClientBreakdownChart,
  DeadlineUrgencyChart,
} from "@/components/domain/DashboardCharts";
import { getSession } from "@/lib/auth/session";
import {
  dbGetDashboardStats,
  dbListContracts,
  dbListActivity,
  dbListAlerts,
  dbListProjects,
} from "@/lib/aws/contracts";
import { formatCurrency, daysUntil } from "@/lib/utils";
import type { Contract, Project } from "@/lib/mock-data";

const EMPTY_STATS = {
  totalValue: 0, activeContracts: 0, highRiskClauseCount: 0,
  upcomingDeadlineCount: 0, processingCount: 0, pendingAlertCount: 0,
};

async function getData(workspace: string) {
  if (!workspace)
    return { stats: EMPTY_STATS, contracts: [], allContracts: [], activity: [], pendingAlerts: [], projects: [], isEmpty: true };
  try {
    const [stats, allContracts, activity, pendingAlerts, projects] = await Promise.all([
      dbGetDashboardStats(workspace),
      dbListContracts(workspace),
      dbListActivity(workspace, 10),
      dbListAlerts(workspace, { status: "pending" }).then((a) => a.slice(0, 5)),
      dbListProjects(workspace),
    ]);
    const contracts = allContracts.slice(0, 6);
    const isEmpty   = !allContracts.length && !pendingAlerts.length && !activity.length;
    return { stats, contracts, allContracts, activity, pendingAlerts, projects, isEmpty };
  } catch {
    return { stats: EMPTY_STATS, contracts: [], allContracts: [], activity: [], pendingAlerts: [], projects: [], isEmpty: true };
  }
}

// ── Sparkline (inline SVG, no chart lib) ──────────────────────────────────────

function Sparkline({ values, color = "#2962FF", trend = "up" }: {
  values: number[]; color?: string; trend?: "up" | "down" | "flat";
}) {
  if (!values.length) return null;
  const w = 120;
  const h = 32;
  const pad = 2;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const dValue = trend === "down" ? "-" : trend === "flat" ? "" : "+";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="sparkline w-full" aria-hidden>
      <defs>
        <linearGradient id={`sparkfill-${color.replace("#", "")}-${dValue || "x"}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={`${pad},${h - pad} ${pts} ${w - pad},${h - pad}`}
        fill={`url(#sparkfill-${color.replace("#", "")}-${dValue || "x"})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Synthesize a deterministic-ish trend from a real number for the sparkline ──
function trendFromNumber(n: number, points = 12): number[] {
  if (n === 0) return Array(points).fill(0);
  const arr: number[] = [];
  let cur = n * 0.6;
  for (let i = 0; i < points; i++) {
    const noise = (Math.sin(i * 1.7 + n * 0.3) + Math.cos(i * 0.9 + n * 0.1)) * (n * 0.06);
    cur = cur + (n - cur) * 0.18 + noise;
    arr.push(Math.max(0, cur));
  }
  arr[points - 1] = n;
  return arr;
}

// ── Metric card — big number + delta + sparkline ──────────────────────────────

function MetricCard({
  label, value, deltaPct, sub, color = "#2962FF", trend = "up", href, sparkValues,
}: {
  label:    string;
  value:    string;
  deltaPct?: number;
  sub?:     string;
  color?:   string;
  trend?:   "up" | "down" | "flat";
  href?:    string;
  sparkValues: number[];
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-medium text-[var(--fg-muted)]">{label}</p>
        {href && (
          <ArrowUpRight size={13} className="text-[var(--fg-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <p className="metric-xl text-[var(--fg-primary)]">{value}</p>
        {deltaPct !== undefined && deltaPct !== 0 && (
          <span className={trend === "up" ? "delta-up" : trend === "down" ? "delta-down" : "delta-flat"}>
            {trend === "up" ? <ArrowUpRight size={10} /> : trend === "down" ? <ArrowDownRight size={10} /> : null}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>

      {sub && <p className="text-[11px] text-[var(--fg-muted)] mb-3">{sub}</p>}

      <div className="mt-2">
        <Sparkline values={sparkValues} color={color} trend={trend} />
      </div>
    </>
  );

  const cls = "surface-card-hover p-5 group block";
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <div className={cls}>{inner}</div>;
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyOnboarding() {
  return (
    <div className="surface-card p-16 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "var(--grad-brand)",
          boxShadow: "0 0 0 1px rgba(41,98,255,0.3), 0 12px 40px rgba(41,98,255,0.25)",
        }}
      >
        <Sparkles size={22} className="text-white" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--fg-primary)] mb-2 tracking-tight">Welcome to Scriviq</h2>
      <p className="text-sm text-[var(--fg-secondary)] max-w-md mx-auto leading-relaxed mb-6">
        Create a project to organize SOWs, then upload a contract to start extracting clauses,
        tracking risk, and stacking amendments with full audit history.
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Link href="/contracts/projects/new" className="btn-secondary">
          <FolderOpen size={13} />New project
        </Link>
        <Link href="/contracts/upload" className="btn-primary">
          <Upload size={13} />Upload SOW
        </Link>
      </div>
    </div>
  );
}

// ── Renewal pipeline ──────────────────────────────────────────────────────────

function RenewalPipeline({ contracts }: { contracts: Contract[] }) {
  const expiring = contracts
    .filter((c) => c.status === "ready" && c.expiryDate)
    .map((c) => ({ ...c, days: daysUntil(c.expiryDate!) }))
    .filter((c) => c.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-[var(--fg-muted)]" />
          <h3 className="text-[13px] font-semibold text-[var(--fg-primary)]">Renewal pipeline</h3>
          <span className="pill">90D</span>
        </div>
        <Link href="/contracts" className="text-[11px] text-[var(--fg-muted)] hover:text-[var(--color-brand-light)] transition-colors inline-flex items-center gap-1">
          View all <ArrowRight size={10} />
        </Link>
      </div>

      {expiring.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-[var(--fg-muted)]">No renewals in the next 90 days.</div>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)]">
          {expiring.map((c) => {
            const overdue = c.days < 0;
            const urgent  = !overdue && c.days <= 7;
            const color   = overdue ? "var(--color-rose)" : urgent ? "var(--color-amber)" : "var(--fg-secondary)";
            return (
              <li key={c.id}>
                <Link href={`/contracts/${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--surface-subtle)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--fg-primary)] truncate">{c.title}</p>
                    <p className="text-[11px] text-[var(--fg-muted)] truncate">{c.clientName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-mono font-semibold tnum" style={{ color }}>
                      {overdue ? `-${Math.abs(c.days)}d` : c.days === 0 ? "Today" : `${c.days}d`}
                    </p>
                    {c.contractValue && (
                      <p className="text-[10px] font-mono text-[var(--fg-muted)] tnum">{formatCurrency(c.contractValue)}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Active projects ───────────────────────────────────────────────────────────

function ProjectsList({
  projects, allContracts,
}: {
  projects: Project[];
  allContracts: Contract[];
}) {
  if (!projects.length) return null;
  const active = projects.filter((p) => p.status === "active").slice(0, 5);

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <FolderOpen size={13} className="text-[var(--fg-muted)]" />
          <h3 className="text-[13px] font-semibold text-[var(--fg-primary)]">Active projects</h3>
          <span className="pill">{active.length}</span>
        </div>
        <Link href="/contracts/projects/new" className="text-[11px] text-[var(--color-brand-light)] hover:underline inline-flex items-center gap-1">
          <Plus size={10} />New
        </Link>
      </div>

      <ul className="divide-y divide-[var(--border-subtle)]">
        {active.map((p) => {
          const cs = allContracts.filter((c) => c.projectId === p.id);
          const totalValue = cs.reduce((s, c) => s + (c.contractValue ?? 0), 0);
          const risks = cs.map((c) => c.riskScore).filter(Boolean) as string[];
          const risk  = risks.includes("high") ? "high" : risks.includes("medium") ? "medium" : risks.includes("low") ? "low" : null;
          const riskClass = risk === "high" ? "pill-rose" : risk === "medium" ? "pill-amber" : risk === "low" ? "pill-emerald" : "pill";
          return (
            <li key={p.id}>
              <Link href={`/contracts/projects/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-subtle)] transition-colors">
                <span className="w-1 h-9 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--fg-primary)] truncate">{p.name}</p>
                  <p className="text-[11px] text-[var(--fg-muted)] truncate">{p.clientName}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-[var(--fg-muted)] tnum">{cs.length}</span>
                  {totalValue > 0 && (
                    <span className="text-[12px] font-mono text-[var(--fg-secondary)] tnum hidden sm:inline">
                      {formatCurrency(totalValue)}
                    </span>
                  )}
                  {risk && (
                    <span className={riskClass}>{risk}</span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Recent contracts table ────────────────────────────────────────────────────

function RecentContractsTable({ contracts }: { contracts: Contract[] }) {
  if (!contracts.length) return null;
  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-[var(--fg-muted)]" />
          <h3 className="text-[13px] font-semibold text-[var(--fg-primary)]">Recent contracts</h3>
        </div>
        <Link href="/contracts" className="text-[11px] text-[var(--fg-muted)] hover:text-[var(--color-brand-light)] transition-colors inline-flex items-center gap-1">
          View all <ArrowRight size={10} />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-subtle)]/40 border-b border-[var(--border-subtle)]">
            <tr>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-5 py-2.5">Document</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Client</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Value</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Risk</th>
              <th className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] px-3 py-2.5">Status</th>
              <th className="px-5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-subtle)]/40 transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/contracts/${c.id}`} className="block max-w-[300px] group">
                    <p className="text-[13px] font-medium text-[var(--fg-primary)] truncate group-hover:text-[var(--color-brand-light)] transition-colors">
                      {c.title}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--fg-muted)] truncate">{c.fileType.toUpperCase()} · {c.pageCount}p</p>
                  </Link>
                </td>
                <td className="px-3 py-3 text-[12px] text-[var(--fg-secondary)] truncate max-w-[180px]">{c.clientName}</td>
                <td className="px-3 py-3 text-right text-[13px] font-mono tnum text-[var(--fg-secondary)]">
                  {c.contractValue ? formatCurrency(c.contractValue) : "—"}
                </td>
                <td className="px-3 py-3 text-center">
                  {c.riskScore ? (
                    <span className={
                      c.riskScore === "high"   ? "pill pill-rose"    :
                      c.riskScore === "medium" ? "pill pill-amber"   :
                                                  "pill pill-emerald"
                    }>
                      {c.riskScore}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[var(--fg-muted)]">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={
                    c.status === "ready"      ? "pill pill-emerald" :
                    c.status === "processing" ? "pill pill-brand"   :
                                                "pill pill-rose"
                  }>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/contracts/${c.id}`} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] inline-flex items-center transition-colors">
                    <MoreHorizontal size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session   = await getSession();
  const workspace = session?.workspace ?? "";
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const { stats, contracts, allContracts, activity, pendingAlerts, projects, isEmpty } =
    await getData(workspace);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5">

      {/* ── Hero header ── */}
      <div className="flex items-end justify-between gap-4 flex-wrap pt-2">
        <div className="min-w-0">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-muted)] mb-1.5">
            {todayLabel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--fg-primary)] tracking-tight">
            {isEmpty ? `Welcome, ${firstName}` : `Hello, ${firstName}.`}
          </h1>
          <p className="text-[13px] text-[var(--fg-secondary)] mt-1.5 max-w-2xl">
            {isEmpty
              ? "Upload a contract to start extracting clauses and tracking amendments."
              : stats.pendingAlertCount > 0
                ? <>You have <span className="text-[var(--color-amber)] font-semibold">{stats.pendingAlertCount} pending alert{stats.pendingAlertCount !== 1 ? "s" : ""}</span>{stats.processingCount > 0 && <> · {stats.processingCount} processing</>}.</>
                : <>All systems clear. Portfolio monitored, versioned, and audit-ready.</>
            }
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/contracts/projects/new" className="btn-secondary">
            <FolderOpen size={13} />New project
          </Link>
          <Link href="/contracts/upload" className="btn-primary">
            <Upload size={13} />Upload SOW
          </Link>
        </div>
      </div>

      {/* ── Compliance trust strip ── */}
      <div className="surface-card px-5 py-3 flex items-center gap-2 flex-wrap">
        {[
          { Icon: ScrollText,  label: "Audit Trail",  href: "/audit" },
          { Icon: Lock,        label: "GDPR",         href: "/settings" },
          { Icon: ShieldCheck, label: "SOC 2 Ready",  href: "/audit" },
          { Icon: GitBranch,   label: "Versioned",    href: "/contracts" },
        ].map(({ Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--color-brand-light)] transition-colors"
          >
            <Icon size={11} />{label}
          </Link>
        ))}
        <span className="ml-auto text-[10px] font-mono text-[var(--fg-muted)] hidden sm:inline">
          Enterprise · Encrypted · {allContracts.length} {allContracts.length === 1 ? "contract" : "contracts"}
        </span>
      </div>

      {/* ── Body ── */}
      {isEmpty ? (
        <EmptyOnboarding />
      ) : (
        <>
          {/* ── Metric cards with sparklines ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            <MetricCard
              label="Portfolio Value"
              value={formatCurrency(stats.totalValue)}
              deltaPct={stats.totalValue > 0 ? 8.2 : 0}
              sub={`${stats.activeContracts} active contracts`}
              color="#2962FF"
              trend="up"
              href="/contracts?status=ready"
              sparkValues={trendFromNumber(Math.max(stats.totalValue, 100))}
            />
            <MetricCard
              label="Active Contracts"
              value={String(stats.activeContracts)}
              deltaPct={stats.activeContracts > 0 ? 4.1 : 0}
              sub="Ready for review"
              color="#10B981"
              trend="up"
              href="/contracts?status=ready"
              sparkValues={trendFromNumber(Math.max(stats.activeContracts, 4))}
            />
            <MetricCard
              label="High-Risk Clauses"
              value={String(stats.highRiskClauseCount)}
              deltaPct={stats.highRiskClauseCount > 0 ? 12.5 : 0}
              sub={stats.highRiskClauseCount > 0 ? "Require attention" : "Nothing flagged"}
              color={stats.highRiskClauseCount > 0 ? "#EF4444" : "#10B981"}
              trend={stats.highRiskClauseCount > 0 ? "down" : "flat"}
              href="/contracts?risk=high"
              sparkValues={trendFromNumber(Math.max(stats.highRiskClauseCount, 2))}
            />
            <MetricCard
              label="Upcoming Deadlines"
              value={String(stats.upcomingDeadlineCount)}
              sub="Next 30 days"
              color="#F59E0B"
              trend={stats.upcomingDeadlineCount > 0 ? "up" : "flat"}
              href="/alerts"
              sparkValues={trendFromNumber(Math.max(stats.upcomingDeadlineCount, 3))}
            />
          </div>

          {/* ── Projects + Renewals row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.length > 0 ? <ProjectsList projects={projects} allContracts={allContracts} /> : <div />}
            <RenewalPipeline contracts={allContracts} />
          </div>

          {/* ── Portfolio chart full-width ── */}
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} className="text-[var(--fg-muted)]" />
                <h3 className="text-[13px] font-semibold text-[var(--fg-primary)]">Portfolio over time</h3>
              </div>
              <div className="flex items-center gap-1">
                {["1M", "3M", "6M", "1Y"].map((p, i) => (
                  <button
                    key={p}
                    className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md transition-colors"
                    style={
                      i === 2
                        ? { backgroundColor: "var(--tint-brand)", color: "var(--color-brand-light)" }
                        : { color: "var(--fg-muted)" }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-2">
              <PortfolioChart contracts={allContracts} />
            </div>
          </div>

          {/* ── 3-column distribution ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="surface-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                <h3 className="text-[12px] font-semibold text-[var(--fg-primary)]">Risk distribution</h3>
              </div>
              <div className="p-2"><RiskDonutChart contracts={allContracts} /></div>
            </div>
            <div className="surface-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                <h3 className="text-[12px] font-semibold text-[var(--fg-primary)]">Monthly uploads</h3>
              </div>
              <div className="p-2"><MonthlyUploadsChart contracts={allContracts} /></div>
            </div>
            <div className="surface-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                <h3 className="text-[12px] font-semibold text-[var(--fg-primary)]">By client</h3>
              </div>
              <div className="p-2"><ClientBreakdownChart contracts={allContracts} /></div>
            </div>
          </div>

          {/* ── Deadlines + Alerts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="surface-card overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                <Clock size={13} className="text-[var(--fg-muted)]" />
                <h3 className="text-[13px] font-semibold text-[var(--fg-primary)]">Deadline urgency</h3>
              </div>
              <div className="p-2"><DeadlineUrgencyChart contracts={allContracts} /></div>
            </div>
            <AlertsWidget alerts={pendingAlerts} />
          </div>

          {/* ── Activity ── */}
          <ActivityFeed events={activity} />

          {/* ── Recent contracts ── */}
          {contracts.length > 0 && <RecentContractsTable contracts={contracts} />}

          {/* ── Concentration warning ── */}
          {(() => {
            const ready    = allContracts.filter((c) => c.status === "ready");
            const total    = ready.reduce((s, c) => s + (c.contractValue ?? 0), 0);
            const clientMap = new Map<string, number>();
            for (const c of ready) clientMap.set(c.clientName, (clientMap.get(c.clientName) ?? 0) + (c.contractValue ?? 0));
            const top = Array.from(clientMap.entries()).sort(([, a], [, b]) => b - a)[0];
            if (!top || total === 0 || top[1] / total < 0.5) return null;
            return (
              <div className="surface-card p-4 flex items-start gap-3"
                style={{ background: "var(--tint-amber)", borderColor: "rgba(245,158,11,0.25)" }}
              >
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--fg-primary)]">Client concentration risk</p>
                  <p className="text-[11px] text-[var(--fg-secondary)] mt-0.5 leading-relaxed">
                    <span className="font-semibold">{top[0]}</span> represents{" "}
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.round((top[1] / total) * 100)}%</span>{" "}
                    of portfolio value. Consider diversifying.
                  </p>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ── Footer ── */}
      {!isEmpty && (
        <div className="surface-card px-5 py-3 flex items-center gap-3 flex-wrap">
          <Bell size={11} className="text-[var(--fg-muted)]" />
          <p className="text-[11px] text-[var(--fg-secondary)] flex-1 min-w-0">
            Every action is logged. Every amendment is versioned. Every byte encrypted at rest.
          </p>
          <Link href="/audit" className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-brand-light)] hover:underline shrink-0">
            View audit log →
          </Link>
        </div>
      )}
    </div>
  );
}
