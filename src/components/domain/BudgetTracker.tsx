"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Loader2, AlertTriangle } from "lucide-react";
import type { TimesheetEntry } from "@/lib/mock-data";

interface BudgetTrackerProps {
  contractId:   string;
  budgetHours?: number;
  budgetRate?:  number;
}

export function BudgetTracker({ contractId, budgetHours, budgetRate }: BudgetTrackerProps) {
  const [entries,  setEntries]  = useState<TimesheetEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ memberName: "", date: "", hours: "", description: "" });

  useEffect(() => {
    fetch(`/api/contracts/${contractId}/timesheets`)
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false));
  }, [contractId]);

  const totalHours   = entries.reduce((s, e) => s + e.hours, 0);
  const totalCost    = budgetRate ? entries.reduce((s, e) => s + e.hours * (e.rate ?? budgetRate), 0) : null;
  const pct          = budgetHours ? Math.min((totalHours / budgetHours) * 100, 100) : null;
  const over80       = pct !== null && pct >= 80;
  const overBudget   = pct !== null && pct >= 100;

  async function addEntry() {
    if (!form.memberName || !form.date || !form.hours) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/timesheets`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          memberName:  form.memberName,
          date:        form.date,
          hours:       Number(form.hours),
          rate:        budgetRate,
          description: form.description,
        }),
      });
      const data = await res.json();
      setEntries((p) => [...p, data.entry]);
      setForm({ memberName: "", date: "", hours: "", description: "" });
      setShowForm(false);
    } finally {
      setAdding(false);
    }
  }

  if (!budgetHours && !loading && entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-[var(--fg-muted)]" />
          <p className="text-sm font-semibold text-[var(--fg-primary)]">Budget Tracker</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#0072E5] hover:underline"
        >
          <Plus size={12} />
          Log time
        </button>
      </div>

      {/* Progress bar */}
      {budgetHours && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-[var(--fg-secondary)]">{totalHours.toFixed(1)}h used</span>
            <span className="text-[var(--fg-muted)]">{budgetHours}h budget</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: overBudget ? "#ef4444" : over80 ? "#f59e0b" : "#10b981",
              }}
            />
          </div>
          {(over80 || overBudget) && (
            <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: overBudget ? "#ef4444" : "#f59e0b" }}>
              <AlertTriangle size={11} />
              {overBudget ? "Over budget" : `${pct?.toFixed(0)}% of budget used`}
            </div>
          )}
          {totalCost !== null && (
            <p className="text-xs text-[var(--fg-muted)] mt-1">
              Cost: ${totalCost.toLocaleString()} {budgetRate && `· $${budgetRate}/hr`}
            </p>
          )}
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className="mb-4 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Team member"
              value={form.memberName}
              onChange={(e) => setForm((p) => ({ ...p, memberName: e.target.value }))}
              className="col-span-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-1.5 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5]"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-1.5 text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[#0072E5]"
            />
            <input
              type="number"
              placeholder="Hours"
              step="0.5"
              value={form.hours}
              onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-1.5 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5]"
            />
          </div>
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-1.5 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5]"
          />
          <button
            onClick={addEntry}
            disabled={adding || !form.memberName || !form.date || !form.hours}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0072E5] hover:bg-[#0060c7] text-white text-xs font-semibold transition-all disabled:opacity-60"
          >
            {adding && <Loader2 size={11} className="animate-spin" />}
            Save entry
          </button>
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] py-2">
          <Loader2 size={12} className="animate-spin" />
          Loading timesheet…
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-1.5">
          {entries.slice(-5).reverse().map((e) => (
            <div key={e.id} className="flex items-center gap-3 text-xs text-[var(--fg-secondary)]">
              <span className="font-mono shrink-0 w-8 text-right text-[var(--fg-primary)] font-semibold">{e.hours}h</span>
              <span className="flex-1 truncate">{e.description || e.memberName}</span>
              <span className="text-[var(--fg-muted)] font-mono shrink-0">
                {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
          {entries.length > 5 && (
            <p className="text-[10px] text-[var(--fg-muted)] pt-1">{entries.length - 5} more entries</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--fg-muted)]">No time logged yet.</p>
      )}
    </div>
  );
}
