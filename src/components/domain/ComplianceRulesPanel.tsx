"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import type { ComplianceRule, ClauseType, ComplianceRuleCondition, ComplianceSeverity } from "@/lib/mock-data";
import { clauseTypeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const CLAUSE_TYPES: Array<ClauseType | "any"> = [
  "any", "payment_milestone", "renewal_auto", "ip_ownership", "termination_notice",
  "liability_cap", "confidentiality", "penalty_clause", "acceptance_criteria",
  "governing_law", "dispute_resolution", "force_majeure", "scope_change", "other",
];

const CONDITIONS: Array<{ value: ComplianceRuleCondition; label: string }> = [
  { value: "must_contain",     label: "Must contain text"     },
  { value: "must_not_contain", label: "Must not contain text" },
  { value: "must_exist",       label: "Clause must exist"     },
  { value: "must_not_exist",   label: "Clause must not exist" },
];

const FIELD_CLS = "w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--fg-primary)] focus:outline-none focus:border-[#0072E5] focus:ring-1 focus:ring-[#0072E5]/30";

function RuleRow({ rule, onDelete }: { rule: ComplianceRule; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const isError = rule.severity === "error";

  async function remove() {
    setDeleting(true);
    await fetch(`/api/compliance/rules/${rule.id}`, { method: "DELETE" });
    onDelete();
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--border-subtle)] last:border-0">
      <div className="mt-0.5 shrink-0">
        {isError
          ? <ShieldAlert size={14} className="text-red-500 dark:text-red-400" />
          : <ShieldCheck size={14} className="text-amber-500 dark:text-amber-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-[var(--fg-primary)]">{rule.name}</p>
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
            style={isError
              ? { color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }
              : { color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.2)" }
            }
          >
            {rule.severity}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--fg-muted)]">
            {rule.clauseType === "any" ? "any clause" : clauseTypeLabel(rule.clauseType as ClauseType)}
          </span>
        </div>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5">
          {CONDITIONS.find((c) => c.value === rule.condition)?.label}
          {rule.value && <> — <span className="font-mono text-[var(--fg-secondary)]">&ldquo;{rule.value}&rdquo;</span></>}
        </p>
        {rule.description && <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">{rule.description}</p>}
      </div>
      <button
        onClick={remove}
        disabled={deleting}
        className="shrink-0 p-1 rounded text-[var(--fg-muted)] hover:text-red-500 transition-colors disabled:opacity-50"
      >
        {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
}

function AddRuleForm({ onSaved }: { onSaved: (rule: ComplianceRule) => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name:        "",
    description: "",
    clauseType:  "any" as ClauseType | "any",
    condition:   "must_contain" as ComplianceRuleCondition,
    value:       "",
    severity:    "warning" as ComplianceSeverity,
  });

  const needsValue = form.condition === "must_contain" || form.condition === "must_not_contain";

  function field<K extends keyof typeof form>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value as typeof form[K] }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/compliance/rules", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      onSaved(data.rule);
      setForm({ name: "", description: "", clauseType: "any", condition: "must_contain", value: "", severity: "warning" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-muted)]">New rule</p>
      <input placeholder="Rule name *" required value={form.name} onChange={field("name")} className={FIELD_CLS} />
      <textarea placeholder="Description (optional)" value={form.description} onChange={field("description")} rows={2}
        className={`${FIELD_CLS} resize-none`} />
      <div className="grid grid-cols-2 gap-2">
        <select value={form.clauseType} onChange={field("clauseType")} className={FIELD_CLS}>
          {CLAUSE_TYPES.map((t) => (
            <option key={t} value={t}>{t === "any" ? "Any clause" : clauseTypeLabel(t as ClauseType)}</option>
          ))}
        </select>
        <select value={form.condition} onChange={field("condition")} className={FIELD_CLS}>
          {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      {needsValue && (
        <input placeholder='Text to check for, e.g. "limitation of liability"' value={form.value} onChange={field("value")} className={FIELD_CLS} />
      )}
      <div className="flex items-center gap-3">
        <select value={form.severity} onChange={field("severity")} className={`${FIELD_CLS} flex-1`}>
          <option value="warning">Warning</option>
          <option value="error">Error (blocks approval)</option>
        </select>
        <Button type="submit" loading={saving} size="sm" glow>
          <Plus size={12} />
          Add rule
        </Button>
      </div>
    </form>
  );
}

export function ComplianceRulesPanel() {
  const [rules,   setRules]   = useState<ComplianceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compliance/rules")
      .then((r) => r.json())
      .then((d) => setRules(d.rules ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <p className="text-sm font-semibold text-[var(--fg-primary)]">Compliance Rules</p>
        <p className="text-xs text-[var(--fg-muted)] mt-0.5 leading-relaxed">
          Rules run automatically on every extracted clause. Violations are flagged inline on each clause.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] px-5 py-2">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] py-4">
            <Loader2 size={13} className="animate-spin" />
            Loading rules…
          </div>
        ) : rules.length === 0 ? (
          <p className="text-xs text-[var(--fg-muted)] py-4">No rules yet. Add one below.</p>
        ) : (
          rules.map((r) => (
            <RuleRow
              key={r.id}
              rule={r}
              onDelete={() => setRules((p) => p.filter((x) => x.id !== r.id))}
            />
          ))
        )}
        <AddRuleForm onSaved={(rule) => setRules((p) => [...p, rule])} />
      </div>
    </div>
  );
}
