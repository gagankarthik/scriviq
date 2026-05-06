import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbListClauses, dbGetSowAnalysis, dbPutSowAnalysis } from "@/lib/aws/contracts";
import type { SowAnalysis, SowVaguePhrase, MissingClause, RaciEntry, SowQaFlag, SowCoachingTip } from "@/lib/mock-data";
import type { Clause } from "@/lib/mock-data";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert SOW (Statement of Work) analyst for scriviq, a contract intelligence platform.

Your job: Perform a deep quality analysis of the provided SOW document and return structured JSON.

━━━ VAGUE LANGUAGE DETECTION ━━━
Identify 3–8 vague or ambiguous phrases that create contractual risk. Look for:
- "ongoing support", "reasonable efforts", "as needed", "timely manner", "implementation assistance"
- "best efforts", "reasonable time", "appropriate resources", "industry standard", "prompt response"
- Any phrase that lacks measurable criteria, timelines, or clear scope boundaries
For each phrase: quote it verbatim, explain why it's problematic, and provide a concrete improved rewrite.

━━━ MISSING CLAUSE CHECK ━━━
Check for these 10 required clause types and flag which are MISSING:
1. Change Control Procedures
2. Acceptance Testing Criteria
3. IP Ownership
4. Liability Cap
5. Termination Notice
6. Payment Terms
7. Governing Law
8. Dispute Resolution
9. Confidentiality
10. Force Majeure
Classify each missing clause as: critical (legal/financial exposure), recommended (best practice), or optional (nice to have).
Provide a short example text for each missing clause.

━━━ RACI MATRIX ━━━
Extract 3–8 tasks from the roles/responsibilities or deliverables sections.
For each task, identify: who is Responsible, Accountable, Consulted, Informed.
Use role names (e.g. "Project Manager", "Client", "Developer") not personal names.
If a role is unclear, use "TBD". If genuinely no RACI info exists, return an empty array.

━━━ QA FLAGS ━━━
Identify quality issues:
- date_inconsistency: dates that contradict each other (e.g. end date before start date)
- undefined_acronym: acronyms used without definition (e.g. "SLA", "UAT", "MVP")
- missing_reference: references to exhibits/schedules/appendices that are not included
- grammar: significant grammatical errors that affect meaning
- style: inconsistent formatting, mixed numbering styles
Classify each as error (affects enforceability) or warning (best practice issue).

━━━ COACHING TIPS ━━━
For high-risk and medium-risk clauses: generate specific coaching advice.
Each tip must have: the clause title, its risk level, WHY it's risky (1-2 sentences), and HOW to fix it (specific rewrite or action).
Generate 2–5 coaching tips focused on the most impactful issues.

━━━ HEALTH SCORE ━━━
Calculate a 0–100 quality score starting at 100:
- Each vague phrase: -3 points
- Each missing CRITICAL clause: -10 points
- Each missing RECOMMENDED clause: -5 points
- Each high-risk clause: -8 points
- Each QA error: -5 points
- Each QA warning: -2 points
Minimum score: 0. Maximum: 100.

━━━ TONE ANALYSIS ━━━
Classify document tone as one of: professional, collaborative, aggressive, vague, balanced
Provide 1–2 sentences explaining the tone assessment.

━━━ OUTPUT FORMAT ━━━
Return ONLY valid JSON matching this exact structure:

{
  "healthScore": 72,
  "tone": "professional",
  "toneNotes": "The document uses formal language throughout...",
  "vaguePhrases": [
    {
      "id": "vp-1",
      "clauseContext": "Scope of Work",
      "phrase": "ongoing implementation support",
      "reason": "This phrase has no defined duration, frequency, or scope boundaries, making it impossible to determine what work is actually included.",
      "suggestion": "Provide up to 10 hours per month of post-launch technical support for 3 months following go-live, covering bug fixes and configuration changes only.",
      "riskImpact": "high"
    }
  ],
  "missingClauses": [
    {
      "name": "Change Control Procedures",
      "importance": "critical",
      "description": "Defines how scope changes are requested, evaluated, and approved.",
      "example": "Any changes to the agreed scope must be submitted via a Change Request Form. Changes exceeding $500 or 8 hours require written approval from both parties within 5 business days."
    }
  ],
  "raciMatrix": [
    {
      "task": "Requirements gathering and sign-off",
      "responsible": "Business Analyst",
      "accountable": "Project Manager",
      "consulted": "Client Stakeholders",
      "informed": "Development Team"
    }
  ],
  "qaFlags": [
    {
      "type": "undefined_acronym",
      "message": "Acronym 'UAT' used on page 3 without prior definition",
      "severity": "warning",
      "context": "The UAT phase will commence after..."
    }
  ],
  "coachingTips": [
    {
      "clauseTitle": "Liability Cap",
      "riskLevel": "high",
      "why": "The current liability clause does not specify a monetary cap, leaving the vendor exposed to unlimited damages claims.",
      "fix": "Add: 'Vendor's total liability under this agreement shall not exceed the total fees paid in the 3 months preceding the claim, up to a maximum of [CONTRACT VALUE].'"
    }
  ]
}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatClausesForPrompt(clauses: Clause[]): string {
  return clauses.map((c, i) => {
    const lines = [
      `--- CLAUSE ${i + 1}: ${c.title} [type:${c.type}] [risk:${c.riskLevel}] ---`,
      `Summary: ${c.summary}`,
    ];
    if (c.amount) lines.push(`Amount: $${c.amount.toLocaleString()}`);
    if (c.dueDate) lines.push(`Due date: ${c.dueDate}`);
    if (c.noticeDays) lines.push(`Notice: ${c.noticeDays} days`);
    if (c.tags?.length) lines.push(`Tags: ${c.tags.join(", ")}`);
    if (c.riskReason) lines.push(`Risk reason: ${c.riskReason}`);
    if (c.rawText) lines.push(`Raw text:\n${c.rawText.slice(0, 1000)}`);
    return lines.join("\n");
  }).join("\n\n");
}

function safeParseSowAnalysis(raw: string, contractId: string): SowAnalysis {
  const now = new Date().toISOString();
  const fallback: SowAnalysis = {
    contractId,
    analysedAt: now,
    healthScore: 50,
    tone: "balanced",
    toneNotes: "Analysis could not be completed.",
    vagueCount: 0,
    criticalMissingCount: 0,
    vaguePhrases: [],
    missingClauses: [],
    raciMatrix: [],
    qaFlags: [],
    coachingTips: [],
  };

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const vaguePhrases: SowVaguePhrase[] = Array.isArray(parsed.vaguePhrases)
      ? (parsed.vaguePhrases as SowVaguePhrase[]).filter(
          (v) => typeof v.phrase === "string" && typeof v.suggestion === "string"
        )
      : [];

    const missingClauses: MissingClause[] = Array.isArray(parsed.missingClauses)
      ? (parsed.missingClauses as MissingClause[]).filter(
          (m) => typeof m.name === "string"
        )
      : [];

    const raciMatrix: RaciEntry[] = Array.isArray(parsed.raciMatrix)
      ? (parsed.raciMatrix as RaciEntry[]).filter((r) => typeof r.task === "string")
      : [];

    const qaFlags: SowQaFlag[] = Array.isArray(parsed.qaFlags)
      ? (parsed.qaFlags as SowQaFlag[]).filter((f) => typeof f.message === "string")
      : [];

    const coachingTips: SowCoachingTip[] = Array.isArray(parsed.coachingTips)
      ? (parsed.coachingTips as SowCoachingTip[]).filter(
          (t) => typeof t.clauseTitle === "string" && typeof t.why === "string"
        )
      : [];

    const validTones = ["professional", "collaborative", "aggressive", "vague", "balanced"] as const;
    const rawTone = parsed.tone as string;
    const tone = validTones.includes(rawTone as typeof validTones[number])
      ? (rawTone as SowAnalysis["tone"])
      : "balanced";

    const healthScore = typeof parsed.healthScore === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.healthScore)))
      : 50;

    return {
      contractId,
      analysedAt: now,
      healthScore,
      tone,
      toneNotes: typeof parsed.toneNotes === "string" ? parsed.toneNotes : "",
      vagueCount: vaguePhrases.length,
      criticalMissingCount: missingClauses.filter((m) => m.importance === "critical").length,
      vaguePhrases,
      missingClauses,
      raciMatrix,
      qaFlags,
      coachingTips,
    };
  } catch {
    return fallback;
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const analysis = await dbGetSowAnalysis(session.workspace, id);
    return Response.json({ analysis });
  } catch (err) {
    console.error("GET /api/contracts/[id]/sow-analysis", err);
    return Response.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({})) as { text?: string };

    const [contract, clauses] = await Promise.all([
      dbGetContract(session.workspace, id),
      dbListClauses(session.workspace, id),
    ]);

    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    const clausesText = formatClausesForPrompt(clauses);
    const extraText = body.text?.trim() ?? "";

    const userContent = [
      `Contract Title: ${contract.title}`,
      `Client: ${contract.clientName}`,
      `Contract Value: ${contract.contractValue ? `$${contract.contractValue.toLocaleString()}` : "Not specified"}`,
      `Expiry Date: ${contract.expiryDate ?? "Not specified"}`,
      `SOW Type: ${contract.sowType ?? "Not specified"}`,
      `Total Clauses: ${clauses.length}`,
      ``,
      `━━━ EXTRACTED CLAUSES (${clauses.length}) ━━━`,
      clausesText || "No clauses extracted yet.",
      extraText ? `\n━━━ ADDITIONAL CONTRACT TEXT ━━━\n${extraText.slice(0, 8000)}` : "",
    ].filter(Boolean).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 5000,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const analysis = safeParseSowAnalysis(raw, id);

    await dbPutSowAnalysis(session.workspace, analysis);

    return Response.json({ analysis });
  } catch (err) {
    console.error("POST /api/contracts/[id]/sow-analysis", err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
