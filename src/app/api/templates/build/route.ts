import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbPutTemplate } from "@/lib/aws/contracts";
import type { SOWTemplate, SowType, ClauseType, RiskLevel } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CLAUSE_TYPES: ClauseType[] = [
  "payment_milestone", "renewal_auto", "ip_ownership", "termination_notice",
  "liability_cap", "confidentiality", "penalty_clause", "acceptance_criteria",
  "governing_law", "dispute_resolution", "force_majeure", "scope_change", "other",
];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      name:        string;
      sowType:     SowType;
      description: string;
      useCaseDescription: string;
    };

    if (!body.name?.trim() || !body.useCaseDescription?.trim()) {
      return Response.json({ error: "Name and use case description are required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert contract lawyer specialising in digital agency agreements.
Create a reusable SOW template structure for the described use case.

TEMPLATE DETAILS:
- Name: ${body.name}
- Type: ${body.sowType}
- Description: ${body.description}
- Use Case: ${body.useCaseDescription}

Generate a JSON object with this exact structure:
{
  "sections": [
    {
      "id": "s1",
      "clauseType": "<one of: ${CLAUSE_TYPES.join(", ")}>",
      "title": "<section title>",
      "content": "<template text with {{variableName}} for customisable values>",
      "required": true,
      "riskLevel": "low" | "medium" | "high"
    }
  ],
  "variables": ["<variable names used in content, without braces>"]
}

RULES:
- Include 4–8 sections covering the most important clauses for this use case
- Use {{camelCase}} for variable names (e.g. {{clientName}}, {{contractValue}}, {{deliverables}})
- Always include payment, scope/acceptance, and termination sections
- Mark sections with meaningful risk levels (IP transfer = high, payment = low-medium, etc.)
- Return ONLY valid JSON, no markdown fences, no explanation`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    let parsed: { sections: SOWTemplate["sections"]; variables: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return Response.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    const now      = new Date().toISOString();
    const template: SOWTemplate = {
      id:          `tmpl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title:       body.name.trim(),
      description: body.description.trim() || body.useCaseDescription.trim().slice(0, 120),
      sowType:     body.sowType,
      sections:    (parsed.sections ?? []).map((s, i) => ({
        id:         s.id ?? `s${i + 1}`,
        clauseType: CLAUSE_TYPES.includes(s.clauseType as ClauseType) ? s.clauseType as ClauseType : "other",
        title:      s.title ?? `Section ${i + 1}`,
        content:    s.content ?? "",
        required:   s.required ?? true,
        riskLevel:  (["low", "medium", "high"].includes(s.riskLevel as string) ? s.riskLevel : "low") as RiskLevel,
      })),
      variables:   Array.isArray(parsed.variables) ? parsed.variables : [],
      createdAt:   now,
      updatedAt:   now,
      usageCount:  0,
    };

    await dbPutTemplate(session.workspace, template);
    return Response.json({ template }, { status: 201 });
  } catch (err) {
    console.error("POST /api/templates/build", err);
    return Response.json({ error: "Failed to build template" }, { status: 500 });
  }
}
