import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbListClauses } from "@/lib/aws/contracts";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const REPORT_PROMPT = `You are a project analyst for a digital agency called scriviq.

Analyze the following contract clauses and extract structured project information for a visual report.

Return ONLY a valid JSON object with this exact schema — no markdown, no code fences:
{
  "projectSummary": "2-3 sentence plain-English overview of what this project entails",
  "estimatedDuration": "e.g. 6 months or null if not determinable",
  "phases": [
    {
      "id": "phase-1",
      "name": "Phase name",
      "description": "What happens in this phase",
      "budget": 0,
      "startDate": "ISO 8601 date or null",
      "endDate": "ISO 8601 date or null",
      "deliverables": ["deliverable 1", "deliverable 2"]
    }
  ],
  "wbs": [
    {
      "id": "wbs-1",
      "task": "Task name",
      "phase": "Phase name this task belongs to",
      "effort": "e.g. 40 hours, 2 weeks, or null",
      "notes": "any relevant notes or null"
    }
  ],
  "resources": [
    {
      "role": "e.g. Project Manager, UX Designer",
      "responsibilities": "brief description of what they do",
      "allocation": "e.g. full-time, 20 hrs/week, or null"
    }
  ],
  "integrations": [
    {
      "name": "e.g. Salesforce, Stripe, AWS",
      "purpose": "why it is being integrated",
      "type": "e.g. CRM, Payment, Infrastructure, Analytics"
    }
  ],
  "keyDates": [
    {
      "event": "descriptive event name",
      "date": "ISO 8601 date",
      "type": "milestone|deadline|payment|review"
    }
  ]
}

If a section has no extractable data, use an empty array [].
Be exhaustive but accurate — only include information actually present in the clauses.`;

export interface ReportData {
  projectSummary:    string;
  estimatedDuration: string | null;
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

    const clausesText = clauses
      .map((c) => `[${c.type.toUpperCase()}] ${c.title}\n${c.summary}\n${c.rawText ? `Source: ${c.rawText.slice(0, 400)}` : ""}`)
      .join("\n\n---\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: REPORT_PROMPT },
        {
          role: "user",
          content: `Contract Title: ${contract.title}\nClient: ${contract.clientName}\nContract Value: ${contract.contractValue ? `$${contract.contractValue}` : "Not specified"}\nExpiry: ${contract.expiryDate ?? "Not specified"}\nSOW Type: ${contract.sowType ?? "Not specified"}\n\n=== CLAUSES ===\n\n${clausesText || "No clauses extracted yet."}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.05,
      max_tokens: 3000,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    let reportData: ReportData;
    try { reportData = JSON.parse(raw) as ReportData; }
    catch { reportData = { projectSummary: "", estimatedDuration: null, phases: [], wbs: [], resources: [], integrations: [], keyDates: [] }; }

    // Merge payment clause dates into keyDates if GPT missed them
    const paymentDates = clauses
      .filter((c) => c.type === "payment_milestone" && c.dueDate)
      .map((c) => ({ event: c.title, date: c.dueDate!, type: "payment" as const }));

    const existingDates = new Set(reportData.keyDates.map((d) => d.date));
    for (const pd of paymentDates) {
      if (!existingDates.has(pd.date)) {
        reportData.keyDates.push(pd);
        existingDates.add(pd.date);
      }
    }

    reportData.keyDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return Response.json({ contract, clauses, reportData });
  } catch (err) {
    console.error("GET /api/contracts/[id]/report", err);
    return Response.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
