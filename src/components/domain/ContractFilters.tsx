"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "ready",      label: "Ready" },
  { value: "processing", label: "Processing" },
  { value: "error",      label: "Error" },
];

const RISK_TABS = [
  { value: "",       label: "All risk" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
];

export function ContractFilters() {
  const router = useRouter();
  const sp     = useSearchParams();
  const status = sp.get("status") ?? "";
  const risk   = sp.get("risk")   ?? "";
  const q      = sp.get("q")      ?? "";

  function push(params: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else   next.delete(k);
    });
    router.push(`/contracts?${next.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <div className="relative sm:w-64">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
        <input
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none transition-colors"
          onFocus={(e) => { e.currentTarget.style.borderColor = "#0072E5"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,114,229,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}
          placeholder="Search contracts…"
          value={q}
          onChange={(e) => push({ q: e.target.value })}
        />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => push({ status: t.value })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={status === t.value ? { backgroundColor: "#0072E5", color: "#fff" } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Risk tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-color)] p-1">
        {RISK_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => push({ risk: t.value })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={risk === t.value ? { backgroundColor: "#0072E5", color: "#fff" } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
