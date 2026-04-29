"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { type Alert } from "@/lib/mock-data";
import { AlertRow } from "./AlertRow";

interface AlertsWidgetProps {
  alerts: Alert[];
}

export function AlertsWidget({ alerts: initialAlerts }: AlertsWidgetProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts = initialAlerts.map((a) =>
    dismissed.has(a.id) ? { ...a, status: "dismissed" as const } : a
  );
  const active = alerts.filter((a) => a.status !== "dismissed");

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <Bell size={14} className="text-[var(--fg-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--fg-primary)]">Active Alerts</h2>
          {active.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800/40">
              {active.length}
            </span>
          )}
        </div>
        <Link
          href="/alerts"
          className="text-xs hover:underline"
          style={{ color: "#0072E5" }}
        >
          View all →
        </Link>
      </div>

      {/* List */}
      <div className="p-4 space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onDismiss={(id) => setDismissed((prev) => new Set([...prev, id]))}
          />
        ))}
        {alerts.length === 0 && (
          <div className="py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-[var(--fg-primary)]">All clear</p>
            <p className="text-xs text-[var(--fg-muted)] mt-1">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
