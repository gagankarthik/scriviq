import Link from "next/link";
import {
  Upload, ArrowRight, FileText, Bell, Sparkles,
  RefreshCw, AlertTriangle, TrendingUp, DollarSign,
  FileCheck2, ShieldAlert, Clock, FolderOpen, Plus,
} from "lucide-react";
import { AlertsWidget } from "@/components/domain/AlertsWidget";
import { ActivityFeed } from "@/components/domain/ActivityFeed";
import { ContractCard } from "@/components/domain/ContractCard";
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

// ── Data ──────────────────────────────────────────────────────────────────────

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
      dbListAlerts(workspace, { status: "pending" }).then(a => a.slice(0, 5)),
      dbListProjects(workspace),
    ]);
    const contracts = allContracts.slice(0, 4);
    const isEmpty   = !allContracts.length && !pendingAlerts.length && !activity.length;
    return { stats, contracts, allContracts, activity, pendingAlerts, projects, isEmpty };
  } catch {
    return { stats: EMPTY_STATS, contracts: [], allContracts: [], activity: [], pendingAlerts: [], projects: [], isEmpty: true };
  }
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, leftColor, textColor, Icon, href,
}: {
  label: string; value: string; sub?: string;
  leftColor: string; textColor: string; Icon: React.ElementType;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">{label}</p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${leftColor}18`, color: leftColor }}
        >
          <Icon size={14} />
        </div>
      </div>
      <p className={`text-lg sm:text-2xl font-bold font-mono tracking-tight ${textColor}`}>{value}</p>
      {sub && <p className="text-xs text-[var(--fg-muted)] mt-1">{sub}</p>}
    </>
  );

  const cls = "rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 border-l-[3px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 block";

  if (href) {
    return (
      <Link
        href={href}
        className={cls + " hover:border-[rgba(0,114,229,0.25)] group"}
        style={{ borderLeftColor: leftColor }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={cls} style={{ borderLeftColor: leftColor }}>
      {inner}
    </div>
  );
}

// ── Empty onboarding ──────────────────────────────────────────────────────────

function EmptyOnboarding() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-12 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: "linear-gradient(135deg, rgba(0,114,229,0.12), rgba(117,216,252,0.06))",
          border: "1px solid rgba(0,114,229,0.2)",
        }}
      >
        <Sparkles size={22} style={{ color: "#0072E5" }} />
      </div>
      <h2 className="text-base font-semibold text-[var(--fg-primary)] mb-2">Your workspace is ready</h2>
      <p className="text-sm text-[var(--fg-muted)] max-w-sm mx-auto leading-relaxed mb-6">
        Create a project to organise your SOWs, then upload contracts to start extracting clauses and tracking risk with AI.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link href="/contracts/projects/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-brand">
          <FolderOpen size={15} />Create a project
        </Link>
        <Link href="/contracts/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-colors">
          <Upload size={15} />Upload directly
        </Link>
      </div>
    </div>
  );
}

// ── Renewal pipeline ──────────────────────────────────────────────────────────

function RenewalPipeline({ contracts }: { contracts: Contract[] }) {
  const expiring = contracts
    .filter(c => c.status === "ready" && c.expiryDate)
    .map(c => ({ ...c, days: daysUntil(c.expiryDate!) }))
    .filter(c => c.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  if (!expiring.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={13} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Renewal Pipeline</h2>
          <span className="text-[9px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded uppercase tracking-widest">
            next 90d
          </span>
        </div>
        <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1">
          All <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-2">
        {expiring.map(c => {
          const overdue  = c.days < 0;
          const urgent   = !overdue && c.days <= 7;
          const warning  = !overdue && !urgent && c.days <= 30;
          const color    = overdue ? "#ef4444" : urgent ? "#f59e0b" : warning ? "#0072E5" : "var(--fg-muted)";
          const bg       = overdue ? "rgba(239,68,68,0.05)" : urgent ? "rgba(245,158,11,0.05)" : warning ? "rgba(0,114,229,0.04)" : "var(--surface-subtle)";
          const border   = overdue ? "rgba(239,68,68,0.18)" : urgent ? "rgba(245,158,11,0.18)" : warning ? "rgba(0,114,229,0.12)" : "var(--border-subtle)";

          return (
            <Link
              key={c.id}
              href={`/contracts/${c.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:border-[rgba(0,114,229,0.25)] transition-colors"
              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--fg-primary)] truncate">{c.title}</p>
                <p className="text-xs text-[var(--fg-muted)] truncate">{c.clientName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold font-mono" style={{ color }}>
                  {overdue ? `${Math.abs(c.days)}d overdue` : c.days === 0 ? "Today" : `${c.days}d`}
                </p>
                {c.contractValue && (
                  <p className="text-[10px] font-mono text-[var(--fg-muted)]">{formatCurrency(c.contractValue)}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Projects overview ─────────────────────────────────────────────────────────

function ProjectsOverview({
  projects,
  allContracts,
}: {
  projects: Project[];
  allContracts: Contract[];
}) {
  if (!projects.length) return null;

  const activeProjects = projects.filter((p) => p.status === "active").slice(0, 6);

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={13} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Projects</h2>
          <span className="text-[9px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded uppercase tracking-widest">
            {activeProjects.length} active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contracts/projects/new"
            className="inline-flex items-center gap-1.5 text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline"
          >
            <Plus size={11} />
            New
          </Link>
          <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1">
            All <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {activeProjects.map((p) => {
          const cs         = allContracts.filter((c) => c.projectId === p.id);
          const totalValue = cs.reduce((s, c) => s + (c.contractValue ?? 0), 0);
          const risks      = cs.map((c) => c.riskScore).filter(Boolean) as string[];
          const risk       = risks.includes("high") ? "high" : risks.includes("medium") ? "medium" : risks.includes("low") ? "low" : null;
          const riskColor  = risk === "high" ? "#ef4444" : risk === "medium" ? "#f59e0b" : risk === "low" ? "#10b981" : "var(--fg-muted)";

          return (
            <Link
              key={p.id}
              href={`/contracts/projects/${p.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-subtle)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
            >
              <div
                className="w-2 h-6 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--fg-primary)] truncate">{p.name}</p>
                <p className="text-[10px] text-[var(--fg-muted)] truncate">{p.clientName}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono text-[var(--fg-muted)]">
                  {cs.length} doc{cs.length !== 1 ? "s" : ""}
                </span>
                {totalValue > 0 && (
                  <span className="text-xs font-mono text-[var(--fg-secondary)] hidden sm:inline">
                    {formatCurrency(totalValue)}
                  </span>
                )}
                {risk && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border"
                    style={{
                      color: riskColor,
                      backgroundColor: `${riskColor}12`,
                      borderColor: `${riskColor}30`,
                    }}
                  >
                    {risk}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {projects.length > 6 && (
        <Link
          href="/contracts"
          className="mt-3 block text-xs text-center text-[var(--fg-muted)] hover:text-[#0072E5] transition-colors"
        >
          +{projects.length - 6} more projects
        </Link>
      )}
    </div>
  );
}

// ── Greeting ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = "Hello";
  return h;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session   = await getSession();
  const workspace = session?.workspace ?? "";
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const { stats, contracts, allContracts, activity, pendingAlerts, projects, isEmpty } =
    await getData(workspace);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {isEmpty ? "No contracts yet — upload one to get started." :
              stats.pendingAlertCount > 0 ? (
                <>
                  You have{" "}
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {stats.pendingAlertCount} pending alert{stats.pendingAlertCount !== 1 ? "s" : ""}
                  </span>
                  {stats.processingCount > 0 && <> and {stats.processingCount} contract{stats.processingCount !== 1 ? "s" : ""} processing</>}.
                </>
              ) : <>All clear &mdash; no pending alerts.</>
            }
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/contracts/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-colors"
          >
            <FolderOpen size={15} />
            New Project
          </Link>
          <Link
            href="/contracts/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold btn-brand"
          >
            <Upload size={15} />
            Upload
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(stats.totalValue)}
          sub="Active contracts"
          leftColor="#0072E5"
          textColor="text-[#0072E5] dark:text-[#75D8FC]"
          Icon={DollarSign}
          href="/contracts?status=ready"
        />
        <StatCard
          label="Active Contracts"
          value={String(stats.activeContracts)}
          sub="Ready for review"
          leftColor="#10b981"
          textColor="text-emerald-600 dark:text-emerald-400"
          Icon={FileCheck2}
          href="/contracts?status=ready"
        />
        <StatCard
          label="High-Risk Clauses"
          value={String(stats.highRiskClauseCount)}
          sub="Require attention"
          leftColor="#ef4444"
          textColor={stats.highRiskClauseCount > 0 ? "text-red-600 dark:text-red-400" : "text-[var(--fg-primary)]"}
          Icon={ShieldAlert}
          href="/contracts?risk=high"
        />
        <StatCard
          label="Upcoming Deadlines"
          value={String(stats.upcomingDeadlineCount)}
          sub="Next 30 days"
          leftColor="#f59e0b"
          textColor={stats.upcomingDeadlineCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--fg-primary)]"}
          Icon={Clock}
          href="/alerts"
        />
      </div>

      {/* ── Projects overview (always shown when projects exist) ── */}
      {projects.length > 0 && (
        <ProjectsOverview projects={projects} allContracts={allContracts} />
      )}

      {isEmpty ? (
        <EmptyOnboarding />
      ) : (
        <>
          {/* ── Row 1: Portfolio area + Risk donut ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioChart contracts={allContracts} />
            </div>
            <div>
              <RiskDonutChart contracts={allContracts} />
            </div>
          </div>

          {/* ── Row 2: Monthly uploads + Client breakdown ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyUploadsChart contracts={allContracts} />
            <ClientBreakdownChart contracts={allContracts} />
          </div>

          {/* ── Row 3: Deadline urgency + Renewal pipeline ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DeadlineUrgencyChart contracts={allContracts} />
            <RenewalPipeline contracts={allContracts} />
          </div>

          {/* ── Row 4: Alerts + Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AlertsWidget alerts={pendingAlerts} />
            </div>
            <div>
              <ActivityFeed events={activity} />
            </div>
          </div>

          {/* ── Row 5: Recent contracts ── */}
          {contracts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-[var(--fg-muted)]" />
                  <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Recent Contracts</h2>
                </div>
                <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {contracts.map(c => (
                  <ContractCard key={c.id} contract={c} />
                ))}
              </div>
            </div>
          )}

          {/* ── Revenue concentration warning ── */}
          {(() => {
            const ready    = allContracts.filter(c => c.status === "ready");
            const total    = ready.reduce((s, c) => s + (c.contractValue ?? 0), 0);
            const clientMap = new Map<string, number>();
            for (const c of ready) clientMap.set(c.clientName, (clientMap.get(c.clientName) ?? 0) + (c.contractValue ?? 0));
            const top = Array.from(clientMap.entries()).sort(([, a], [, b]) => b - a)[0];
            if (!top || total === 0 || top[1] / total < 0.5) return null;
            return (
              <div
                className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--fg-primary)]">{top[0]}</span> represents over{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{Math.round((top[1] / total) * 100)}%</span>{" "}
                  of portfolio value. Consider diversifying to reduce client concentration risk.
                </p>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
