import OpenAI from "openai";
import {
  dbPutClause,
  dbUpdateContract,
  dbPutActivity,
  dbListComplianceRules,
} from "@/lib/aws/contracts";
import { computeRiskScore } from "@/lib/utils";
import type { Clause, RiskLevel, ClauseStatus, SowType } from "@/lib/mock-data";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Prompts ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert contract analyst for scriviq, a contract management platform used by digital agencies. Your job is to extract every legally and financially significant clause from a contract document with maximum precision.

━━━ CRITICAL DATE RULE ━━━
Extract ALL dates EXACTLY as they appear in the document and convert them to ISO 8601 (YYYY-MM-DD).
- "January 15, 2023" → "2023-01-15"
- "15/01/2023" → "2023-01-15"
- "Q2 2023" → use the last day of that quarter: "2023-06-30"
- "30 days after signing" → null (relative, cannot resolve)
DO NOT skip or omit dates because they are in the past. The contract's dates are historically accurate and must be preserved.

━━━ CLAUSE TYPES (use the most specific match) ━━━
payment_milestone  — any payment, invoice, deposit, fee, or compensation clause with amounts or due dates
renewal_auto       — automatic renewal, evergreen, rollover, or opt-out window clauses
ip_ownership       — intellectual property, copyright, work-for-hire, license grants, moral rights
termination_notice — termination rights, cancellation, notice periods, right to cure
liability_cap      — limitation of liability, indemnification caps, warranty disclaimers, exclusions
confidentiality    — NDA, non-disclosure, confidential information, trade secrets
penalty_clause     — late fees, liquidated damages, breach penalties, interest on late payment, service credits
acceptance_criteria— approval processes, sign-off, revision limits, deliverable acceptance, UAT
governing_law      — jurisdiction, choice of law, venue selection
dispute_resolution — arbitration, mediation, escalation, litigation procedures
force_majeure      — acts of God, unforeseen events, excused performance, pandemic clauses
scope_change       — change orders, scope creep, variation requests, out-of-scope work
other              — any other clause with legal, financial, or operational significance

━━━ RISK SCORING — be specific, not generic ━━━
HIGH risk (always requires a specific riskReason):
  • Unlimited or uncapped liability / indemnification
  • IP ownership assigns agency's background IP, tools, or methods to client
  • Termination without cause with less than 14 days notice
  • Payment terms longer than 60 days
  • Penalty clauses with no maximum cap
  • Non-compete or non-solicitation clauses
  • Unilateral right to modify scope without compensation
  • Auto-renewal with opt-out window shorter than 30 days

MEDIUM risk (requires riskReason):
  • Standard IP assignment of deliverables only (client gets final work, agency keeps methods)
  • Payment terms 31–60 days
  • Auto-renewal with 30–60 day opt-out window
  • Liability capped at 1× contract value
  • Mandatory arbitration (restricts litigation rights)
  • Termination for convenience with 14–29 days notice
  • Change order process required (standard but adds friction)

LOW risk:
  • Liability capped at total fees paid
  • Standard 30-day termination notice
  • Payment within 30 days
  • Standard confidentiality (mutual, 1–3 years)
  • Standard governing law clause
  • Force majeure with standard scope

━━━ EXTRACTION RULES ━━━
1. Be EXHAUSTIVE — extract every clause that has financial, legal, or operational significance, no matter how minor
2. rawText must be the VERBATIM quoted text from the document — do not paraphrase or truncate
3. summary must explain what this means FOR THE AGENCY (obligations, risks, rights) in 2–3 clear sentences
4. title must be specific: not "Payment Clause" but "Phase 2 Payment — Development Sprint ($24,000)"
5. amount: extract the numeric value only (48000, not "$48,000")
6. noticeDays: convert to integer days (e.g. "30 days" → 30, "2 weeks" → 14)
7. For payment_milestone clauses: always try to extract both amount AND dueDate
8. Never assign riskLevel "high" or "medium" without a specific riskReason

━━━ OUTPUT FORMAT ━━━
Return ONLY a JSON object: { "clauses": [ ... ] }
No markdown, no code fences, no explanation text.

Each clause object:
{
  "id": "clause-{contractId}-{nn}",
  "contractId": "{contractId}",
  "type": "{type}",
  "title": "{specific, descriptive title}",
  "summary": "{2–3 sentences: agency obligations, rights, and risks}",
  "rawText": "{exact verbatim text from document}",
  "dueDate": "{YYYY-MM-DD or null}",
  "amount": {number or null},
  "noticeDays": {integer or null},
  "riskLevel": "low|medium|high",
  "riskReason": "{required for medium/high — specific explanation, null for low}",
  "status": "active",
  "tags": ["{2–5 lowercase kebab-case tags}"]
}`;

const NORMALIZE_SYSTEM_PROMPT = `You are a contract normalization AI for scriviq.

Extract all legally and financially significant clauses from the contract text.
IMPORTANT: Rewrite each clause's rawText into clean, plain-English standard language — preserve all legal meaning but remove legalese, run-on sentences, and ambiguity.

Follow ALL the same date, amount, type, risk, and extraction rules as standard extraction.
Return ONLY a JSON object: { "clauses": [...] } — same schema as standard extraction but rawText is the normalized rewrite.`;

// ── Date / amount validation ──────────────────────────────────────────────────

function sanitizeDate(val: unknown): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  // Accept YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : trimmed;
  }
  // Try parsing free-form
  const d = new Date(trimmed);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1990 && d.getFullYear() < 2100) {
    return d.toISOString().split("T")[0];
  }
  return null;
}

function sanitizeAmount(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

function sanitizeNoticeDays(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isInteger(n) && n > 0 && n < 3650 ? n : null;
}

const VALID_TYPES = new Set([
  "payment_milestone", "renewal_auto", "ip_ownership", "termination_notice",
  "liability_cap", "confidentiality", "penalty_clause", "acceptance_criteria",
  "governing_law", "dispute_resolution", "force_majeure", "scope_change", "other",
]);

// ── Compliance check ──────────────────────────────────────────────────────────

function runComplianceCheck(clauses: Clause[], rules: Awaited<ReturnType<typeof dbListComplianceRules>>): Clause[] {
  if (!rules.length) return clauses;
  return clauses.map((clause) => {
    const flags: string[] = [];
    for (const rule of rules) {
      const applies = rule.clauseType === "any" || rule.clauseType === clause.type;
      if (!applies) continue;
      const text = (clause.rawText ?? "").toLowerCase();
      const val  = (rule.value ?? "").toLowerCase();
      let triggered = false;
      switch (rule.condition) {
        case "must_contain":     triggered = !!val && !text.includes(val); break;
        case "must_not_contain": triggered = !!val && text.includes(val);  break;
        case "must_exist":       triggered = !clause.rawText?.trim();      break;
        case "must_not_exist":   triggered = !!clause.rawText?.trim();     break;
      }
      if (triggered) {
        flags.push(`[${rule.severity}] ${rule.name}${rule.value ? `: missing "${rule.value}"` : ""}`);
      }
    }
    return flags.length ? { ...clause, complianceFlags: flags } : clause;
  });
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function extractAndSaveClauses(
  workspace:    string,
  contractId:   string,
  contractText: string,
  contractMeta: { title: string; clientName: string; contractValue: number | null; expiryDate: string | null },
  sowType?:  SowType,
  normalize?: boolean
): Promise<{ clauses: Clause[]; riskScore: RiskLevel; clauseCount: number }> {
  await dbUpdateContract(workspace, contractId, { status: "processing" });

  const systemPrompt = normalize ? NORMALIZE_SYSTEM_PROMPT : SYSTEM_PROMPT;

  // Chunk large contracts — GPT has a context limit
  const MAX_TEXT_CHARS = 28_000;
  const truncatedText = contractText.length > MAX_TEXT_CHARS
    ? contractText.slice(0, MAX_TEXT_CHARS) + "\n\n[Document truncated for processing — first 28,000 characters analysed]"
    : contractText;

  const userMessage = [
    `Contract ID: ${contractId}`,
    `Contract Title: ${contractMeta.title}`,
    `Client: ${contractMeta.clientName}`,
    `Contract Value: ${contractMeta.contractValue ? `$${contractMeta.contractValue.toLocaleString()}` : "Not specified"}`,
    `Expiry / End Date: ${contractMeta.expiryDate ?? "Not specified"}`,
    `SOW Type: ${sowType ?? "Not specified"}`,
    ``,
    `━━━ CONTRACT TEXT ━━━`,
    truncatedText,
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model:           "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage  },
    ],
    response_format: { type: "json_object" },
    temperature:     0,
    max_tokens:      8192,
  });

  const rawJson = completion.choices[0].message.content ?? "{}";
  let parsed: { clauses?: unknown[] };
  try { parsed = JSON.parse(rawJson); }
  catch { parsed = { clauses: [] }; }

  // Validate and clean every clause
  let clauses: Clause[] = ((parsed.clauses ?? []) as Partial<Clause>[]).map(
    (cl, i): Clause => ({
      id:         typeof cl.id === "string" && cl.id.startsWith("clause-") ? cl.id : `clause-${contractId}-${String(i + 1).padStart(2, "0")}`,
      contractId,
      type:       VALID_TYPES.has(cl.type ?? "") ? cl.type! : "other",
      title:      typeof cl.title === "string" && cl.title.trim() ? cl.title.trim() : `Clause ${i + 1}`,
      summary:    typeof cl.summary === "string" ? cl.summary.trim() : "",
      rawText:    typeof cl.rawText === "string" ? cl.rawText.trim() : "",
      dueDate:    sanitizeDate(cl.dueDate),
      amount:     sanitizeAmount(cl.amount),
      noticeDays: sanitizeNoticeDays(cl.noticeDays),
      riskLevel:  (["low", "medium", "high"] as const).includes(cl.riskLevel as never) ? (cl.riskLevel as RiskLevel) : "low",
      riskReason: typeof cl.riskReason === "string" && cl.riskReason.trim() ? cl.riskReason.trim() : null,
      status:     "active" as ClauseStatus,
      tags:       Array.isArray(cl.tags) ? (cl.tags as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 5) : [],
    })
  );

  // Enforce: medium/high must have riskReason; low must not
  clauses = clauses.map((cl) => {
    if (cl.riskLevel !== "low" && !cl.riskReason) {
      return { ...cl, riskLevel: "medium" as RiskLevel, riskReason: "Review recommended — terms may require negotiation." };
    }
    if (cl.riskLevel === "low") {
      return { ...cl, riskReason: null };
    }
    return cl;
  });

  // Performance-based SOW: suppress risk on scope_change
  if (sowType === "performance-based") {
    clauses = clauses.map((cl) =>
      cl.type === "scope_change" ? { ...cl, riskLevel: "low" as RiskLevel, riskReason: null } : cl
    );
  }

  // Compliance rules
  const rules = await dbListComplianceRules(workspace).catch(() => []);
  clauses = runComplianceCheck(clauses, rules);

  await Promise.all(clauses.map((cl) => dbPutClause(workspace, cl)));

  const score = computeRiskScore(clauses);
  const riskScore: RiskLevel = score >= 67 ? "high" : score >= 34 ? "medium" : "low";

  // Build a meaningful AI summary
  const highClauses   = clauses.filter((cl) => cl.riskLevel === "high");
  const paymentTotal  = clauses
    .filter((cl) => cl.type === "payment_milestone")
    .reduce((s, cl) => s + (cl.amount ?? 0), 0);
  const paymentCount  = clauses.filter((cl) => cl.type === "payment_milestone").length;

  let aiSummary = `${clauses.length} clause${clauses.length !== 1 ? "s" : ""} extracted`;
  if (paymentCount > 0 && paymentTotal > 0) {
    aiSummary += ` · ${paymentCount} payment milestone${paymentCount !== 1 ? "s" : ""} totalling $${paymentTotal.toLocaleString()}`;
  }
  aiSummary += ` · Overall risk: ${riskScore.toUpperCase()}`;
  if (highClauses.length > 0) {
    aiSummary += `. High-risk items: ${highClauses.slice(0, 3).map((cl) => cl.title).join("; ")}`;
  } else {
    aiSummary += ". No critical risk issues found.";
  }

  await dbUpdateContract(workspace, contractId, {
    status:      "ready",
    clauseCount: clauses.length,
    riskScore,
    aiSummary,
  });

  await dbPutActivity(workspace, {
    id:          `activity-${Date.now()}`,
    type:        "extraction_complete",
    description: `${contractMeta.title} — ${clauses.length} clauses extracted, risk: ${riskScore.toUpperCase()}`,
    contractId,
    timestamp:   new Date().toISOString(),
  }).catch(() => {});

  return { clauses, riskScore, clauseCount: clauses.length };
}
