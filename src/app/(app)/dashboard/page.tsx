import Link from "next/link";
import { Upload, ArrowRight, FileText, Bell, Sparkles, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { StatsBar } from "@/components/domain/StatsBar";
import { AlertsWidget } from "@/components/domain/AlertsWidget";
import { ActivityFeed } from "@/components/domain/ActivityFeed";
import { ContractCard } from "@/components/domain/ContractCard";
import { getSession } from "@/lib/auth/session";
import {
  dbGetDashboardStats,
  dbListContracts,
  dbListActivity,
  dbListAlerts,
} from "@/lib/aws/contracts";
import { formatCurrency, daysUntil } from "@/lib/utils";
import type { Contract } from "@/lib/mock-data";

const EMPTY_STATS = {
  totalValue:            0,
  activeContracts:       0,
  highRiskClauseCount:   0,
  upcomingDeadlineCount: 0,
  processingCount:       0,
  pendingAlertCount:     0,
};

async function getData(workspace: string) {
  if (!workspace) {
    return { stats: EMPTY_STATS, contracts: [], allContracts: [], activity: [], pendingAlerts: [], isEmpty: true };
  }
  try {
    const [stats, allContracts, activity, pendingAlerts] = await Promise.all([
      dbGetDashboardStats(workspace),
      dbListContracts(workspace),
      dbListActivity(workspace, 10),
      dbListAlerts(workspace, { status: "pending" }).then((a) => a.slice(0, 5)),
    ]);
    const contracts = allContracts.slice(0, 3);
    const isEmpty   = !allContracts.length && !pendingAlerts.length && !activity.length;
    return { stats, contracts, allContracts, activity, pendingAlerts, isEmpty };
  } catch {
    return { stats: EMPTY_STATS, contracts: [], allContracts: [], activity: [], pendingAlerts: [], isEmpty: true };
  }
}

// ── Empty onboarding ──────────────────────────────────────────────────────────

function EmptyOnboarding() {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-10 text-center">
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
        Upload your first contract to start extracting clauses, tracking deadlines, and monitoring risk with AI.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link href="/contracts/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-brand">
          <Upload size={15} strokeWidth={2} />Upload contract
        </Link>
        <Link href="/contracts" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-colors">
          <FileText size={15} />View contracts
        </Link>
      </div>
    </div>
  );
}

// ── Renewal pipeline ──────────────────────────────────────────────────────────

function RenewalPipeline({ contracts }: { contracts: Contract[] }) {
  const today = Date.now();
  const in90  = today + 90 * 86_400_000;

  const expiring = contracts
    .filter((c) => c.status === "ready" && c.expiryDate)
    .map((c) => ({ ...c, days: daysUntil(c.expiryDate!) }))
    .filter((c) => c.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  if (!expiring.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={13} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Renewal Pipeline</h2>
          <span className="text-[10px] font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
            next 90 days
          </span>
        </div>
        <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1">
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-2">
        {expiring.map((c) => {
          const urgent  = c.days <= 7;
          const warning = c.days <= 30 && c.days > 7;
          const color   = c.days < 0 ? "#ef4444" : urgent ? "#f59e0b" : warning ? "#0072E5" : "var(--fg-muted)";
          const bg      = c.days < 0 ? "rgba(239,68,68,0.06)" : urgent ? "rgba(245,158,11,0.06)" : warning ? "rgba(0,114,229,0.05)" : "var(--surface-subtle)";
          const border  = c.days < 0 ? "rgba(239,68,68,0.2)" : urgent ? "rgba(245,158,11,0.2)" : warning ? "rgba(0,114,229,0.15)" : "var(--border-subtle)";

          return (
            <Link
              key={c.id}
              href={`/contracts/${c.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all hover:border-[rgba(0,114,229,0.25)]"
              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--fg-primary)] truncate">{c.title}</p>
                <p className="text-xs text-[var(--fg-muted)] truncate">{c.clientName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold font-mono" style={{ color }}>
                  {c.days < 0 ? `${Math.abs(c.days)}d overdue` : c.days === 0 ? "Today" : `${c.days}d`}
                </p>
                {c.contractValue && (
                  <p className="text-[10px] font-mono text-[var(--fg-muted)]">
                    {formatCurrency(c.contractValue)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Portfolio analytics ───────────────────────────────────────────────────────

function PortfolioAnalytics({ contracts }: { contracts: Contract[] }) {
  const ready = contracts.filter((c) => c.status === "ready");
  if (ready.length < 2) return null;

  // Client value breakdown
  const clientMap = new Map<string, { value: number; count: number }>();
  for (const c of ready) {
    const existing = clientMap.get(c.clientName) ?? { value: 0, count: 0 };
    clientMap.set(c.clientName, {
      value: existing.value + (c.contractValue ?? 0),
      count: existing.count + 1,
    });
  }
  const clients = Array.from(clientMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const maxVal = clients[0]?.value ?? 1;

  // Risk distribution
  const riskMap = { high: 0, medium: 0, low: 0, unscored: 0 };
  for (const c of ready) {
    if (c.riskScore === "high")   riskMap.high++;
    else if (c.riskScore === "medium") riskMap.medium++;
    else if (c.riskScore === "low")    riskMap.low++;
    else riskMap.unscored++;
  }
  const riskTotal = ready.length || 1;

  // SVG donut for risk
  const DONUT_R = 28;
  const DONUT_C = 2 * Math.PI * DONUT_R;
  const riskSlices = [
    { key: "high",     count: riskMap.high,    color: "#ef4444" },
    { key: "medium",   count: riskMap.medium,  color: "#f59e0b" },
    { key: "low",      count: riskMap.low,     color: "#10b981" },
    { key: "unscored", count: riskMap.unscored, color: "var(--border-color)" },
  ].filter((s) => s.count > 0);

  let offset = 0;
  const slicesWithOffset = riskSlices.map((s) => {
    const pct  = s.count / riskTotal;
    const dash = DONUT_C * pct;
    const gap  = DONUT_C * (1 - pct);
    const o    = offset;
    offset    += dash;
    return { ...s, dash, gap, offset: o };
  });

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={13} className="text-[var(--fg-muted)]" />
        <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Portfolio Analytics</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Client value bar chart */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">
            Value by Client
          </p>
          <div className="space-y-2.5">
            {clients.map(({ name, value, count }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-[var(--fg-primary)] truncate flex-1 mr-2">{name}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-[var(--fg-muted)]">{count} contract{count !== 1 ? "s" : ""}</span>
                    {value > 0 && <span className="text-xs font-semibold font-mono text-[var(--fg-secondary)]">{formatCurrency(value)}</span>}
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${maxVal > 0 ? Math.max(4, (value / maxVal) * 100) : 4}%`,
                      backgroundColor: "#0072E5",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk distribution donut */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] mb-3">
            Risk Distribution
          </p>
          <div className="flex items-center gap-4">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={DONUT_R} fill="none" stroke="var(--surface-subtle)" strokeWidth="10" />
              {slicesWithOffset.map((s) => (
                <circle
                  key={s.key}
                  cx="36" cy="36"
                  r={DONUT_R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="10"
                  strokeDasharray={`${s.dash} ${DONUT_C - s.dash}`}
                  strokeDashoffset={-s.offset + DONUT_C * 0.25}
                  style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
              ))}
              <text x="36" y="33" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="monospace" fill="var(--fg-primary)">
                {ready.length}
              </text>
              <text x="36" y="44" textAnchor="middle" fontSize="7" fill="var(--fg-muted)" fontFamily="monospace">ACTIVE</text>
            </svg>
            <div className="space-y-2">
              {riskSlices.map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-[var(--fg-secondary)] capitalize">{s.key}</span>
                  <span className="text-xs font-mono text-[var(--fg-muted)] ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue concentration warning */}
      {clients.length > 0 && maxVal > 0 && (clients[0].value / (ready.reduce((s, c) => s + (c.contractValue ?? 0), 0) || 1)) > 0.5 && (
        <div
          className="mt-5 flex items-start gap-2.5 p-3 rounded-xl"
          style={{ backgroundColor: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--fg-primary)]">{clients[0].name}</span> represents over 50% of portfolio value.
            Consider diversifying to reduce client concentration risk.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Greeting ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session   = await getSession();
  const workspace = session?.workspace ?? "";
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const { stats, contracts, allContracts, activity, pendingAlerts, isEmpty } =
    await getData(workspace);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {isEmpty ? (
              "No contracts yet — upload one to get started."
            ) : stats.pendingAlertCount > 0 ? (
              <>
                You have{" "}
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {stats.pendingAlertCount} pending alert{stats.pendingAlertCount !== 1 ? "s" : ""}
                </span>
                {stats.processingCount > 0 && (
                  <> and {stats.processingCount} contract{stats.processingCount !== 1 ? "s" : ""} processing</>
                )}
                .
              </>
            ) : (
              <>All caught up &mdash; no pending alerts.</>
            )}
          </p>
        </div>
        <Link
          href="/contracts/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shrink-0 btn-brand"
        >
          <Upload size={15} strokeWidth={2} />
          Upload contract
        </Link>
      </div>

      {/* Stats */}
      <StatsBar
        totalValue={stats.totalValue}
        activeContracts={stats.activeContracts}
        highRiskClauseCount={stats.highRiskClauseCount}
        upcomingDeadlineCount={stats.upcomingDeadlineCount}
      />

      {isEmpty ? (
        <EmptyOnboarding />
      ) : (
        <>
          {/* Alerts + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AlertsWidget alerts={pendingAlerts} />
            </div>
            <div>
              <ActivityFeed events={activity} />
            </div>
          </div>

          {/* Renewal pipeline + Recent contracts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RenewalPipeline contracts={allContracts} />
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[var(--fg-secondary)]">Recent Contracts</h2>
                <Link href="/contracts" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              {contracts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contracts.map((c) => (
                    <ContractCard key={c.id} contract={c} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] py-10 text-center">
                  <Bell size={20} className="mx-auto mb-2 text-[var(--fg-muted)]" />
                  <p className="text-sm text-[var(--fg-muted)]">No contracts yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio analytics (Phase 3) */}
          <PortfolioAnalytics contracts={allContracts} />
        </>
      )}
    </div>
  );
}
