"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate, Plus, Loader2, Play, Clock, Trash2,
  ArrowRight, ArrowLeft, Sparkles, Check, X, FolderOpen,
  FileText, DollarSign, Calendar, Users, CreditCard,
  Bell, Shield, AlertTriangle, ChevronRight,
} from "lucide-react";
import type { SOWTemplate, SowType, ClauseType } from "@/lib/mock-data";
import { SowTypeBadge } from "@/components/domain/SowTypeBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ── Constants ─────────────────────────────────────────────────────────────────

const SOW_COLORS: Record<SowType, string> = {
  "fixed-price":       "#0072E5",
  "performance-based": "#8b5cf6",
  "loe":               "#f59e0b",
};

const CLAUSE_LABEL: Partial<Record<ClauseType, string>> = {
  payment_milestone:  "Payment",
  renewal_auto:       "Auto-Renewal",
  ip_ownership:       "IP Rights",
  termination_notice: "Termination",
  liability_cap:      "Liability",
  confidentiality:    "NDA",
  penalty_clause:     "Penalty",
  acceptance_criteria:"Acceptance",
  governing_law:      "Governing Law",
  dispute_resolution: "Disputes",
  force_majeure:      "Force Majeure",
  scope_change:       "Scope",
};

const RISK_COLOR: Record<string, string> = {
  low:    "#10b981",
  medium: "#f59e0b",
  high:   "#ef4444",
};

const PAYMENT_OPTIONS = [
  { value: "50% upfront, 50% on delivery", label: "50/50 — Upfront + Delivery" },
  { value: "Monthly billing on the 1st of each month", label: "Monthly billing" },
  { value: "Milestone-based: payments tied to project milestones", label: "Milestone-based" },
  { value: "100% on final delivery and acceptance", label: "On final delivery" },
  { value: "30% upfront, 40% at midpoint, 30% on delivery", label: "30/40/30 split" },
];

const NOTICE_OPTIONS = [
  { value: "14 days written notice", label: "14 days" },
  { value: "30 days written notice", label: "30 days" },
  { value: "60 days written notice", label: "60 days" },
  { value: "90 days written notice", label: "90 days" },
];

const LATE_OPTIONS = [
  { value: "None specified", label: "None" },
  { value: "1.5% per month on overdue balances", label: "1.5%/month interest" },
  { value: "2% per month on overdue balances", label: "2%/month interest" },
  { value: "$250 flat fee per overdue invoice", label: "$250 flat fee" },
];

// ── Seed templates ────────────────────────────────────────────────────────────

const SEED_TEMPLATES: SOWTemplate[] = [
  {
    id:          "seed-fixed-web",
    title:       "Web Design & Development SOW",
    description: "Standard fixed-price statement of work for web design and development projects. Covers scope, payment milestones, IP transfer, and termination.",
    sowType:     "fixed-price",
    sections: [
      { id: "s1", clauseType: "acceptance_criteria", title: "Project Scope & Deliverables", content: "Agency will deliver {{deliverables}} by {{endDate}}. The project encompasses all work described in the attached brief.", required: true, riskLevel: "low" },
      { id: "s2", clauseType: "payment_milestone",   title: "Payment Schedule",             content: "50% upon signing (${{depositAmount}}). 50% upon delivery (${{finalAmount}}). Total contract value: ${{contractValue}}.", required: true, riskLevel: "low" },
      { id: "s3", clauseType: "termination_notice",  title: "Termination",                  content: "Either party may terminate this agreement with {{noticeDays}} days written notice. Upon termination, client pays for all work completed to date.", required: true, riskLevel: "medium" },
      { id: "s4", clauseType: "ip_ownership",        title: "Intellectual Property",        content: "All work product and deliverables transfer to {{clientName}} upon receipt of final payment in full.", required: true, riskLevel: "low" },
      { id: "s5", clauseType: "liability_cap",       title: "Limitation of Liability",      content: "Agency liability is limited to the total fees paid under this agreement. Neither party is liable for indirect or consequential damages.", required: false, riskLevel: "medium" },
      { id: "s6", clauseType: "confidentiality",     title: "Confidentiality",              content: "Both parties agree to keep confidential information secret for {{ndaDuration}} years after contract end.", required: false, riskLevel: "low" },
    ],
    variables:  ["deliverables", "endDate", "depositAmount", "finalAmount", "contractValue", "clientName", "noticeDays", "ndaDuration"],
    createdAt:  "2026-01-01T00:00:00Z",
    updatedAt:  "2026-01-01T00:00:00Z",
    usageCount: 0,
  },
  {
    id:          "seed-perf-marketing",
    title:       "Performance Marketing SOW",
    description: "Performance-based SOW tied to KPIs, delivery milestones, and measurable outcomes. Ideal for paid media, SEO, and growth campaigns.",
    sowType:     "performance-based",
    sections: [
      { id: "s1", clauseType: "acceptance_criteria", title: "KPIs & Success Criteria",  content: "Agency will achieve {{kpiTarget}} within {{timePeriod}}. Success is measured by {{measurementMethod}}.", required: true, riskLevel: "medium" },
      { id: "s2", clauseType: "payment_milestone",   title: "Base & Performance Fee",   content: "Base fee of ${{baseAmount}}/month. Performance bonus of ${{bonusAmount}} upon achieving KPI targets.", required: true, riskLevel: "low" },
      { id: "s3", clauseType: "scope_change",        title: "Scope & Channels",         content: "Agency manages {{channels}} for {{clientName}}. Additional channels require a written amendment.", required: true, riskLevel: "low" },
      { id: "s4", clauseType: "termination_notice",  title: "Cancellation",             content: "Either party may cancel with 30 days notice. KPI bonuses are pro-rated for partial periods.", required: true, riskLevel: "medium" },
      { id: "s5", clauseType: "confidentiality",     title: "Data & Confidentiality",   content: "All campaign data, account access, and analytics remain confidential and return to {{clientName}} upon contract end.", required: true, riskLevel: "low" },
    ],
    variables:  ["kpiTarget", "timePeriod", "measurementMethod", "baseAmount", "bonusAmount", "channels", "clientName"],
    createdAt:  "2026-01-01T00:00:00Z",
    updatedAt:  "2026-01-01T00:00:00Z",
    usageCount: 0,
  },
  {
    id:          "seed-loe-retainer",
    title:       "Monthly Retainer SOW (LOE)",
    description: "Level-of-effort retainer for ongoing agency services. Covers monthly billing, hours allocation, rollover policy, and cancellation.",
    sowType:     "loe",
    sections: [
      { id: "s1", clauseType: "payment_milestone",   title: "Monthly Retainer Fee",     content: "${{monthlyFee}} invoiced on the 1st of each month, due within {{paymentDays}} days.", required: true, riskLevel: "low" },
      { id: "s2", clauseType: "acceptance_criteria", title: "Hours & Services",         content: "Up to {{budgetHours}} hours/month covering {{services}}. Unused hours do not roll over.", required: true, riskLevel: "low" },
      { id: "s3", clauseType: "scope_change",        title: "Overage",                  content: "Hours beyond {{budgetHours}}/month billed at ${{hourlyRate}}/hr with prior written approval.", required: true, riskLevel: "medium" },
      { id: "s4", clauseType: "termination_notice",  title: "Cancellation Policy",      content: "30 days written notice to cancel. Final invoice covers all services in the notice period.", required: true, riskLevel: "medium" },
      { id: "s5", clauseType: "ip_ownership",        title: "Deliverable Ownership",    content: "All deliverables produced under this retainer transfer to {{clientName}} upon payment.", required: false, riskLevel: "low" },
    ],
    variables:  ["monthlyFee", "paymentDays", "budgetHours", "services", "hourlyRate", "clientName"],
    createdAt:  "2026-01-01T00:00:00Z",
    updatedAt:  "2026-01-01T00:00:00Z",
    usageCount: 0,
  },
  {
    id:          "seed-brand-identity",
    title:       "Brand Identity & Strategy SOW",
    description: "Fixed-price SOW for brand strategy, visual identity, and brand guidelines. Covers research, concept, refinement, and final deliverables.",
    sowType:     "fixed-price",
    sections: [
      { id: "s1", clauseType: "acceptance_criteria", title: "Project Scope",            content: "Agency delivers: {{deliverables}}. Timeline: {{startDate}} – {{endDate}}.", required: true, riskLevel: "low" },
      { id: "s2", clauseType: "payment_milestone",   title: "Payment Milestones",       content: "30% on project kick-off (${{deposit}}). 40% at concept approval (${{midPayment}}). 30% on final delivery (${{finalPayment}}).", required: true, riskLevel: "low" },
      { id: "s3", clauseType: "acceptance_criteria", title: "Revision Policy",          content: "Includes {{revisionRounds}} rounds of revisions per phase. Additional revisions billed at ${{revisionRate}}/hr.", required: true, riskLevel: "medium" },
      { id: "s4", clauseType: "ip_ownership",        title: "IP & Usage Rights",        content: "All final brand assets transfer to {{clientName}} upon final payment. Unused concepts remain property of agency.", required: true, riskLevel: "low" },
      { id: "s5", clauseType: "confidentiality",     title: "Confidentiality",          content: "Agency keeps all client briefs and business information confidential.", required: false, riskLevel: "low" },
    ],
    variables:  ["deliverables", "startDate", "endDate", "deposit", "midPayment", "finalPayment", "revisionRounds", "revisionRate", "clientName"],
    createdAt:  "2026-01-01T00:00:00Z",
    updatedAt:  "2026-01-01T00:00:00Z",
    usageCount: 0,
  },
];

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }, (_, i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  backgroundColor: done ? "#10b981" : active ? "#0072E5" : "var(--surface-subtle)",
                  border:          `2px solid ${done ? "#10b981" : active ? "#0072E5" : "var(--border-color)"}`,
                  color:           done || active ? "#fff" : "var(--fg-muted)",
                }}
              >
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span
                className="text-[9px] font-medium text-center hidden sm:block"
                style={{ color: active ? "var(--fg-primary)" : "var(--fg-muted)" }}
              >
                {labels[i]}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className="h-px flex-1 mx-1 mb-4 transition-all duration-500"
                style={{ backgroundColor: done ? "#10b981" : "var(--border-color)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Generate modal ────────────────────────────────────────────────────────────

type Project = { id: string; name: string; clientName: string; color: string };

function GenerateModal({ template, onClose }: { template: SOWTemplate; onClose: () => void }) {
  const router  = useRouter();
  const color   = SOW_COLORS[template.sowType];

  const [step, setStep] = useState(0);
  const STEP_LABELS = ["Details", "Scope", "Terms"];

  // Step 1 — basics
  const [title,      setTitle]      = useState(`${template.title} — `);
  const [clientName, setClientName] = useState("");
  const [value,      setValue]      = useState("");
  const [startDate,  setStartDate]  = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [projectId,  setProjectId]  = useState("");

  // Step 2 — scope
  const [scope,       setScope]       = useState("");
  const [deliverables,setDeliverables]= useState("");
  const [team,        setTeam]        = useState("");
  const [extraNotes,  setExtraNotes]  = useState("");

  // Step 3 — terms + variables
  const [payment,     setPayment]     = useState(PAYMENT_OPTIONS[0].value);
  const [notice,      setNotice]      = useState(NOTICE_OPTIONS[1].value);
  const [latePayment, setLatePayment] = useState(LATE_OPTIONS[0].value);
  const [vars,        setVars]        = useState<Record<string, string>>({});

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => {});
  }, []);

  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState("");

  const FIELD_CLS = "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30";
  const LABEL_CLS = "text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5";

  const step1Valid = title.trim().length > 3 && clientName.trim().length > 0;
  const step2Valid = scope.trim().length > 10;

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/templates/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          templateId:        template.id,
          templateTitle:     template.title,
          templateSections:  template.sections,
          templateVariables: template.variables,
          sowType:           template.sowType,
          variables:         vars,
          contractTitle:     title,
          clientName,
          contractValue:     value ? Number(value) : undefined,
          startDate:         startDate || undefined,
          expiryDate:        expiry || undefined,
          projectId:         projectId || undefined,
          scope,
          deliverables,
          teamComposition:   team,
          paymentSchedule:   payment,
          noticePeriod:      notice,
          latePayment,
          extraNotes,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      router.push(data.projectId ? `/contracts/projects/${data.projectId}` : `/contracts/${data.contractId}`);
    } catch {
      setError("Failed to generate contract — please try again.");
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-base)]/90 backdrop-blur-md">
        <div className="text-center space-y-6 max-w-sm mx-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full animate-ping opacity-20" style={{ backgroundColor: color }} />
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${color}18`, border: `2px solid ${color}40` }}
            >
              <Sparkles size={28} style={{ color }} className="animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--fg-primary)]">Writing your contract</p>
            <p className="text-sm text-[var(--fg-muted)] mt-1">GPT-4o is drafting all clauses…</p>
          </div>
          <div className="space-y-2">
            {["Structuring clauses", "Writing legal language", "Scoring risk levels", "Finalising contract"].map((s, i) => (
              <div key={s} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                <Loader2 size={12} className="animate-spin shrink-0" style={{ color }} />
                <span className="text-xs text-[var(--fg-secondary)]">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)]" style={{ borderTopColor: color, borderTopWidth: 3 }}>
          <div className="flex items-start justify-between px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}18` }}>
                <LayoutTemplate size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-[var(--fg-muted)]">Generate from template</p>
                <h2 className="text-base font-bold text-[var(--fg-primary)]">{template.title}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 pb-4">
            <StepIndicator step={step} total={3} labels={STEP_LABELS} />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Step 1 — Details */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLS}>Contract Title <span className="text-red-500">*</span></label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD_CLS} placeholder="Acme Corp — Website Redesign SOW 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Client Name <span className="text-red-500">*</span></label>
                  <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={FIELD_CLS} placeholder="Acme Corporation" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Contract Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--fg-muted)]">$</span>
                    <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={FIELD_CLS + " pl-6"} placeholder="48000" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLS}>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={FIELD_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>End / Expiry Date</label>
                  <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={FIELD_CLS} />
                </div>
              </div>
              {projects.length > 0 && (
                <div>
                  <label className={LABEL_CLS}>Add to Project (optional)</label>
                  <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={FIELD_CLS}>
                    <option value="">— No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.clientName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Scope */}
          {step === 1 && (
            <div className="space-y-4">
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs text-[var(--fg-secondary)] leading-relaxed"
                style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
              >
                <Sparkles size={13} style={{ color }} className="shrink-0 mt-0.5" />
                <span>The more context you provide, the more accurate and legally-specific your contract will be.</span>
              </div>
              <div>
                <label className={LABEL_CLS}>Scope of Work <span className="text-red-500">*</span></label>
                <textarea
                  value={scope} onChange={(e) => setScope(e.target.value)}
                  rows={4} className={FIELD_CLS + " resize-none"}
                  placeholder="Describe what you will deliver — e.g. Design and develop a 10-page marketing website including Figma designs, responsive frontend build, CMS integration, and 3 months post-launch support."
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Key Deliverables</label>
                <textarea
                  value={deliverables} onChange={(e) => setDeliverables(e.target.value)}
                  rows={3} className={FIELD_CLS + " resize-none"}
                  placeholder="List your main outputs — e.g. Figma design system, Next.js frontend, CMS setup, deployment, handover docs."
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Team Composition (optional)</label>
                <input value={team} onChange={(e) => setTeam(e.target.value)} className={FIELD_CLS} placeholder="e.g. 1 lead designer, 1 frontend developer, 0.5 project manager" />
              </div>
              <div>
                <label className={LABEL_CLS}>Special Requirements / Notes (optional)</label>
                <textarea
                  value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)}
                  rows={3} className={FIELD_CLS + " resize-none"}
                  placeholder="Any special terms, client-specific requirements, tech stack preferences, brand guidelines, etc."
                />
              </div>
            </div>
          )}

          {/* Step 3 — Terms + Variables */}
          {step === 2 && (
            <form id="generate-form" onSubmit={generate} className="space-y-5">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">Contract Terms</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLS}>Payment Schedule</label>
                    <select value={payment} onChange={(e) => setPayment(e.target.value)} className={FIELD_CLS}>
                      {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Notice Period</label>
                    <select value={notice} onChange={(e) => setNotice(e.target.value)} className={FIELD_CLS}>
                      {NOTICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLS}>Late Payment Clause</label>
                  <select value={latePayment} onChange={(e) => setLatePayment(e.target.value)} className={FIELD_CLS}>
                    {LATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {template.variables.length > 0 && (
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider mb-0.5">Template Variables</p>
                    <p className="text-xs text-[var(--fg-muted)]">AI fills any blank fields automatically.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
                  <AlertTriangle size={14} className="shrink-0" />
                  {error}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-color)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <ArrowLeft size={14} />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 ? !step1Valid : !step2Valid}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              Next
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              form="generate-form"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}50` }}
            >
              <Sparkles size={14} />
              Generate Contract
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create template modal ─────────────────────────────────────────────────────

function CreateTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: SOWTemplate) => void }) {
  const [form, setForm] = useState({
    name:               "",
    sowType:            "fixed-price" as SowType,
    description:        "",
    useCaseDescription: "",
  });
  const [building, setBuilding] = useState(false);
  const [error,    setError]    = useState("");

  const FIELD_CLS = "w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30";
  const LABEL_CLS = "text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)] block mb-1.5";

  async function build(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.useCaseDescription.trim()) return;
    setBuilding(true);
    setError("");

    try {
      const res  = await fetch("/api/templates/build", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.template);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build template. Try again.");
      setBuilding(false);
    }
  }

  if (building) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-base)]/90 backdrop-blur-md">
        <div className="text-center space-y-5 max-w-sm mx-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full animate-ping opacity-20 bg-[#0072E5]" />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,114,229,0.12)", border: "2px solid rgba(0,114,229,0.3)" }}>
              <Sparkles size={28} style={{ color: "#0072E5" }} className="animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--fg-primary)]">Building your template</p>
            <p className="text-sm text-[var(--fg-muted)] mt-1">AI is generating sections and clauses…</p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#0072E5]" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--border-subtle)]" style={{ borderTopColor: "#0072E5", borderTopWidth: 3 }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(0,114,229,0.12)" }}>
              <Sparkles size={16} style={{ color: "#0072E5" }} />
            </div>
            <div>
              <p className="text-xs text-[var(--fg-muted)]">AI-powered</p>
              <h2 className="text-base font-bold text-[var(--fg-primary)]">Create Custom Template</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={build} className="p-6 space-y-4">
          <div>
            <label className={LABEL_CLS}>Template Name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={FIELD_CLS} placeholder="e.g. E-Commerce Development SOW" />
          </div>
          <div>
            <label className={LABEL_CLS}>SOW Type <span className="text-red-500">*</span></label>
            <select value={form.sowType} onChange={(e) => setForm((p) => ({ ...p, sowType: e.target.value as SowType }))} className={FIELD_CLS}>
              <option value="fixed-price">Fixed-Price</option>
              <option value="performance-based">Performance-Based</option>
              <option value="loe">Level of Effort (LOE)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Short Description</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={FIELD_CLS} placeholder="One-line summary of this template's purpose" />
          </div>
          <div>
            <label className={LABEL_CLS}>Describe your use case <span className="text-red-500">*</span></label>
            <textarea
              value={form.useCaseDescription}
              onChange={(e) => setForm((p) => ({ ...p, useCaseDescription: e.target.value }))}
              required rows={4} className={FIELD_CLS + " resize-none"}
              placeholder="Describe the type of project this template is for — the services provided, typical client type, key deliverables, and any important terms you want included. The more detail you provide, the better the AI-generated sections."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              <AlertTriangle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={!form.name.trim() || !form.useCaseDescription.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-40 btn-brand"
            >
              <Sparkles size={14} />
              Build with AI
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({
  template, onUse, onDelete,
}: {
  template:  SOWTemplate;
  onUse:     (t: SOWTemplate) => void;
  onDelete?: (id: string) => void;
}) {
  const isSeed = template.id.startsWith("seed-");
  const color  = SOW_COLORS[template.sowType];

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden hover:shadow-lg hover:border-[rgba(0,114,229,0.25)] transition-all duration-200 group flex flex-col">
      {/* Color stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <SowTypeBadge type={template.sowType} />
              {template.usageCount > 0 && (
                <span className="text-[9px] font-mono text-[var(--fg-muted)] flex items-center gap-0.5">
                  <Clock size={9} />
                  Used {template.usageCount}×
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-[var(--fg-primary)] group-hover:text-[#75D8FC] transition-colors leading-snug">
              {template.title}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed line-clamp-2">
              {template.description}
            </p>
          </div>
          {!isSeed && onDelete && (
            <button
              onClick={() => onDelete(template.id)}
              className="shrink-0 p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Section chips */}
        <div className="flex flex-wrap gap-1.5">
          {template.sections.slice(0, 5).map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border"
              style={{
                color:            RISK_COLOR[s.riskLevel],
                backgroundColor:  `${RISK_COLOR[s.riskLevel]}10`,
                borderColor:      `${RISK_COLOR[s.riskLevel]}25`,
              }}
            >
              {CLAUSE_LABEL[s.clauseType] ?? s.clauseType.replace("_", " ")}
            </span>
          ))}
          {template.sections.length > 5 && (
            <span className="text-[9px] text-[var(--fg-muted)] px-1.5 py-1">
              +{template.sections.length - 5} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] mt-auto">
          <span className="text-xs text-[var(--fg-muted)]">
            {template.sections.length} section{template.sections.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-[var(--fg-muted)]">·</span>
          <span className="text-xs text-[var(--fg-muted)]">
            {template.variables.length} variable{template.variables.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => onUse(template)}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: color, boxShadow: `0 0 0 0 ${color}` }}
          >
            <Play size={10} />
            Use template
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [customTemplates, setCustomTemplates] = useState<SOWTemplate[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [generating,      setGenerating]      = useState<SOWTemplate | null>(null);
  const [creating,        setCreating]        = useState(false);
  const [filter,          setFilter]          = useState<SowType | "all">("all");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setCustomTemplates(d.templates ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteTemplate(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setCustomTemplates((p) => p.filter((t) => t.id !== id));
  }

  const allTemplates = [...SEED_TEMPLATES, ...customTemplates];

  const visible = filter === "all"
    ? allTemplates
    : allTemplates.filter((t) => t.sowType === filter);

  const sowTypes: Array<{ type: SowType | "all"; label: string; count: number }> = [
    { type: "all",               label: "All",         count: allTemplates.length },
    { type: "fixed-price",       label: "Fixed-Price", count: allTemplates.filter(t => t.sowType === "fixed-price").length },
    { type: "performance-based", label: "Performance", count: allTemplates.filter(t => t.sowType === "performance-based").length },
    { type: "loe",               label: "LOE",         count: allTemplates.filter(t => t.sowType === "loe").length },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)] tracking-tight">SOW Templates</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            AI writes a complete, signed-ready contract from your inputs in seconds.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium btn-brand shrink-0"
        >
          <Sparkles size={14} />
          Build with AI
        </button>
      </div>

      {/* How it works strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { Icon: FileText,  color: "#0072E5", title: "Pick a template",    desc: "Choose from 4 agency-ready SOW templates or build your own." },
          { Icon: Sparkles,  color: "#8b5cf6", title: "Describe your work", desc: "Tell the AI your scope, deliverables, terms, and client details." },
          { Icon: Shield,    color: "#10b981", title: "Contract ready",     desc: "GPT-4o writes the full SOW with risk-scored clauses in ~30s." },
        ].map(({ Icon, color, title, desc }) => (
          <div key={title} className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
              <Icon size={14} style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--fg-primary)]">{title}</p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {sowTypes.map(({ type, label, count }) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
            style={
              filter === type
                ? { backgroundColor: "#0072E5", color: "#fff", borderColor: "#0072E5" }
                : { color: "var(--fg-muted)", borderColor: "var(--border-color)", backgroundColor: "var(--surface-elevated)" }
            }
          >
            {label}
            <span
              className="ml-1.5 text-[9px] font-mono"
              style={{ opacity: filter === type ? 0.8 : 0.6 }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--fg-muted)] py-8">
          <Loader2 size={16} className="animate-spin" />
          Loading templates…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUse={setGenerating}
              onDelete={deleteTemplate}
            />
          ))}

          {/* Build your own */}
          <button
            onClick={() => setCreating(true)}
            className="rounded-2xl border-2 border-dashed border-[var(--border-color)] p-5 flex flex-col items-center justify-center gap-3 text-center min-h-[200px] hover:border-[#0072E5] hover:bg-[rgba(0,114,229,0.03)] transition-all group"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ backgroundColor: "rgba(0,114,229,0.1)" }}
            >
              <Sparkles size={18} style={{ color: "#0072E5" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--fg-primary)]">Build custom template</p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed max-w-[180px] mx-auto">
                Describe your use case — AI generates sections and clauses
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full"
              style={{ color: "#0072E5", backgroundColor: "rgba(0,114,229,0.1)" }}
            >
              <Sparkles size={10} />
              Build with AI
            </span>
          </button>
        </div>
      )}

      {/* Modals */}
      {generating && (
        <GenerateModal template={generating} onClose={() => setGenerating(null)} />
      )}
      {creating && (
        <CreateTemplateModal
          onClose={() => setCreating(false)}
          onCreated={(t) => setCustomTemplates((p) => [t, ...p])}
        />
      )}
    </div>
  );
}
