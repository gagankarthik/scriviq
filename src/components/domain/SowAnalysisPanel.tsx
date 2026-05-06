"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle2, XCircle, Lightbulb, Users,
  Wand2, Gauge, RefreshCw, Loader2, ChevronDown, ChevronUp,
  MessageSquareWarning, FileQuestion, Zap,
} from "lucide-react";
import type { SowAnalysis, SowVaguePhrase, MissingClause, RaciEntry, SowQaFlag, SowCoachingTip } from "@/lib/mock-data";

// ── Score ring ────────────────────────────────────────────────────────────────

const ScoreRing = ({ score }: { score: number }) => {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const ringColor = score >= 80
    ? "border-emerald-500 dark:border-emerald-400"
    : score >= 60
    ? "border-amber-500 dark:border-amber-400"
    : "border-red-500 dark:border-red-400";

  return (
    <div className={`w-16 h-16 rounded-full border-4 ${ringColor} flex items-center justify-center shrink-0`}>
      <span className="text-lg font-bold font-mono" style={{ color }}>{score}</span>
    </div>
  );
};

// ── Tone badge ────────────────────────────────────────────────────────────────

const TONE_STYLES: Record<SowAnalysis["tone"], { label: string; cls: string }> = {
  professional: { label: "Professional", cls: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40" },
  collaborative: { label: "Collaborative", cls: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40" },
  aggressive: { label: "Aggressive", cls: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40" },
  vague: { label: "Vague", cls: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40" },
  balanced: { label: "Balanced", cls: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40" },
};

const ToneBadge = ({ tone }: { tone: SowAnalysis["tone"] }) => {
  const s = TONE_STYLES[tone];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ── Risk badge (inline) ───────────────────────────────────────────────────────

const RiskPill = ({ level }: { level: "high" | "medium" | "low" }) => {
  const map = {
    high:   "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40",
    medium: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
    low:    "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${map[level]}`}>
      {level}
    </span>
  );
};

// ── Importance badge ──────────────────────────────────────────────────────────

const ImportanceBadge = ({ importance }: { importance: MissingClause["importance"] }) => {
  const map = {
    critical:    "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40",
    recommended: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
    optional:    "bg-[var(--surface-subtle)] text-[var(--fg-muted)] border-[var(--border-subtle)]",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${map[importance]}`}>
      {importance}
    </span>
  );
};

// ── Section header ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, count }: { icon: React.FC<{ size?: number; className?: string }>; title: string; count?: number }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={15} className="text-[var(--fg-muted)]" />
    <h3 className="text-sm font-semibold text-[var(--fg-primary)]">{title}</h3>
    {count !== undefined && (
      <span className="text-xs font-mono text-[var(--fg-muted)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
        {count}
      </span>
    )}
  </div>
);

// ── Vague phrase card ─────────────────────────────────────────────────────────

const VaguePhraseCard = ({ item }: { item: SowVaguePhrase }) => (
  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden border-l-4"
    style={{ borderLeftColor: item.riskImpact === "high" ? "#ef4444" : item.riskImpact === "medium" ? "#f59e0b" : "#10b981" }}>
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-1">
            {item.clauseContext}
          </p>
          <p className="text-sm font-medium text-[var(--fg-primary)] italic">
            &ldquo;{item.phrase}&rdquo;
          </p>
        </div>
        <RiskPill level={item.riskImpact} />
      </div>
      <p className="text-xs text-[var(--fg-secondary)] mb-3 leading-relaxed">{item.reason}</p>
      <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg p-3">
        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 mt-0.5">Replace with:</span>
        <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">{item.suggestion}</p>
      </div>
    </div>
  </div>
);

// ── Missing clause row ────────────────────────────────────────────────────────

const MissingClauseRow = ({ clause }: { clause: MissingClause }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-[var(--surface-subtle)] transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <XCircle size={14} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--fg-primary)]">{clause.name}</p>
            <p className="text-xs text-[var(--fg-secondary)] mt-0.5 line-clamp-1">{clause.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ImportanceBadge importance={clause.importance} />
          {open ? <ChevronUp size={13} className="text-[var(--fg-muted)]" /> : <ChevronDown size={13} className="text-[var(--fg-muted)]" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mt-3 mb-1.5">Example text</p>
          <p className="text-xs text-[var(--fg-secondary)] leading-relaxed font-mono bg-[var(--surface-subtle)] border border-[var(--border-subtle)] rounded-lg p-3">
            {clause.example}
          </p>
        </div>
      )}
    </div>
  );
};

// ── RACI table ────────────────────────────────────────────────────────────────

const RaciTable = ({ rows }: { rows: RaciEntry[] }) => {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[var(--border-color)] rounded-xl">
        <Users size={28} className="text-[var(--fg-muted)] mb-3" />
        <p className="text-sm font-medium text-[var(--fg-secondary)]">No role assignments detected</p>
        <p className="text-xs text-[var(--fg-muted)] mt-1">The document doesn&apos;t contain a clear roles &amp; responsibilities section.</p>
      </div>
    );
  }

  const headers = ["Task", "Responsible", "Accountable", "Consulted", "Informed"];

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[var(--surface-subtle)]">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] border-b border-[var(--border-color)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-[var(--surface-subtle)]" : ""}>
              <td className="px-3 py-2.5 font-medium text-[var(--fg-primary)] border-b border-[var(--border-subtle)]">{row.task}</td>
              <td className="px-3 py-2.5 text-[var(--fg-secondary)] border-b border-[var(--border-subtle)]">{row.responsible}</td>
              <td className="px-3 py-2.5 text-[var(--fg-secondary)] border-b border-[var(--border-subtle)]">{row.accountable}</td>
              <td className="px-3 py-2.5 text-[var(--fg-muted)] border-b border-[var(--border-subtle)]">{row.consulted}</td>
              <td className="px-3 py-2.5 text-[var(--fg-muted)] border-b border-[var(--border-subtle)]">{row.informed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Coaching tip card ─────────────────────────────────────────────────────────

const CoachingTipCard = ({ tip }: { tip: SowCoachingTip }) => (
  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-4">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <Lightbulb size={13} className="text-amber-500 shrink-0" />
        <p className="text-sm font-semibold text-[var(--fg-primary)]">{tip.clauseTitle}</p>
      </div>
      <RiskPill level={tip.riskLevel} />
    </div>
    <div className="space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mb-1">Why it&apos;s risky</p>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">{tip.why}</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: "#0072E5" }}>How to fix it</p>
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{tip.fix}</p>
      </div>
    </div>
  </div>
);

// ── QA flag row ───────────────────────────────────────────────────────────────

const QaFlagRow = ({ flag }: { flag: SowQaFlag }) => {
  const isError = flag.severity === "error";
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
      isError
        ? "bg-red-50 dark:bg-red-950/15 border-red-200 dark:border-red-800/30"
        : "bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30"
    }`}>
      {isError
        ? <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
        : <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${isError ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
          {flag.message}
        </p>
        {flag.context && (
          <p className="text-[10px] font-mono text-[var(--fg-muted)] mt-1 italic">&ldquo;{flag.context}&rdquo;</p>
        )}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
        isError ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
      }`}>
        {flag.type.replace(/_/g, " ")}
      </span>
    </div>
  );
};

// ── Empty / CTA state ─────────────────────────────────────────────────────────

const AnalysisCta = ({ onRun, loading }: { onRun: () => void; loading: boolean }) => (
  <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-elevated)] p-10 text-center">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
      style={{ backgroundColor: "rgba(0,114,229,0.1)", border: "1px solid rgba(0,114,229,0.2)" }}>
      <Gauge size={24} style={{ color: "#0072E5" }} />
    </div>
    <h3 className="text-base font-bold text-[var(--fg-primary)] mb-2">SOW Intelligence Analysis</h3>
    <p className="text-sm text-[var(--fg-secondary)] mb-2 max-w-md mx-auto leading-relaxed">
      Get a deep AI-powered quality audit of this SOW — including vague language flags, missing clause detection, a RACI matrix, and a 0–100 health score.
    </p>
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-6 text-xs text-[var(--fg-muted)]">
      {["Vague language detection", "Missing clause check", "RACI matrix extraction", "AI coaching tips", "Health score"].map((f) => (
        <li key={f} className="flex items-center gap-1.5">
          <CheckCircle2 size={11} className="text-emerald-500" />
          {f}
        </li>
      ))}
    </ul>
    <button
      onClick={onRun}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
      style={{ backgroundColor: "#0072E5", color: "#fff" }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
      {loading ? "Analysing…" : "Run SOW Analysis"}
    </button>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

const AnalysisSkeleton = () => (
  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-[var(--surface-subtle)]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[var(--surface-subtle)] rounded w-1/3" />
        <div className="h-3 bg-[var(--surface-subtle)] rounded w-1/4" />
      </div>
    </div>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-20 bg-[var(--surface-subtle)] rounded-xl" />
    ))}
  </div>
);

// ── Main panel ────────────────────────────────────────────────────────────────

export const SowAnalysisPanel = ({
  contractId,
  initialAnalysis,
}: {
  contractId: string;
  initialAnalysis: SowAnalysis | null;
}) => {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SowAnalysis | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/sow-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Analysis request failed");
      const data = await res.json() as { analysis: SowAnalysis };
      setAnalysis(data.analysis);
      router.refresh();
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AnalysisSkeleton />;

  if (!analysis) return <AnalysisCta onRun={runAnalysis} loading={loading} />;

  const presentClauseTypes = ["Change Control Procedures", "Acceptance Testing Criteria", "IP Ownership",
    "Liability Cap", "Termination Notice", "Payment Terms", "Governing Law",
    "Dispute Resolution", "Confidentiality", "Force Majeure"];

  const missingNames = new Set(analysis.missingClauses.map((m) => m.name));
  const presentNames = presentClauseTypes.filter((n) => !missingNames.has(n));

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-elevated)] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-[var(--border-color)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ScoreRing score={analysis.healthScore} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-[var(--fg-primary)]">SOW Intelligence</h2>
                <ToneBadge tone={analysis.tone} />
              </div>
              <p className="text-xs text-[var(--fg-muted)] mb-2">{analysis.toneNotes}</p>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { val: analysis.vagueCount, label: "vague phrases", color: analysis.vagueCount > 0 ? "#f59e0b" : "var(--fg-muted)" },
                  { val: analysis.criticalMissingCount, label: "critical missing", color: analysis.criticalMissingCount > 0 ? "#ef4444" : "var(--fg-muted)" },
                  { val: analysis.coachingTips.length, label: "coaching tips", color: "#0072E5" },
                  { val: analysis.qaFlags.length, label: "QA flags", color: analysis.qaFlags.filter((f) => f.severity === "error").length > 0 ? "#ef4444" : "var(--fg-muted)" },
                ].map(({ val, label, color }) => (
                  <span key={label} className="text-xs font-mono font-semibold" style={{ color }}>
                    {val} {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-[10px] text-[var(--fg-muted)] font-mono hidden sm:block">
              {new Date(analysis.analysedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Re-analyse
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <XCircle size={12} /> {error}
          </p>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* ── Section 1: Vague Language ───────────────────────────────────── */}
        {analysis.vaguePhrases.length > 0 && (
          <section>
            <SectionHeader icon={AlertTriangle} title="Vague Language" count={analysis.vaguePhrases.length} />
            <div className="space-y-3">
              {analysis.vaguePhrases.map((phrase) => (
                <VaguePhraseCard key={phrase.id} item={phrase} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 2: Missing Clauses ──────────────────────────────────── */}
        <section>
          <SectionHeader icon={FileQuestion} title="Clause Coverage" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Present */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500" /> Present ({presentNames.length})
              </p>
              <div className="space-y-1.5">
                {presentNames.map((name) => (
                  <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                    <span className="text-xs text-emerald-800 dark:text-emerald-300">{name}</span>
                  </div>
                ))}
                {presentNames.length === 0 && (
                  <p className="text-xs text-[var(--fg-muted)] italic">No standard clauses detected</p>
                )}
              </div>
            </div>
            {/* Missing summary */}
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mb-2 flex items-center gap-1.5">
                <XCircle size={11} className="text-red-500" /> Missing ({analysis.missingClauses.length})
              </p>
              <div className="space-y-1.5">
                {analysis.missingClauses.map((m) => (
                  <div key={m.name} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                    <span className="text-xs text-[var(--fg-secondary)]">{m.name}</span>
                    <ImportanceBadge importance={m.importance} />
                  </div>
                ))}
                {analysis.missingClauses.length === 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={11} /> All standard clauses present
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Expandable missing clause details */}
          {analysis.missingClauses.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--fg-muted)] mb-2">Missing clause details</p>
              {analysis.missingClauses.map((clause) => (
                <MissingClauseRow key={clause.name} clause={clause} />
              ))}
            </div>
          )}
        </section>

        {/* ── Section 3: RACI Matrix ──────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Users} title="RACI Matrix" count={analysis.raciMatrix.length} />
          <RaciTable rows={analysis.raciMatrix} />
        </section>

        {/* ── Section 4: AI Coaching Tips ─────────────────────────────────── */}
        {analysis.coachingTips.length > 0 && (
          <section>
            <SectionHeader icon={Lightbulb} title="AI Coaching Tips" count={analysis.coachingTips.length} />
            <div className="space-y-3">
              {analysis.coachingTips.map((tip, i) => (
                <CoachingTipCard key={i} tip={tip} />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 5: QA Flags ─────────────────────────────────────────── */}
        {analysis.qaFlags.length > 0 && (
          <section>
            <SectionHeader icon={MessageSquareWarning} title="QA Flags" count={analysis.qaFlags.length} />
            <div className="space-y-2">
              {analysis.qaFlags.map((flag, i) => (
                <QaFlagRow key={i} flag={flag} />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty coaching tips notice ───────────────────────────────────── */}
        {analysis.coachingTips.length === 0 && analysis.qaFlags.length === 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-800/30">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              No high-risk coaching issues or QA flags detected — this SOW is in good shape.
            </p>
          </div>
        )}

        {/* ── Wand footer ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Wand2 size={11} className="text-[var(--fg-muted)]" />
          <p className="text-[10px] text-[var(--fg-muted)]">
            AI analysis generated by GPT-4o. Review all suggestions before applying to final contract.
          </p>
        </div>
      </div>
    </div>
  );
};
