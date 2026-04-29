"use client";

import Link from "next/link";
import { useState } from "react";
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
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-slate-100">Active Alerts</h2>
          {active.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold font-mono border border-amber-800/40">
              {active.length}
            </span>
          )}
        </div>
        <Link
          href="/alerts"
          className="text-xs text-indigo-400 hover:underline"
        >
          View all →
        </Link>
      </div>

      {/* Alert list */}
      <div className="p-4 space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onDismiss={(id) => setDismissed((prev) => new Set([...prev, id]))}
          />
        ))}
        {alerts.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-2xl mb-2">✓</p>
            <p className="text-sm text-slate-400">All clear — no active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
