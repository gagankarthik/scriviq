import Link from "next/link";
import { Upload, ArrowRight } from "lucide-react";
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
import {
  CONTRACTS,
  ALERTS,
  ACTIVITY,
  getDashboardStats,
  getPendingAlerts,
} from "@/lib/mock-data";

async function getData(workspace: string) {
  try {
    const [stats, contracts, activity, pendingAlerts] = await Promise.all([
      dbGetDashboardStats(workspace),
      dbListContracts(workspace).then((c) => c.slice(0, 3)),
      dbListActivity(workspace, 10),
      dbListAlerts(workspace, { status: "pending" }).then((a) => a.slice(0, 5)),
    ]);

    if (!contracts.length && !pendingAlerts.length) {
      throw new Error("No data in DynamoDB — using seed data");
    }

    return { stats, contracts, activity, pendingAlerts, source: "live" as const };
  } catch {
    return {
      stats:         getDashboardStats(),
      contracts:     CONTRACTS.slice(0, 3),
      activity:      ACTIVITY,
      pendingAlerts: getPendingAlerts().slice(0, 5),
      source:        "mock" as const,
    };
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  const workspace = session?.workspace ?? "";
  const firstName = session?.name?.split(" ")[0] ?? "there";

  const { stats, contracts, activity, pendingAlerts, source } = await getData(workspace);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {stats.pendingAlertCount > 0 ? (
              <>
                You have{" "}
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {stats.pendingAlertCount} pending alerts
                </span>
                {stats.processingCount > 0 && (
                  <> and {stats.processingCount} contract{stats.processingCount !== 1 ? "s" : ""} processing</>
                )}
                .
              </>
            ) : (
              <>All caught up — no pending alerts.</>
            )}
            {source === "mock" && (
              <span className="ml-2 text-[10px] font-mono text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                demo data
              </span>
            )}
          </p>
        </div>
        <Link
          href="/contracts/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150 shrink-0 shadow-sm"
          style={{ boxShadow: "0 0 20px rgb(79 70 229 / 0.2)" }}
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
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((c) => (
            <ContractCard key={c.id} contract={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
