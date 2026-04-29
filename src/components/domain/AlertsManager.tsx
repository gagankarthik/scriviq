"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
  const [overrides,    setOverrides]    = useState<Map<string, AlertStatus>>(new Map());

  const alerts = initialAlerts.map((a) =>
    overrides.has(a.id) ? { ...a, status: overrides.get(a.id)! } : a
  );

  async function dismiss(id: string) {
    setOverrides((prev) => new Map([...prev, [id, "dismissed"]]));
    // Persist to API
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "dismissed" }),
    }).catch(() => {});
  }

  const filtered  = alerts.filter((a) => !statusFilter || a.status === statusFilter);
  const grouped   = TYPE_ORDER.reduce((acc, type) => {
    acc[type] = filtered.filter((a) => a.type === type);
    return acc;
  }, {} as Record<AlertType, Alert[]>);

  const overdue = alerts.filter((a) => a.type === "overdue" && a.status !== "dismissed").length;
  const pending = alerts.filter((a) => a.status === "pending").length;
  const total   = alerts.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Overdue", value: overdue, color: "text-red-600 dark:text-red-400",   border: "border-l-red-500"   },
          { label: "Pending", value: pending, color: "text-amber-600 dark:text-amber-400", border: "border-l-amber-500" },
          { label: "Total",   value: total,   color: "text-[var(--fg-primary)]",           border: "border-l-[var(--border-color)]" },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4 border-l-2 ${border}`}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] mb-1 font-semibold">{label}</p>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1 w-fit">
        {FILTER_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatusFilter(t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              statusFilter === t.value
                ? "bg-indigo-600 text-white"
                : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grouped */}
      {TYPE_ORDER.map((type) => {
        const group = grouped[type];
        if (!group.length) return null;
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">
                {TYPE_LABELS[type]}
              </h3>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--fg-muted)] text-[10px] font-mono font-bold">
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
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-[var(--fg-primary)] font-semibold mb-1">No alerts to show</p>
          <p className="text-sm text-[var(--fg-muted)]">
            {statusFilter ? `No ${statusFilter} alerts found.` : "All clear — no active alerts."}
          </p>
        </div>
      )}
    </div>
  );
}
