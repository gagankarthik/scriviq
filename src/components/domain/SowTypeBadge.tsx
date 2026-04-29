import type { SowType } from "@/lib/mock-data";

const SOW_STYLES: Record<SowType, { label: string; color: string; bg: string; border: string }> = {
  "fixed-price":       { label: "Fixed-Price",       color: "#0072E5", bg: "rgba(0,114,229,0.08)",   border: "rgba(0,114,229,0.2)"   },
  "performance-based": { label: "Performance-Based", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
  "loe":               { label: "LOE",               color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
};

export function SowTypeBadge({ type }: { type: SowType }) {
  const s = SOW_STYLES[type];
  return (
    <span
      className="inline-flex items-center text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}
