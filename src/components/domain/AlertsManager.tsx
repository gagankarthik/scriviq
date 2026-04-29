"use client";

import { useState } from "react";
import { type Alert, type AlertType, type AlertStatus } from "@/lib/mock-data";
import { AlertRow } from "./AlertRow";

const FILTER_TABS: { value: "" | AlertStatus; label: string }[] = [
  { value: "",          label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "sent",      label: "Sent" },
  { value: "dismissed", label: "Dismissed" },
];

const TYPE_ORDER: AlertType[] = ["overdue", "1_day", "7_day"];
const TYPE_LABELS: Record<AlertType, string> = {
  overdue: "Overdue",
  "1_day": "Due Tomorrow",
  "7_day": "Due in 7 Days",
};

interface AlertsManagerProps {
  initialAlerts: Alert[];
}

export function AlertsManager({ initialAlerts }: AlertsManagerProps) {
  const [statusFilter, setStatusFilter] = useState<"" | AlertStatus>("");
  const [overrides, setOverrides] = useState<Map<string, AlertStatus>>(new Map());

  const alerts = initialAlerts.map((a) =>
    overrides.has(a.id) ? { ...a, status: overrides.get(a.id)! } : a
  );

  function dismiss(id: string) {
    setOverrides((prev) => new Map([...prev, [id, "dismissed" as AlertStatus]]));
  }

  const filtered = alerts.filter((a) => !statusFilter || a.status === statusFilter);

  // Group by type
  const grouped = TYPE_ORDER.reduce(
    (acc, type) => {
      acc[type] = filtered.filter((a) => a.type === type);
      return acc;
    },
    {} as Record<AlertType, Alert[]>
  );

  const total = alerts.length;
  const overdue = alerts.filter((a) => a.type === "overdue" && a.status !== "dismissed").length;
  const pending = alerts.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Overdue", value: overdue, color: "text-red-400", border: "border-l-red-500" },
          { label: "Pending", value: pending, color: "text-amber-400", border: "border-l-amber-500" },
          { label: "Total",   value: total,   color: "text-slate-300", border: "border-l-slate-700" },
        ].map(({ label, value, color, border }) => (
          <div
            key={label}
            className={`rounded-xl border border-slate-800/50 bg-slate-900/20 p-4 border-l-2 ${border}`}
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-1">{label}</p>
            <p className={`text-2xl font-semibold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-900/50 border border-slate-800/50 p-1 w-fit">
        {FILTER_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatusFilter(t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              statusFilter === t.value
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grouped alerts */}
      {TYPE_ORDER.map((type) => {
        const group = grouped[type];
        if (group.length === 0) return null;
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {TYPE_LABELS[type]}
              </h3>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono font-bold">
                {group.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onDismiss={dismiss} />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-800/40 bg-slate-900/10 py-16 text-center">
          <p className="text-2xl mb-3">✓</p>
          <p className="text-slate-300 font-medium mb-1">No alerts to show</p>
          <p className="text-sm text-slate-500">
            {statusFilter ? `No ${statusFilter} alerts found.` : "All clear — no active alerts."}
          </p>
        </div>
      )}
    </div>
  );
}
