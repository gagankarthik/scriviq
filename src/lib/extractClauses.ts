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

const SYSTEM_PROMPT = `You are a contract analysis AI for a digital agency called scriviq.

Analyze the provided contract text and extract ALL legally and financially significant clauses.

Return a JSON object with a "clauses" array. Each clause object must have:
- id: string (format: "clause-<contractId>-<nn>", e.g. "clause-abc123-01")
- contractId: string (use the contractId provided)
- type: one of: payment_milestone | renewal_auto | ip_ownership | termination_notice | liability_cap | confidentiality | penalty_clause | acceptance_criteria | governing_law | dispute_resolution | force_majeure | scope_change | other
- title: string (concise clause name, e.g. "Phase 1 Payment — Design Discovery")
- summary: string (2-3 sentence plain-English summary of what this means for the agency)
- rawText: string (the exact quoted clause text from the contract)
- dueDate: string | null (ISO 8601 date if there is a deadline, e.g. payment due date)
- amount: number | null (dollar amount if applicable)
- noticeDays: number | null (notice period in days if applicable)
- riskLevel: "low" | "medium" | "high"
- riskReason: string | null (1-2 sentences explaining risk, required for medium/high)
- status: "active"
- tags: string[] (2-5 relevant tags like ["payment", "milestone", "phase-1"])

Be exhaustive. Extract every clause that has financial, legal, or operational significance.
Risk scoring: HIGH = immediate action required / unusual terms; MEDIUM = standard but watch; LOW = normal standard terms.`;

const NORMALIZE_SYSTEM_PROMPT = `You are a contract normalization AI for scriviq.

Analyze the provided contract text and extract ALL legally and financially significant clauses.
IMPORTANT: Rewrite each clause's rawText to conform to our standard schema — clean, structured language without changing legal meaning.

Return a JSON object with a "clauses" array. Each clause object must have:
- id: string (format: "clause-<contractId>-<nn>")
- contractId: string
- type: one of: payment_milestone | renewal_auto | ip_ownership | termination_notice | liability_cap | confidentiality | penalty_clause | acceptance_criteria | governing_law | dispute_resolution | force_majeure | scope_change | other
- title: string
- summary: string (2-3 sentence plain-English summary)
- rawText: string (NORMALIZED version — clean, standardized clause text preserving all legal meaning)
- dueDate: string | null
- amount: number | null
- noticeDays: number | null
- riskLevel: "low" | "medium" | "high"
- riskReason: string | null
- status: "active"
- tags: string[]`;

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
        case "must_contain":      triggered = !!val && !text.includes(val); break;
        case "must_not_contain":  triggered = !!val && text.includes(val);  break;
        case "must_exist":        triggered = !clause.rawText?.trim();      break;
        case "must_not_exist":    triggered = !!clause.rawText?.trim();     break;
      }
      if (triggered) {
        flags.push(`[${rule.severity}] ${rule.name}${rule.value ? `: missing "${rule.value}"` : ""}`);
      }
    }
    return flags.length ? { ...clause, complianceFlags: flags } : clause;
  });
}

export async function extractAndSaveClauses(
  workspace: string,
  contractId: string,
  contractText: string,
  contractMeta: { title: string; clientName: string; contractValue: number | null; expiryDate: string | null },
  sowType?: SowType,
  normalize?: boolean
): Promise<{ clauses: Clause[]; riskScore: RiskLevel; clauseCount: number }> {
  await dbUpdateContract(workspace, contractId, { status: "processing" });

  const systemPrompt = normalize ? NORMALIZE_SYSTEM_PROMPT : SYSTEM_PROMPT;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Contract ID: ${contractId}\nContract Title: ${contractMeta.title}\nClient: ${contractMeta.clientName}\nContract Value: ${contractMeta.contractValue ? `$${contractMeta.contractValue}` : "Not specified"}\nExpiry Date: ${contractMeta.expiryDate ?? "Not specified"}\n\nContract Text:\n${contractText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: normalize ? 0.05 : 0.1,
    max_tokens: 4000,
  });

  const rawJson = completion.choices[0].message.content ?? "{}";
  let parsed: { clauses?: Clause[] };
  try { parsed = JSON.parse(rawJson); }
  catch { parsed = { clauses: [] }; }

  let clauses: Clause[] = (parsed.clauses ?? []).map((cl: Partial<Clause>, i: number): Clause => ({
    id:         cl.id ?? `clause-${contractId}-${String(i + 1).padStart(2, "0")}`,
    contractId,
    type:       cl.type ?? "other",
    title:      cl.title ?? `Clause ${i + 1}`,
    summary:    cl.summary ?? "",
    rawText:    cl.rawText ?? "",
    dueDate:    cl.dueDate ?? null,
    amount:     cl.amount ?? null,
    noticeDays: cl.noticeDays ?? null,
    riskLevel:  cl.riskLevel ?? "low",
    riskReason: cl.riskReason ?? null,
    status:     "active" as ClauseStatus,
    tags:       cl.tags ?? [],
  }));

  // Performance-based SOW: suppress risk on scope_change clauses
  if (sowType === "performance-based") {
    clauses = clauses.map((cl) =>
      cl.type === "scope_change" ? { ...cl, riskLevel: "low", riskReason: null } : cl
    );
  }

  // Run compliance rules
  const rules = await dbListComplianceRules(workspace).catch(() => []);
  clauses = runComplianceCheck(clauses, rules);

  await Promise.all(clauses.map((cl) => dbPutClause(workspace, cl)));

  const riskScore: RiskLevel = computeRiskScore(clauses) >= 67 ? "high" : computeRiskScore(clauses) >= 34 ? "medium" : "low";

  const topRisk  = clauses.filter((cl) => cl.riskLevel === "high").slice(0, 3);
  const aiSummary = topRisk.length
    ? `Extracted ${clauses.length} clauses. Key risks: ${topRisk.map((cl) => cl.title).join(", ")}. Overall risk: ${riskScore.toUpperCase()}.`
    : `Extracted ${clauses.length} clauses. Overall risk: ${riskScore.toUpperCase()}. No critical issues found.`;

  await dbUpdateContract(workspace, contractId, {
    status:      "ready",
    clauseCount: clauses.length,
    riskScore,
    aiSummary,
  });

  await dbPutActivity(workspace, {
    id:          `activity-${Date.now()}`,
    type:        "extraction_complete",
    description: `${contractMeta.title} extracted ${clauses.length} clauses — risk: ${riskScore.toUpperCase()}`,
    contractId,
    timestamp:   new Date().toISOString(),
  }).catch(() => {});

  return { clauses, riskScore, clauseCount: clauses.length };
}
