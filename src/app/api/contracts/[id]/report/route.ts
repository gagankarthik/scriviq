import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbListClauses } from "@/lib/aws/contracts";
import type { Clause } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportData {
  projectSummary:    string;
  estimatedDuration: string | null;
  contractPeriod:    string | null;
  phases:            Phase[];
  wbs:               WbsItem[];
  resources:         Resource[];
  integrations:      Integration[];
  keyDates:          KeyDate[];
}

export interface Phase {
  id:           string;
  name:         string;
  description:  string;
  budget:       number | null;
  startDate:    string | null;
  endDate:      string | null;
  deliverables: string[];
}

export interface WbsItem {
  id:     string;
  task:   string;
  phase:  string;
  effort: string | null;
  notes:  string | null;
}

export interface Resource {
  role:             string;
  responsibilities: string;
  allocation:       string | null;
}

export interface Integration {
  name:    string;
  purpose: string;
  type:    string;
}

export interface KeyDate {
  event: string;
  date:  string;
  type:  "milestone" | "deadline" | "payment" | "review";
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildReportPrompt(contractYear: number | null): string {
  const yearNote = contractYear
    ? `NOTE: This is a contract document from ${contractYear}. All dates, phases, and timelines in the document are from that year. Analyse the document's structure and content faithfully — do not skip information because the dates are in the past. The report must reflect the ACTUAL contract terms as written.`
    : `NOTE: Analyse the document's structure and content faithfully regardless of dates.`;

  return `You are an expert project analyst for scriviq, a contract management platform for digital agencies.

${yearNote}

Your task: Analyse the provided contract clauses and produce structured project intelligence for a visual report.

━━━ EXTRACTION RULES ━━━
1. PHASES — Identify project phases from: payment milestone titles, acceptance criteria, scope descriptions, and clause tags. If milestones say "Phase 1 — Discovery", "Phase 2 — Development" etc., extract those as phases. Group related tasks and payments under each phase. If no phases are named, infer logical phases from the work described (e.g. Discovery, Design, Development, QA, Launch).
2. WBS — Break each phase into concrete tasks. Extract from: deliverables in acceptance criteria, scope descriptions, payment milestone descriptions. Each WBS item should be a specific, actionable task.
3. RESOURCES — Extract named roles/team members from: resource clauses, responsibility assignments, deliverable owners. Common agency roles: Project Manager, UX Designer, Developer, QA Engineer, Account Manager.
4. INTEGRATIONS — Extract any technology systems, platforms, APIs, or third-party tools mentioned: CRMs, payment processors, cloud platforms, CMSs, analytics tools.
5. KEY DATES — Extract every date mentioned in the clauses — payments, milestones, deadlines, reviews. Convert all dates to ISO 8601 (YYYY-MM-DD). Preserve dates from the document exactly.
6. CONTRACT PERIOD — Identify the start and end date of the contract engagement.
7. ESTIMATED DURATION — Calculate from dates in the clauses, e.g. "6 months (Jan–Jun 2023)".
8. PROJECT SUMMARY — 3–4 sentences: what the project is, who the parties are, total value, key deliverables.

━━━ OUTPUT FORMAT ━━━
Return ONLY a valid JSON object — no markdown, no code fences:

{
  "projectSummary": "3-4 sentence description of the project, parties, scope, and value",
  "estimatedDuration": "e.g. '6 months (January–June 2023)' or null",
  "contractPeriod": "e.g. '2023-01-01 to 2023-06-30' or null",
  "phases": [
    {
      "id": "phase-1",
      "name": "Phase 1 — Discovery & Strategy",
      "description": "What work is performed in this phase",
      "budget": 12000,
      "startDate": "2023-01-15",
      "endDate": "2023-02-28",
      "deliverables": ["Brand strategy document", "User research report", "Wireframes"]
    }
  ],
  "wbs": [
    {
      "id": "wbs-1",
      "task": "Stakeholder interviews and requirements gathering",
      "phase": "Phase 1 — Discovery & Strategy",
      "effort": "40 hours",
      "notes": "Up to 5 stakeholder interviews included"
    }
  ],
  "resources": [
    {
      "role": "UX Designer",
      "responsibilities": "User research, wireframing, and prototyping",
      "allocation": "50% for 8 weeks"
    }
  ],
  "integrations": [
    {
      "name": "Salesforce CRM",
      "purpose": "Lead management integration for the client's sales team",
      "type": "CRM"
    }
  ],
  "keyDates": [
    {
      "event": "Phase 1 Kickoff",
      "date": "2023-01-15",
      "type": "milestone"
    }
  ]
}

Use empty arrays [] for sections with genuinely no extractable data. Be thorough — prefer more items over fewer.`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeDate(val: unknown): string | null {
  if (!val || typeof val !== "string") return null;
  const t = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return isNaN(new Date(t).getTime()) ? null : t;
  }
  const d = new Date(t);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1990 && d.getFullYear() < 2100) {
    return d.toISOString().split("T")[0];
  }
  return null;
}

function formatClausesForGpt(clauses: Clause[]): string {
  return clauses.map((c, i) => {
    const lines = [
      `--- CLAUSE ${i + 1}: ${c.title} [${c.type}] [risk:${c.riskLevel}] ---`,
      `Summary: ${c.summary}`,
    ];
    if (c.amount)     lines.push(`Amount: $${c.amount.toLocaleString()}`);
    if (c.dueDate)    lines.push(`Due date: ${c.dueDate}`);
    if (c.noticeDays) lines.push(`Notice: ${c.noticeDays} days`);
    if (c.tags?.length) lines.push(`Tags: ${c.tags.join(", ")}`);
    if (c.rawText)    lines.push(`Raw text:\n${c.rawText.slice(0, 800)}`);
    return lines.join("\n");
  }).join("\n\n");
}

function inferContractYear(clauses: Clause[]): number | null {
  const dates = clauses
    .map((c) => c.dueDate)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getFullYear())
    .filter((y) => y > 1990 && y < 2100);
  if (!dates.length) return null;
  // Most common year
  const counts = dates.reduce<Record<number, number>>((acc, y) => { acc[y] = (acc[y] ?? 0) + 1; return acc; }, {});
  return Number(Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0]);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const [contract, clauses] = await Promise.all([
      dbGetContract(session.workspace, id),
      dbListClauses(session.workspace, id),
    ]);

    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    const contractYear = inferContractYear(clauses);
    const clausesText  = formatClausesForGpt(clauses);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildReportPrompt(contractYear) },
        {
          role: "user",
          content: [
            `Contract Title:  ${contract.title}`,
            `Client:          ${contract.clientName}`,
            `Contract Value:  ${contract.contractValue ? `$${contract.contractValue.toLocaleString()}` : "Not specified"}`,
            `Expiry Date:     ${contract.expiryDate ?? "Not specified"}`,
            `SOW Type:        ${contract.sowType ?? "Not specified"}`,
            `Total Clauses:   ${clauses.length}`,
            ``,
            `━━━ EXTRACTED CLAUSES ━━━`,
            clausesText || "No clauses extracted yet.",
          ].join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      temperature:     0,
      max_tokens:      6000,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    let reportData: ReportData;
    try {
      const parsed = JSON.parse(raw) as Partial<ReportData>;
      reportData = {
        projectSummary:    typeof parsed.projectSummary === "string" ? parsed.projectSummary : "",
        estimatedDuration: typeof parsed.estimatedDuration === "string" ? parsed.estimatedDuration : null,
        contractPeriod:    typeof parsed.contractPeriod === "string" ? parsed.contractPeriod : null,
        phases:            Array.isArray(parsed.phases) ? parsed.phases : [],
        wbs:               Array.isArray(parsed.wbs) ? parsed.wbs : [],
        resources:         Array.isArray(parsed.resources) ? parsed.resources : [],
        integrations:      Array.isArray(parsed.integrations) ? parsed.integrations : [],
        keyDates:          Array.isArray(parsed.keyDates) ? parsed.keyDates : [],
      };
    } catch {
      reportData = { projectSummary: "", estimatedDuration: null, contractPeriod: null, phases: [], wbs: [], resources: [], integrations: [], keyDates: [] };
    }

    // Merge all clause dates the GPT may have missed, deduplicated
    const allClauseDates: KeyDate[] = clauses
      .filter((c) => c.dueDate)
      .map((c) => ({
        event: c.title,
        date:  c.dueDate!,
        type:  (c.type === "payment_milestone" ? "payment"
              : c.type === "renewal_auto"      ? "review"
              : c.type === "acceptance_criteria"? "milestone"
              : "deadline") as KeyDate["type"],
      }));

    const seen = new Set(reportData.keyDates.map((d) => `${d.date}::${d.event}`));
    for (const kd of allClauseDates) {
      const key = `${kd.date}::${kd.event}`;
      if (!seen.has(key)) {
        reportData.keyDates.push(kd);
        seen.add(key);
      }
    }

    // Validate and sort dates
    reportData.keyDates = reportData.keyDates
      .map((d) => ({ ...d, date: sanitizeDate(d.date) }))
      .filter((d): d is KeyDate => d.date !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return Response.json({ contract, clauses, reportData });
  } catch (err) {
    console.error("GET /api/contracts/[id]/report", err);
    return Response.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
