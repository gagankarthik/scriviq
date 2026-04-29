"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate, Plus, Loader2, Play, Clock, Trash2,
} from "lucide-react";
import type { SOWTemplate, SowType } from "@/lib/mock-data";
import { SowTypeBadge } from "@/components/domain/SowTypeBadge";
import { Button } from "@/components/ui/Button";

// ── Seed templates shown to all workspaces ────────────────────────────────────

const SEED_TEMPLATES: SOWTemplate[] = [
  {
    id:          "seed-fixed-web",
    title:       "Web Design & Development SOW",
    description: "Standard fixed-price statement of work for web design projects.",
    sowType:     "fixed-price",
    sections:    [
      { id: "s1", clauseType: "acceptance_criteria", title: "Project Scope",          content: "Agency will deliver {{deliverables}} by {{endDate}}.",           required: true,  riskLevel: "low"    },
      { id: "s2", clauseType: "payment_milestone",   title: "Payment Schedule",        content: "50% upon signing. 50% upon delivery. Total: ${{contractValue}}.", required: true,  riskLevel: "low"    },
      { id: "s3", clauseType: "termination_notice",  title: "Termination",             content: "Either party may terminate with {{noticeDays}} days notice.",     required: true,  riskLevel: "medium" },
      { id: "s4", clauseType: "ip_ownership",        title: "Intellectual Property",   content: "All work product transfers to {{clientName}} upon final payment.", required: true,  riskLevel: "low"    },
      { id: "s5", clauseType: "liability_cap",       title: "Limitation of Liability", content: "Liability capped at total fees paid under this agreement.",        required: false, riskLevel: "medium" },
    ],
    variables:   ["deliverables", "endDate", "contractValue", "clientName", "noticeDays"],
    createdAt:   "2026-01-01T00:00:00Z",
    updatedAt:   "2026-01-01T00:00:00Z",
    usageCount:  0,
  },
  {
    id:          "seed-perf-marketing",
    title:       "Performance Marketing SOW",
    description: "Performance-based SOW tied to KPIs and delivery milestones.",
    sowType:     "performance-based",
    sections:    [
      { id: "s1", clauseType: "acceptance_criteria", title: "KPIs & Success Criteria", content: "Agency will deliver {{kpiTarget}} within {{timePeriod}}.",          required: true, riskLevel: "medium" },
      { id: "s2", clauseType: "payment_milestone",   title: "Payment on Performance",  content: "Payment of ${{baseAmount}} base + ${{bonusAmount}} on KPI hit.",   required: true, riskLevel: "low"    },
      { id: "s3", clauseType: "scope_change",        title: "Scope Changes",           content: "Scope changes do not trigger additional billing in this model.",    required: true, riskLevel: "low"    },
    ],
    variables:   ["kpiTarget", "timePeriod", "baseAmount", "bonusAmount"],
    createdAt:   "2026-01-01T00:00:00Z",
    updatedAt:   "2026-01-01T00:00:00Z",
    usageCount:  0,
  },
  {
    id:          "seed-loe-retainer",
    title:       "Monthly Retainer SOW (LOE)",
    description: "Level-of-effort retainer for ongoing agency services.",
    sowType:     "loe",
    sections:    [
      { id: "s1", clauseType: "payment_milestone",  title: "Monthly Fee",          content: "${{monthlyFee}} billed on the 1st of each month.",           required: true, riskLevel: "low"    },
      { id: "s2", clauseType: "acceptance_criteria", title: "Hours & Deliverables", content: "Up to {{budgetHours}} hours/month covering {{services}}.",    required: true, riskLevel: "low"    },
      { id: "s3", clauseType: "termination_notice",  title: "Cancellation",         content: "30 days written notice required to cancel the retainer.",    required: true, riskLevel: "medium" },
    ],
    variables:   ["monthlyFee", "budgetHours", "services"],
    createdAt:   "2026-01-01T00:00:00Z",
    updatedAt:   "2026-01-01T00:00:00Z",
    usageCount:  0,
  },
];

// ── Generate modal ────────────────────────────────────────────────────────────

function GenerateModal({
  template,
  onClose,
}: {
  template: SOWTemplate;
  onClose: () => void;
}) {
  const router = useRouter();
  const [vars,        setVars]        = useState<Record<string, string>>({});
  const [title,       setTitle]       = useState(`${template.title} — `);
  const [clientName,  setClientName]  = useState("");
  const [value,       setValue]       = useState("");
  const [expiry,      setExpiry]      = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [error,       setError]       = useState("");

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !clientName) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/templates/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          templateId:    template.id,
          variables:     vars,
          contractTitle: title,
          clientName,
          contractValue: value ? Number(value) : undefined,
          expiryDate:    expiry || undefined,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      router.push(`/contracts/${data.contractId}`);
    } catch {
      setError("Failed to generate contract — please try again.");
      setGenerating(false);
    }
  }

  const FIELD_CLS = "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <p className="text-xs text-[var(--fg-muted)] mb-0.5">Generate from template</p>
            <h2 className="text-base font-bold text-[var(--fg-primary)]">{template.title}</h2>
          </div>
          <button onClick={onClose} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] mt-0.5">✕</button>
        </div>

        <form onSubmit={generate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
              Contract Title <span className="text-red-500">*</span>
            </label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={FIELD_CLS} placeholder="Acme Corp — Web Redesign SOW" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} required className={FIELD_CLS} placeholder="Acme Corporation" />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">Contract Value</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={FIELD_CLS} placeholder="48000" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5">Expiry Date</label>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={FIELD_CLS} />
          </div>

          {template.variables.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Template Variables</p>
              {template.variables.map((v) => (
                <div key={v}>
                  <label className="text-[10px] font-mono text-[var(--fg-muted)] block mb-1">{`{{${v}}}`}</label>
                  <input
                    value={vars[v] ?? ""}
                    onChange={(e) => setVars((p) => ({ ...p, [v]: e.target.value }))}
                    className={FIELD_CLS}
                    placeholder={`Value for ${v}`}
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="pt-2 flex gap-3">
            <Button type="submit" loading={generating} glow className="flex-1">
              <Play size={13} />
              {generating ? "Generating…" : "Generate Contract"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
  onDelete,
}: {
  template:  SOWTemplate;
  onUse:     (t: SOWTemplate) => void;
  onDelete?: (id: string) => void;
}) {
  const isSeed = template.id.startsWith("seed-");

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-5 flex flex-col gap-4 hover:border-[rgba(0,114,229,0.3)] transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <SowTypeBadge type={template.sowType} />
            {template.usageCount > 0 && (
              <span className="text-[9px] font-mono text-[var(--fg-muted)] flex items-center gap-0.5">
                <Clock size={9} />
                Used {template.usageCount}×
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[var(--fg-primary)] group-hover:text-[#75D8FC] transition-colors">
            {template.title}
          </h3>
          <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed line-clamp-2">{template.description}</p>
        </div>
        {!isSeed && onDelete && (
          <button
            onClick={() => onDelete(template.id)}
            className="shrink-0 p-1 text-[var(--fg-muted)] hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-xs text-[var(--fg-muted)]">{template.sections.length} sections</span>
        <button
          onClick={() => onUse(template)}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0072E5] hover:bg-[#0060c7] text-white text-xs font-semibold transition-all"
        >
          <Play size={11} />
          Use template
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [templates,  setTemplates]  = useState<SOWTemplate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState<SOWTemplate | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .finally(() => setLoading(false));
  }, []);

  const allTemplates = [...SEED_TEMPLATES, ...templates];

  async function deleteTemplate(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((p) => p.filter((t) => t.id !== id));
  }

  const sowTypes: Array<{ type: SowType | "all"; label: string }> = [
    { type: "all",               label: "All" },
    { type: "fixed-price",       label: "Fixed-Price" },
    { type: "performance-based", label: "Performance" },
    { type: "loe",               label: "LOE" },
  ];
  const [filter, setFilter] = useState<SowType | "all">("all");

  const visible = filter === "all"
    ? allTemplates
    : allTemplates.filter((t) => t.sowType === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
            SOW Templates
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            Generate contracts from pre-built templates — AI fills in the details.
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {sowTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
            style={
              filter === type
                ? { backgroundColor: "#0072E5", color: "#fff", borderColor: "#0072E5" }
                : { color: "var(--fg-muted)", borderColor: "var(--border-color)", backgroundColor: "var(--surface-elevated)" }
            }
          >
            {label}
          </button>
        ))}
        <span className="text-xs text-[var(--fg-muted)] ml-auto">{visible.length} template{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading templates…
        </div>
      ) : visible.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={setGenerating}
              onDelete={deleteTemplate}
            />
          ))}

          {/* "Build your own" prompt */}
          <div className="rounded-2xl border-2 border-dashed border-[var(--border-color)] p-5 flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(0,114,229,0.1)" }}>
              <Plus size={18} style={{ color: "#0072E5" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fg-primary)]">Custom template</p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">Coming soon — build from scratch</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-12 text-center">
          <LayoutTemplate size={36} className="mx-auto mb-4 text-[var(--fg-muted)]" />
          <p className="text-[var(--fg-primary)] font-semibold">No templates</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">No templates match the selected filter.</p>
        </div>
      )}

      {/* Generate modal */}
      {generating && (
        <GenerateModal
          template={generating}
          onClose={() => setGenerating(null)}
        />
      )}
    </div>
  );
}
