import Link from "next/link";
import { Upload, ArrowRight, FileText, Bell, Sparkles } from "lucide-react";
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
    return { stats: EMPTY_STATS, contracts: [], activity: [], pendingAlerts: [], isEmpty: true };
  }
  try {
    const [stats, contracts, activity, pendingAlerts] = await Promise.all([
      dbGetDashboardStats(workspace),
      dbListContracts(workspace).then((c) => c.slice(0, 3)),
      dbListActivity(workspace, 10),
      dbListAlerts(workspace, { status: "pending" }).then((a) => a.slice(0, 5)),
    ]);
    const isEmpty = !contracts.length && !pendingAlerts.length && !activity.length;
    return { stats, contracts, activity, pendingAlerts, isEmpty };
  } catch {
    return { stats: EMPTY_STATS, contracts: [], activity: [], pendingAlerts: [], isEmpty: true };
  }
}

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
      <h2 className="text-base font-semibold text-[var(--fg-primary)] mb-2">
        Your workspace is ready
      </h2>
      <p className="text-sm text-[var(--fg-muted)] max-w-sm mx-auto leading-relaxed mb-6">
        Upload your first contract to start extracting clauses, tracking deadlines, and monitoring risk with AI.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/contracts/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium btn-brand"
        >
          <Upload size={15} strokeWidth={2} />
          Upload contract
        </Link>
        <Link
          href="/contracts"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] text-sm font-medium transition-colors"
        >
          <FileText size={15} />
          View contracts
        </Link>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const workspace = session?.workspace ?? "";
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const { stats, contracts, activity, pendingAlerts, isEmpty } = await getData(workspace);

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

      {/* Onboarding state */}
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

          {/* Recent contracts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--fg-secondary)]">
                Recent Contracts
              </h2>
              <Link
                href="/contracts"
                className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {contracts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </>
      )}
    </div>
  );
}
