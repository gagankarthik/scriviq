import Link from "next/link";
import { CONTRACTS, ALERTS, ACTIVITY, getDashboardStats, getPendingAlerts } from "@/lib/mock-data";
import { StatsBar } from "@/components/domain/StatsBar";
import { AlertsWidget } from "@/components/domain/AlertsWidget";
import { ActivityFeed } from "@/components/domain/ActivityFeed";
import { ContractCard } from "@/components/domain/ContractCard";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const pendingAlerts = getPendingAlerts().slice(0, 5);
  const recentContracts = CONTRACTS.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Good morning, Gagan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have{" "}
            <span className="text-amber-400 font-medium">
              {stats.pendingAlertCount} pending alerts
            </span>{" "}
            and {stats.processingCount} contract
            {stats.processingCount !== 1 ? "s" : ""} processing.
          </p>
        </div>
        <Link
          href="/contracts/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150 shrink-0"
          style={{ boxShadow: "0 0 20px rgb(79 70 229 / 0.25)" }}
        >
          ↑ Upload contract
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
          <ActivityFeed events={ACTIVITY} />
        </div>
      </div>

      {/* Recent contracts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">
            Recent Contracts
          </h2>
          <Link
            href="/contracts"
            className="text-xs text-indigo-400 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentContracts.map((c) => (
            <ContractCard key={c.id} contract={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
