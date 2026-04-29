"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "processing", label: "Processing" },
  { value: "error", label: "Error" },
];

const RISK_TABS = [
  { value: "", label: "All risk" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ContractFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const status = sp.get("status") ?? "";
  const risk = sp.get("risk") ?? "";
  const q = sp.get("q") ?? "";

  function push(params: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    router.push(`/contracts?${next.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <div className="sm:w-64">
        <Input
          placeholder="Search contracts…"
          value={q}
          onChange={(e) => push({ q: e.target.value })}
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-900/50 border border-slate-800/50 p-1">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => push({ status: t.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              status === t.value
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Risk filter */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-900/50 border border-slate-800/50 p-1">
        {RISK_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => push({ risk: t.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              risk === t.value
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
